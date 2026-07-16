"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, Eye, Trash2, ExternalLink } from "lucide-react";
import { AnalysisListItem } from "@/types/analysis";
import { formatDate, formatCurrency } from "@/lib/utils";
import { deleteAnalysis } from "@/actions/analysis";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface AnalysisTableProps {
  analyses: AnalysisListItem[];
}

const TrendBadge = ({ trend }: { trend: string }) => {
  const map = {
    bullish:       { icon: TrendingUp,   color: "#00D4AA", bg: "rgba(0,212,170,0.08)"  },
    bearish:       { icon: TrendingDown, color: "#FF4D6A", bg: "rgba(255,77,106,0.08)" },
    consolidation: { icon: Minus,        color: "#FF8C42", bg: "rgba(255,140,66,0.08)" },
  };
  const t = map[trend as keyof typeof map] ?? map.consolidation;
  const Icon = t.icon;
  return (
    <span
      className="inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider font-bold"
      style={{ color: t.color, backgroundColor: t.bg }}
    >
      <Icon className="w-2.5 h-2.5" />
      {trend === "consolidation" ? "Consol." : trend}
    </span>
  );
};

const StatusBadge = ({ status }: { status: string }) => (
  <span className={`inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider font-bold ${
    status === "published"
      ? "text-[#00D4AA] bg-[rgba(0,212,170,0.08)]"
      : "text-muted-foreground bg-[rgba(255,255,255,0.04)]"
  }`}>
    {status === "published" ? "●" : "○"} {status}
  </span>
);

const ConfidenceDot = ({ level }: { level: string }) => {
  const colors = { high: "#00D4AA", medium: "#FF8C42", low: "#FF4D6A" };
  return (
    <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider" style={{ color: colors[level as keyof typeof colors] }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colors[level as keyof typeof colors] }} />
      {level}
    </span>
  );
};

export function AnalysisTable({ analyses }: AnalysisTableProps) {
  const router = useRouter();

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete analysis for ${name}?`)) return;
    try {
      await deleteAnalysis(id);
      toast.success("Deleted");
      router.refresh();
    } catch {
      toast.error("Failed to delete");
    }
  }

  if (!analyses.length) {
    return (
      <div className="py-16 text-center">
        <p className="text-muted-foreground text-sm font-mono mb-3">No analyses found</p>
        <Link href="/analysis/new">
          <button className="text-[#F0B429] font-mono text-xs hover:underline">
            Create analysis →
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Column headers */}
      <div className="grid grid-cols-12 gap-2 px-4 py-2.5 border-b border-border">
        {[
          { label: "Company",    span: "col-span-6 sm:col-span-4 md:col-span-3" },
          { label: "Symbol",     span: "col-span-2 hidden sm:block" },
          { label: "Price",      span: "col-span-2 hidden md:block" },
          { label: "Date",       span: "col-span-2 hidden lg:block" },
          { label: "Trend",      span: "col-span-3 sm:col-span-2 md:col-span-1" },
          { label: "Confidence", span: "col-span-1 hidden xl:block" },
          { label: "Status",     span: "col-span-3 sm:col-span-2 md:col-span-1 hidden sm:block" },
        ].map(({ label, span }) => (
          <span key={label} className={`${span} text-muted-foreground/40 font-mono text-[10px] uppercase tracking-widest`}>
            {label}
          </span>
        ))}
      </div>

      <div className="divide-y divide-border">
        {analyses.map((a, i) => (
          <motion.div
            key={a._id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.025 }}
            className="group"
          >
              <div className="grid grid-cols-12 gap-2 px-4 py-3 hover:bg-accent/50 transition-colors items-center relative">
                {/* Company */}
                <div className="col-span-6 sm:col-span-4 md:col-span-3 flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-sm bg-[#111111] border border-border flex items-center justify-center shrink-0">
                  <span className="text-[9px] font-black text-[#F0B429]">
                    {a.nseSymbol.slice(0, 2)}
                  </span>
                </div>
                <div className="min-w-0">
                  <Link href={`/analysis/${a._id}`}>
                    <p className="text-foreground text-sm font-medium truncate hover:text-[#F0B429] transition-colors leading-tight">
                      {a.companyName}
                    </p>
                  </Link>
                  <p className="text-muted-foreground text-[10px] font-mono truncate">{a.sector}</p>
                </div>
              </div>

              {/* Symbol */}
              <div className="col-span-2 hidden sm:block">
                <span className="text-muted-foreground font-mono text-xs">{a.nseSymbol}</span>
              </div>

              {/* Price */}
              <div className="col-span-2 hidden md:block">
                <span className="text-foreground font-mono text-xs font-bold">
                  {formatCurrency(a.priceInfo.currentPrice)}
                </span>
              </div>

              {/* Date */}
              <div className="col-span-2 hidden lg:block">
                <span className="text-muted-foreground font-mono text-[10px]">{formatDate(a.analysisDate)}</span>
              </div>

              {/* Trend */}
              <div className="col-span-3 sm:col-span-2 md:col-span-1">
                <TrendBadge trend={a.technicalPattern.trend} />
              </div>

              {/* Confidence */}
              <div className="col-span-1 hidden xl:block">
                <ConfidenceDot level={a.technicalPattern.confidenceLevel} />
              </div>

              {/* Status */}
              <div className="col-span-3 sm:col-span-2 md:col-span-1 hidden sm:flex items-center">
                <StatusBadge status={a.status} />
              </div>

              {/* Actions — hover reveal */}
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-accent/50 rounded-md px-1 py-0.5">
                <Link href={`/analysis/${a._id}`}>
                  <button className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-[#F0B429] transition-colors rounded">
                    <Eye className="w-3 h-3" />
                  </button>
                </Link>
                <Link href={`/analysis/${a._id}/preview`}>
                  <button className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-[#F0B429] transition-colors rounded">
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </Link>
                <button
                  className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-[#FF4D6A] transition-colors rounded"
                  onClick={() => handleDelete(a._id, a.companyName)}
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
