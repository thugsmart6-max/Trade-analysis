"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
type LoginData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginData) {
    setIsLoading(true);
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });
      if (result?.error) {
        toast.error("Invalid credentials");
      } else {
        toast.success("Welcome back");
        router.push("/");
        router.refresh();
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-[#080808] overflow-hidden">
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 border-r border-[#1a1a1a] relative">
        {/* Top label */}
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-[#F0B429]" />
          <span className="text-[#F0B429] font-mono text-xs tracking-[0.2em] uppercase">TradeAnalysis</span>
        </div>

        {/* Big hero text */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-[#4A4640] font-mono text-xs tracking-widest uppercase mb-6">
              Internal Dashboard / v2.0
            </p>
            <h1 className="font-display text-[#F5F0E8] text-6xl xl:text-7xl font-extrabold leading-[0.9] tracking-tight">
              Stock<br />
              <span className="text-[#F0B429]">Technical</span><br />
              Analysis
            </h1>
            <p className="mt-8 text-[#4A4640] text-sm leading-relaxed max-w-xs">
              Professional-grade market analysis tools for institutional research and decision making.
            </p>
          </motion.div>
        </div>

        {/* Bottom meta */}
        <div className="flex items-center justify-between">
          <span className="text-[#2a2622] font-mono text-xs">NSE · BSE · INDICES</span>
          <span className="text-[#2a2622] font-mono text-xs">
            {new Date().getFullYear()}
          </span>
        </div>

        {/* Decorative vertical line */}
        <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#F0B429]/20 to-transparent" />
      </div>

      {/* Right panel — form */}
      <div className="flex flex-col justify-center flex-1 px-6 md:px-12 lg:px-20">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-sm mx-auto"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div className="w-2 h-2 rounded-full bg-[#F0B429]" />
            <span className="font-display font-bold text-[#F0B429] text-base tracking-tight">TradeAnalysis</span>
          </div>

          <h2 className="text-[#F5F0E8] text-3xl font-bold tracking-tight mb-1">Sign in</h2>
          <p className="text-[#4A4640] text-sm mb-10">Authorized personnel only</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-[#8A8076] text-xs font-mono uppercase tracking-widest">
                Email
              </label>
              <Input
                type="email"
                placeholder="admin@example.com"
                autoComplete="email"
                className="h-12 bg-[#111111] border-[#2a2622] text-[#F5F0E8] placeholder:text-[#2a2622] focus:border-[#F0B429]/50 focus:ring-[#F0B429]/10 rounded-lg font-mono text-sm"
                {...register("email")}
              />
              {errors.email && <p className="text-[#FF4D6A] text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="block text-[#8A8076] text-xs font-mono uppercase tracking-widest">
                Password
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="h-12 bg-[#111111] border-[#2a2622] text-[#F5F0E8] placeholder:text-[#2a2622] focus:border-[#F0B429]/50 focus:ring-[#F0B429]/10 rounded-lg font-mono text-sm pr-10"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4A4640] hover:text-[#8A8076] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-[#FF4D6A] text-xs mt-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 mt-2 flex items-center justify-center gap-2 bg-[#F0B429] hover:bg-[#d4a025] text-[#080808] font-bold text-sm tracking-wide rounded-lg transition-all duration-200 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-[#2a2622] mt-8 font-mono">
            RESTRICTED ACCESS — AUTHORIZED USE ONLY
          </p>
        </motion.div>
      </div>
    </div>
  );
}
