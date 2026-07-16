"use client";

import { motion } from "framer-motion";
import {
  BarChart3, Calendar, TrendingUp, TrendingDown,
  Minus, CheckCircle2, FileEdit,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DashboardStats } from "@/actions/dashboard";

const CARDS = [
  { key: "total" as const,              label: "Total",        icon: BarChart3,    accent: "#8A8076" },
  { key: "todayCount" as const,         label: "Today",        icon: Calendar,     accent: "#F0B429" },
  { key: "bullishCount" as const,       label: "Bullish",      icon: TrendingUp,   accent: "#00D4AA" },
  { key: "bearishCount" as const,       label: "Bearish",      icon: TrendingDown, accent: "#FF4D6A" },
  { key: "consolidationCount" as const, label: "Consolidation",icon: Minus,        accent: "#FF8C42" },
  { key: "publishedCount" as const,     label: "Published",    icon: CheckCircle2, accent: "#00D4AA" },
  { key: "draftCount" as const,         label: "Drafts",       icon: FileEdit,     accent: "#8A8076" },
] as const;

export function StatsCardGrid({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-px bg-border border border-border rounded-xl overflow-hidden mb-4">
      {CARDS.map(({ key, label, icon: Icon, accent }, i) => (
        <motion.div
          key={key}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: i * 0.04 }}
          className="relative bg-card p-5 flex flex-col justify-between min-h-[110px] group hover:bg-accent/30 transition-colors"
        >
          {/* Accent top bar */}
          <div
            className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ backgroundColor: accent }}
          />

          <div className="flex items-center justify-between mb-3">
            <span className="text-muted-foreground/40 font-mono text-[10px] tracking-widest uppercase">
              {String(i + 1).padStart(2, "0")}
            </span>
            <Icon className="w-3.5 h-3.5" style={{ color: accent }} />
          </div>

          <div>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 + 0.15 }}
              className="hero-number font-display text-4xl font-extrabold text-foreground leading-none mb-1.5"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {stats[key].toLocaleString()}
            </motion.p>
            <p className="font-mono text-[#4A4640] text-[10px] font-medium uppercase tracking-widest">
              {label}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
