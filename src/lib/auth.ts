import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db/connect";
import User from "@/lib/db/models/User";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const emailInput = (credentials.email as string).toLowerCase().trim();
        const passwordInput = credentials.password as string;

        try {
          await connectDB();
        } catch {
          return null;
        }

        let user = null;
        try {
          user = await User.findOne({ email: emailInput });
        } catch {
          return null;
        }

        // Auto-bootstrap admin user on first login if no user exists yet
        if (!user) {
          const adminEmail = (process.env.ADMIN_EMAIL || "").toLowerCase().trim();
          const adminPassword = process.env.ADMIN_PASSWORD || "";

          if (emailInput === adminEmail && adminEmail && adminPassword && passwordInput === adminPassword) {
            try {
              const hashed = await bcrypt.hash(adminPassword, 12);
              user = await User.create({ name: "Admin", email: adminEmail, password: hashed, role: "admin" });
            } catch {
              return null;
            }
          }
        }

        if (!user) return null;

        const isValid = await bcrypt.compare(passwordInput, user.password);
        if (!isValid) return null;

        return { id: user._id.toString(), email: user.email, name: user.name, role: user.role };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
});
