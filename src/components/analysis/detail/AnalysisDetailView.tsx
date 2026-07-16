"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  TrendingUp, TrendingDown, Minus, Building2, Target,
  BarChart3, FileText, CheckCircle2, Edit, Eye, Trash2, ArrowLeft, Shield,
} from "lucide-react";
import { AnalysisFull, TIMEFRAME_LABELS } from "@/types/analysis";
import { formatDate, formatCurrency } from "@/lib/utils";
import { publishAnalysis, deleteAnalysis } from "@/actions/analysis";
import { toast } from "sonner";

interface Props { analysis: AnalysisFull }

const TrendMap = {
  bullish:       { icon: TrendingUp,   color: "#00D4AA", bg: "rgba(0,212,170,0.1)"  },
  bearish:       { icon: TrendingDown, color: "#FF4D6A", bg: "rgba(255,77,106,0.1)" },
  consolidation: { icon: Minus,        color: "#FF8C42", bg: "rgba(255,140,66,0.1)" },
};

const confColors = { low: "#FF4D6A", medium: "#FF8C42", high: "#00D4AA" };

function Section({ title, icon: Icon, children, delay = 0 }: {
  title: string; icon: React.ElementType; children: React.ReactNode; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-card border border-border rounded-xl overflow-hidden"
    >
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-border">
        <Icon className="w-3.5 h-3.5 text-[#F0B429]" />
        <h3 className="text-foreground text-sm font-semibold">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </motion.div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <span className="text-muted-foreground text-xs font-mono uppercase tracking-widest">{label}</span>
      <span className="text-foreground text-sm font-medium">{value ?? "—"}</span>
    </div>
  );
}

function PriceBox({ label, val, highlight }: { label: string; val?: number | string | null; highlight?: boolean }) {
  return (
    <div className="bg-background rounded-lg p-3 text-center border border-border">
      <p className="text-muted-foreground font-mono text-[10px] uppercase tracking-widest mb-1">{label}</p>
      <p className={`font-display text-base font-bold ${highlight ? "text-[#F0B429]" : "text-foreground"}`}>
        {val != null ? formatCurrency(Number(val)) : "—"}
      </p>
    </div>
  );
}

export function AnalysisDetailView({ analysis }: Props) {
  const router = useRouter();
  const trend = TrendMap[analysis.technicalPattern.trend as keyof typeof TrendMap] ?? TrendMap.consolidation;
  const TIcon = trend.icon;
  const confColor = confColors[analysis.technicalPattern.confidenceLevel as keyof typeof confColors] ?? "#8A8076";

  const timeframes = Object.entries(analysis.indicators ?? {}).filter(
    ([, v]) => v && Object.values(v as Record<string, unknown>).some(Boolean)
  );

  async function handlePublish() {
    try {
      await publishAnalysis(analysis._id);
      toast.success("Analysis published");
      router.refresh();
    } catch {
      toast.error("Failed to publish");
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete analysis for ${analysis.companyName}?`)) return;
    try {
      await deleteAnalysis(analysis._id);
      toast.success("Deleted");
      router.push("/analysis");
    } catch {
      toast.error("Failed to delete");
    }
  }

  return (
    <div className="space-y-4">
      {/* Back + Header card */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-xl overflow-hidden"
      >
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-border">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-xs font-mono uppercase tracking-widest"
          >
            <ArrowLeft className="w-3 h-3" /> Back
          </button>
        </div>

        <div className="p-5 flex flex-wrap items-start justify-between gap-4">
          {/* Left: identity */}
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: trend.bg, border: `1px solid ${trend.color}30` }}
            >
              <span className="font-black text-[#F0B429] text-sm">{analysis.nseSymbol.slice(0, 3)}</span>
            </div>
            <div>
              <h1 className="text-foreground text-xl font-bold">{analysis.companyName}</h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest"
                  style={{ color: trend.color, background: trend.bg }}
                >
                  <TIcon className="w-2.5 h-2.5" />
                  {analysis.technicalPattern.trend}
                </span>
                <span className={`text-[10px] font-mono uppercase tracking-widest ${analysis.status === "published" ? "text-[#00D4AA]" : "text-[#FF8C42]"}`}>
                  {analysis.status === "published" ? "● " : "○ "}{analysis.status}
                </span>
                <span className="text-muted-foreground text-[10px] font-mono">
                  {analysis.nseSymbol} · {analysis.sector} · {formatDate(analysis.analysisDate)}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <Link href={`/analysis/${analysis._id}/preview`}>
              <button className="flex items-center gap-1.5 h-8 px-3 bg-accent hover:bg-accent/70 text-foreground text-xs font-mono rounded-lg transition-colors border border-border">
                <Eye className="w-3 h-3" /> Preview
              </button>
            </Link>
            {analysis.status === "draft" && (
              <button
                onClick={handlePublish}
                className="flex items-center gap-1.5 h-8 px-3 bg-[#00D4AA]/10 hover:bg-[#00D4AA]/20 text-[#00D4AA] text-xs font-mono rounded-lg transition-colors border border-[#00D4AA]/30"
              >
                <CheckCircle2 className="w-3 h-3" /> Publish
              </button>
            )}
            <Link href={`/analysis/${analysis._id}/edit`}>
              <button className="flex items-center gap-1.5 h-8 px-3 bg-[#F0B429]/10 hover:bg-[#F0B429]/20 text-[#F0B429] text-xs font-mono rounded-lg transition-colors border border-[#F0B429]/30">
                <Edit className="w-3 h-3" /> Edit
              </button>
            </Link>
            <button
              onClick={handleDelete}
              className="flex items-center gap-1.5 h-8 px-3 bg-[#FF4D6A]/10 hover:bg-[#FF4D6A]/20 text-[#FF4D6A] text-xs font-mono rounded-lg transition-colors border border-[#FF4D6A]/30"
            >
              <Trash2 className="w-3 h-3" /> Delete
            </button>
          </div>
        </div>
      </motion.div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-4">
          {/* Stock Info */}
          <Section title="Stock Information" icon={Building2} delay={0.05}>
            <Row label="Company" value={analysis.companyName} />
            <Row label="Symbol" value={<span className="font-mono text-[#F0B429]">{analysis.nseSymbol}</span>} />
            <Row label="Sector" value={analysis.sector} />
            <Row label="Analysis Date" value={formatDate(analysis.analysisDate)} />
            <Row label="Analysis Time" value={analysis.analysisTime} />
          </Section>

          {/* Price Info */}
          <Section title="Price Information" icon={BarChart3} delay={0.1}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <PriceBox label="Current" val={analysis.priceInfo.currentPrice} highlight />
              <PriceBox label="Year High" val={analysis.priceInfo.yearHigh} />
              <PriceBox label="Year Low"  val={analysis.priceInfo.yearLow}  />
              <PriceBox label="ATH"       val={analysis.priceInfo.allTimeHigh} />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <PriceBox label="Prev Open"  val={analysis.priceInfo.prevOpen}  />
              <PriceBox label="Prev Close" val={analysis.priceInfo.prevClose} />
              <PriceBox label="Prev High"  val={analysis.priceInfo.prevHigh}  />
              <PriceBox label="Prev Low"   val={analysis.priceInfo.prevLow}   />
            </div>
          </Section>

          {/* Technical Pattern */}
          <Section title="Technical Analysis" icon={Target} delay={0.15}>
            <Row label="Pattern" value={analysis.technicalPattern.patternType} />
            <Row label="Trend" value={
              <span style={{ color: trend.color }} className="capitalize font-mono text-xs font-bold">{analysis.technicalPattern.trend}</span>
            } />
            <Row label="Confidence" value={
              <span style={{ color: confColor }} className="capitalize font-mono text-xs font-bold">{analysis.technicalPattern.confidenceLevel}</span>
            } />
            {analysis.technicalPattern.notes && (
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-muted-foreground text-[10px] font-mono uppercase tracking-widest mb-1.5">Notes</p>
                <p className="text-foreground text-sm leading-relaxed">{analysis.technicalPattern.notes}</p>
              </div>
            )}
          </Section>

          {/* Indicators */}
          {timeframes.length > 0 && (
            <Section title="Indicators" icon={BarChart3} delay={0.2}>
              {timeframes.map(([tf, v]) => {
                const vals = v as Record<string, number | undefined>;
                const rows = Object.entries(vals).filter(([, val]) => val != null);
                return (
                  <div key={tf} className="mb-4 last:mb-0">
                    <p className="text-[#F0B429] font-mono text-[10px] uppercase tracking-widest mb-2">
                      {TIMEFRAME_LABELS[tf] ?? tf}
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {rows.map(([ind, val]) => (
                        <div key={ind} className="bg-background rounded-lg p-2.5 border border-border">
                          <p className="text-muted-foreground font-mono text-[9px] uppercase tracking-widest">{ind.toUpperCase()}</p>
                          <p className="text-foreground text-sm font-bold mt-0.5">{val}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </Section>
          )}

          {/* Analysis Reason */}
          {analysis.analysisReason && (
            <Section title="Analysis Reason" icon={FileText} delay={0.25}>
              <div
                className="prose prose-sm dark:prose-invert max-w-none text-foreground text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: analysis.analysisReason }}
              />
            </Section>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Trade Recommendation */}
          {analysis.tradeRecommendation && (
            <Section title="Trade Setup" icon={Target} delay={0.1}>
              <Row label="Buy Zone"   value={formatCurrency(Number(analysis.tradeRecommendation.buyZone))} />
              <Row label="Stop Loss"  value={analysis.tradeRecommendation.stopLoss   ? formatCurrency(Number(analysis.tradeRecommendation.stopLoss))  : null} />
              <Row label="Target 1"   value={analysis.tradeRecommendation.target1    ? formatCurrency(Number(analysis.tradeRecommendation.target1))   : null} />
              <Row label="Target 2"   value={analysis.tradeRecommendation.target2    ? formatCurrency(Number(analysis.tradeRecommendation.target2))   : null} />
              <Row label="Target 3"   value={analysis.tradeRecommendation.target3    ? formatCurrency(Number(analysis.tradeRecommendation.target3))   : null} />
              <Row label="Risk/Reward" value={analysis.tradeRecommendation.riskRewardRatio ?? null} />
            </Section>
          )}

          {/* Confidence meter */}
          <Section title="Signal Quality" icon={Shield} delay={0.15}>
            <div className="text-center py-2">
              <div
                className="w-16 h-16 mx-auto rounded-full flex items-center justify-center border-2 mb-3"
                style={{ borderColor: confColor, background: `${confColor}15` }}
              >
                <span style={{ color: confColor }} className="font-display text-lg font-black capitalize">
                  {analysis.technicalPattern.confidenceLevel[0].toUpperCase()}
                </span>
              </div>
              <p style={{ color: confColor }} className="font-mono text-xs uppercase tracking-widest font-bold">
                {analysis.technicalPattern.confidenceLevel} Confidence
              </p>
              <p className="text-muted-foreground text-[10px] font-mono mt-1">
                {analysis.technicalPattern.trend} · {analysis.technicalPattern.patternType}
              </p>
            </div>
          </Section>

          {/* Metadata */}
          <Section title="Metadata" icon={FileText} delay={0.2}>
            <Row label="Created"  value={<span className="font-mono text-xs">{formatDate(analysis.createdAt)}</span>} />
            <Row label="Updated"  value={<span className="font-mono text-xs">{formatDate(analysis.updatedAt)}</span>} />
            <Row label="Analysis" value={<span className="font-mono text-xs">{formatDate(analysis.analysisDate)}</span>} />
            <Row label="Status"   value={<span className="capitalize font-mono text-xs">{analysis.status}</span>} />
          </Section>
        </div>
      </div>
    </div>
  );
}
