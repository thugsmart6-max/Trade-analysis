"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, FileBarChart2, PlusCircle, ChevronLeft, ChevronRight, X, FlaskConical } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard",    href: "/",             icon: LayoutDashboard, index: "01" },
  { label: "All Analyses", href: "/analysis",     icon: FileBarChart2,   index: "02" },
  { label: "New Analysis", href: "/analysis/new", icon: PlusCircle,      index: "03" },
  { label: "Research",     href: "/research",     icon: FlaskConical,    index: "04" },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

function NavItems({ collapsed, onClose }: { collapsed: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex-1 py-4 space-y-0.5 px-2">
      {navItems.map((item) => {
        const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className={cn(
              "flex items-center gap-3 rounded-md px-2.5 py-3 transition-all duration-150 relative overflow-hidden",
              isActive
                ? "bg-[#F0B429]/10 text-[#F0B429]"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="nav-indicator"
                className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#F0B429] rounded-full"
              />
            )}
            {collapsed ? (
              <item.icon className="w-4 h-4 shrink-0 mx-auto" />
            ) : (
              <>
                <span className={cn("font-mono text-[10px] shrink-0 w-5", isActive ? "text-[#F0B429]/50" : "text-muted-foreground/40")}>
                  {item.index}
                </span>
                <item.icon className="w-4 h-4 shrink-0" />
                <span className="text-sm font-medium tracking-tight">{item.label}</span>
              </>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

function Logo({ collapsed }: { collapsed: boolean }) {
  return (
    <div className="flex items-center h-14 px-4 border-b border-border shrink-0">
      <div className="w-6 h-6 rounded-sm bg-[#F0B429] flex items-center justify-center shrink-0">
        <span className="text-[#080808] text-xs font-black leading-none">T</span>
      </div>
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            className="ml-3 overflow-hidden whitespace-nowrap"
          >
              <span className="font-display font-800 text-foreground text-base leading-none tracking-tight">Trade</span>
              <span className="font-display font-800 text-[#F0B429] text-base leading-none tracking-tight">Analysis</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatusFooter({ collapsed }: { collapsed: boolean }) {
  return (
    <AnimatePresence>
      {!collapsed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="px-4 pb-5 pt-3 border-t border-border"
        >
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00D4AA] animate-pulse" />
            <span className="text-muted-foreground font-mono text-[10px] tracking-widest uppercase">System Online</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* ── Desktop sidebar ─────────────────────────────── */}
      <motion.aside
        animate={{ width: collapsed ? 56 : 220 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="relative hidden md:flex flex-col h-full bg-background border-r border-border shrink-0 overflow-hidden"
      >
        <Logo collapsed={collapsed} />
        <NavItems collapsed={collapsed} />
        <StatusFooter collapsed={collapsed} />

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute top-1/2 -right-3 -translate-y-1/2 w-6 h-6 bg-card border border-border rounded-full flex items-center justify-center text-muted-foreground hover:text-[#F0B429] hover:border-[#F0B429]/30 transition-colors z-10"
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </motion.aside>

      {/* ── Mobile drawer ───────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onMobileClose}
              className="fixed inset-0 z-40 bg-black/70 md:hidden"
            />
            {/* Drawer */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="fixed left-0 top-0 bottom-0 z-50 w-64 flex flex-col bg-background border-r border-border md:hidden"
            >
              <div className="flex items-center justify-between h-14 px-4 border-b border-border shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-sm bg-[#F0B429] flex items-center justify-center">
                    <span className="text-[#080808] text-xs font-black">T</span>
                  </div>
                  <span className="font-display font-bold text-foreground text-base tracking-tight">
                    Trade<span className="text-[#F0B429]">Analysis</span>
                  </span>
                </div>
                <button
                  onClick={onMobileClose}
                  className="w-8 h-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <NavItems collapsed={false} onClose={onMobileClose} />
              <div className="px-4 pb-5 pt-3 border-t border-border">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00D4AA] animate-pulse" />
                  <span className="text-muted-foreground font-mono text-[10px] tracking-widest uppercase">System Online</span>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
