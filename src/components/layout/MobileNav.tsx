"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileBarChart2, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { label: "Dashboard",  href: "/",             icon: LayoutDashboard },
  { label: "New",        href: "/analysis/new", icon: PlusCircle      },
  { label: "Analyses",   href: "/analysis",     icon: FileBarChart2   },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-background/95 backdrop-blur-md border-t border-border flex items-center">
      {items.map((item) => {
        const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        const isNew = item.href === "/analysis/new";
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex-1 flex flex-col items-center gap-1 py-3 transition-colors",
              isNew || isActive
                ? "text-[#F0B429]"
                : "text-muted-foreground"
            )}
          >
            {isNew ? (
              <div className="w-10 h-10 -mt-5 rounded-xl bg-[#F0B429] flex items-center justify-center shadow-lg shadow-[#F0B429]/20">
                <item.icon className="w-5 h-5 text-[#080808]" />
              </div>
            ) : (
              <item.icon className="w-4 h-4" />
            )}
            <span className={cn("font-mono text-[9px] uppercase tracking-widest", isNew && "mt-1")}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
