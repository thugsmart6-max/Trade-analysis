"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { AnalysisListItem } from "@/types/analysis";
import { formatDate, formatCurrency } from "@/lib/utils";

interface RecentAnalysesProps {
  analyses: AnalysisListItem[];
}

const TrendPill = ({ trend }: { trend: string }) => {
  const map = {
    bullish:      { icon: TrendingUp,   color: "#00D4AA", bg: "rgba(0,212,170,0.1)",  label: "Bullish" },
    bearish:      { icon: TrendingDown, color: "#FF4D6A", bg: "rgba(255,77,106,0.1)", label: "Bearish" },
    consolidation:{ icon: Minus,        color: "#FF8C42", bg: "rgba(255,140,66,0.1)", label: "Consol." },
  };
  const t = map[trend as keyof typeof map] ?? map.consolidation;
  const Icon = t.icon;
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider"
      style={{ color: t.color, backgroundColor: t.bg }}
    >
      <Icon className="w-2.5 h-2.5" />
      {t.label}
    </span>
  );
};

export function RecentAnalyses({ analyses }: RecentAnalysesProps) {
  if (!analyses.length) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground text-sm font-mono">No analyses yet</p>
        <Link href="/analysis/new" className="text-[#F0B429] text-xs font-mono hover:underline mt-2 block">
          Create first analysis →
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header row */}
      <div className="grid grid-cols-12 gap-2 px-3 pb-2 border-b border-border">
        <span className="col-span-7 sm:col-span-4 text-[#2a2622] font-mono text-[10px] uppercase tracking-widest">Company</span>
        <span className="col-span-2 text-[#2a2622] font-mono text-[10px] uppercase tracking-widest hidden sm:block">Symbol</span>
        <span className="col-span-2 text-[#2a2622] font-mono text-[10px] uppercase tracking-widest hidden md:block">Price</span>
        <span className="col-span-2 text-[#2a2622] font-mono text-[10px] uppercase tracking-widest hidden lg:block">Date</span>
        <span className="col-span-5 sm:col-span-2 text-[#2a2622] font-mono text-[10px] uppercase tracking-widest">Trend</span>
      </div>

      <div className="divide-y divide-[#111111]">
        {analyses.map((analysis, i) => (
          <motion.div
            key={analysis._id}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <Link href={`/analysis/${analysis._id}`}>
              <div className="grid grid-cols-12 gap-2 px-3 py-3 hover:bg-accent/50 transition-colors group items-center cursor-pointer">
                <div className="col-span-7 sm:col-span-4 flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-sm bg-[#111111] border border-border flex items-center justify-center shrink-0">
                    <span className="text-[9px] font-black text-[#F0B429]">
                      {analysis.nseSymbol.slice(0, 2)}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-foreground text-sm font-medium truncate leading-tight">
                      {analysis.companyName}
                    </p>
                    <p className="text-muted-foreground text-[10px] font-mono truncate">{analysis.sector}</p>
                  </div>
                </div>

                <div className="col-span-2 hidden sm:block">
                  <span className="text-muted-foreground font-mono text-xs">{analysis.nseSymbol}</span>
                </div>

                <div className="col-span-2 hidden md:block">
                  <span className="text-foreground font-mono text-xs font-bold">
                    {formatCurrency(analysis.priceInfo.currentPrice)}
                  </span>
                </div>

                <div className="col-span-2 hidden lg:block">
                  <span className="text-muted-foreground font-mono text-[10px]">
                    {formatDate(analysis.analysisDate)}
                  </span>
                </div>

                <div className="col-span-5 sm:col-span-2 flex items-center justify-between">
                  <TrendPill trend={analysis.technicalPattern.trend} />
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#2a2622] group-hover:text-[#F0B429] transition-colors hidden sm:block" />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
