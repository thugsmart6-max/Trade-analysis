import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(value);
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function calculateRiskReward(
  buyZone: number,
  target1: number,
  stopLoss: number
): number {
  const reward = target1 - buyZone;
  const risk = buyZone - stopLoss;
  if (risk <= 0) return 0;
  return Math.round((reward / risk) * 100) / 100;
}

export function getTrendColor(trend: string): string {
  switch (trend) {
    case "bullish":
      return "text-emerald-500";
    case "bearish":
      return "text-rose-500";
    case "consolidation":
      return "text-amber-500";
    default:
      return "text-muted-foreground";
  }
}

export function getTrendBg(trend: string): string {
  switch (trend) {
    case "bullish":
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
    case "bearish":
      return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
    case "consolidation":
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export function getConfidenceBg(level: string): string {
  switch (level) {
    case "high":
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
    case "medium":
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
    case "low":
      return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/\s+/g, "-");
}

export function toNumber(val: unknown): number | undefined {
  if (val === "" || val === null || val === undefined) return undefined;
  const n = Number(val);
  return isNaN(n) ? undefined : n;
}
