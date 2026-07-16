"use client";

import { signOut } from "next-auth/react";
import { Moon, Sun, LogOut, ChevronDown, Menu } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TopbarProps {
  userName?: string;
  userEmail?: string;
  onMenuClick?: () => void;
}

export function Topbar({ userName, userEmail, onMenuClick }: TopbarProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === "dark";

  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false });
  const dateStr = now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <header className="h-14 flex items-center justify-between px-4 md:px-6 border-b border-border bg-background/90 backdrop-blur-sm shrink-0">
      {/* Left */}
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuClick}
          className="md:hidden w-8 h-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Clock */}
        <div className="hidden sm:flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#00D4AA]" />
          <span className="text-muted-foreground font-mono text-[11px] tracking-widest uppercase">
            {dateStr} · {timeStr} IST
          </span>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1">
        {/* Theme toggle */}
        <button
          onClick={() => setTheme(isDark ? "light" : "dark")}
          aria-label="Toggle theme"
          className="w-8 h-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors overflow-hidden"
        >
          {mounted && (
            isDark
              ? <Sun className="w-3.5 h-3.5 transition-transform duration-300 rotate-0 scale-100" />
              : <Moon className="w-3.5 h-3.5 transition-transform duration-300 rotate-0 scale-100" />
          )}
        </button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-md px-2 py-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer">
            <div className="w-5 h-5 rounded-sm bg-[#F0B429]/20 flex items-center justify-center border border-[#F0B429]/30 shrink-0">
              <span className="text-[#F0B429] text-[9px] font-black">
                {(userName || "A").slice(0, 1).toUpperCase()}
              </span>
            </div>
            <span className="hidden sm:block text-xs font-medium max-w-24 truncate">
              {userName || "Admin"}
            </span>
            <ChevronDown className="w-3 h-3" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44 bg-card border-border">
            <div className="px-2 py-2">
              <p className="text-foreground text-xs font-medium truncate">{userName}</p>
              <p className="text-muted-foreground text-[10px] font-mono truncate mt-0.5">{userEmail}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-[#FF4D6A] focus:text-[#FF4D6A] cursor-pointer gap-2 text-xs"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
