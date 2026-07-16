"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  TrendingUp, TrendingDown, Minus, Calendar,
  Building2, Tag, Target, Shield, BarChart3,
  FileText, CheckCircle2, Edit, Eye, Trash2, ArrowLeft,
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
    <div className="flex items-center justify-between py-2 border-b border-[#0d0d0d] last:border-0">
      <span className="text-muted-foreground text-xs font-mono uppercase tracking-widest">{label}</span>
      <span className="text-foreground text-sm font-medium">{value ?? "—"}</span>
    </div>
  );
}

export function AnalysisDetailView({ analysis }: Props) {
  const router = useRouter();
  const trend = TrendMap[analysis.technicalPattern.trend as keyof typeof TrendMap] ?? TrendMap.consolidation;
  const TIcon = trend.icon;

  const confColors = { high: "#00D4AA", medium: "#FF8C42", low: "#FF4D6A" };
  const confColor = confColors[analysis.technicalPattern.confidenceLevel as keyof typeof confColors] ?? "#8A8076";

  async function handlePublish() {
    try {
      await publishAnalysis(analysis._id);
      toast.success("Published successfully");
      router.refresh();
    } catch { toast.error("Failed to publish"); }
  }

  async function handleDelete() {
    if (!confirm(`Delete analysis for ${analysis.companyName}?`)) return;
    try {
      await deleteAnalysis(analysis._id);
      toast.success("Deleted");
      router.push("/analysis");
    } catch { toast.error("Failed to delete"); }
  }

  const timeframes = Object.entries(analysis.indicators ?? {}).filter(
    ([, v]) => v && Object.values(v).some((x) => x !== undefined && x !== null)
  );

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-xl overflow-hidden"
      >
        {/* Top accent */}
        <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, ${trend.color}, transparent)` }} />

        <div className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-start gap-4">
              {/* Symbol badge */}
              <div className="w-12 h-12 rounded-lg bg-accent border border-border flex items-center justify-center shrink-0">
                <span className="font-black text-[#F0B429] text-sm">{analysis.nseSymbol.slice(0, 3)}</span>
              </div>
              <div>
                <div className="flex items-center gap-3 flex-wrap mb-1">
                  <h1 className="text-foreground text-xl font-bold">{analysis.companyName}</h1>
                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold font-mono uppercase"
                    style={{ color: trend.color, backgroundColor: trend.bg }}
                  >
                    <TIcon className="w-3 h-3" />
                    {analysis.technicalPattern.trend}
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold ${
                    analysis.status === "published"
                      ? "text-[#00D4AA] bg-[rgba(0,212,170,0.1)]"
                      : "text-muted-foreground bg-[rgba(255,255,255,0.04)]"
                  }`}>
                    {analysis.status === "published" ? "● " : "○ "}{analysis.status}
                  </span>
                </div>
                <p className="text-muted-foreground text-xs font-mono">
                  {analysis.nseSymbol} · {analysis.sector} · {formatDate(analysis.analysisDate)}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              <Link href="/analysis">
                <button className="h-8 px-3 flex items-center gap-1.5 text-muted-foreground hover:text-muted-foreground bg-accent border border-border rounded-lg font-mono text-xs transition-colors">
                  <ArrowLeft className="w-3 h-3" /> Back
                </button>
              </Link>
              <Link href={`/analysis/${analysis._id}/preview`}>
                <button className="h-8 px-3 flex items-center gap-1.5 text-muted-foreground hover:text-[#F0B429] bg-accent border border-border rounded-lg font-mono text-xs transition-colors">
                  <Eye className="w-3 h-3" /> Preview
                </button>
              </Link>
              {analysis.status === "draft" && (
                <button
                  onClick={handlePublish}
                  className="h-8 px-3 flex items-center gap-1.5 text-[#00D4AA] bg-[rgba(0,212,170,0.1)] border border-[rgba(0,212,170,0.2)] rounded-lg font-mono text-xs hover:bg-[rgba(0,212,170,0.15)] transition-colors"
                >
                  <CheckCircle2 className="w-3 h-3" /> Publish
                </button>
              )}
              <Link href={`/analysis/${analysis._id}/edit`}>
                <button className="h-8 px-3 flex items-center gap-1.5 text-[#F0B429] bg-[rgba(240,180,41,0.1)] border border-[rgba(240,180,41,0.2)] rounded-lg font-mono text-xs hover:bg-[rgba(240,180,41,0.15)] transition-colors">
                  <Edit className="w-3 h-3" /> Edit
                </button>
              </Link>
              <button
                onClick={handleDelete}
                className="h-8 px-3 flex items-center gap-1.5 text-[#FF4D6A] bg-[rgba(255,77,106,0.08)] border border-[rgba(255,77,106,0.2)] rounded-lg font-mono text-xs hover:bg-[rgba(255,77,106,0.12)] transition-colors"
              >
                <Trash2 className="w-3 h-3" /> Delete
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-4">
          {/* Stock Info */}
          <Section title="Stock Information" icon={Building2} delay={0.05}>
            <Row label="Company" value={analysis.companyName} />
            <Row label="Symbol" value={<span className="font-mono text-[#F0B429]">{analysis.nseSymbol}</span>} />
            <Row label="BSE Code" value={analysis.bseCode ? <span className="font-mono">{analysis.bseCode}</span> : null} />
            <Row label="Sector" value={analysis.sector} />
            <Row label="Timeframe" value={analysis.timeframe} />
          </Section>

          {/* Price Info */}
          <Section title="Price Information" icon={BarChart3} delay={0.1}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              {[
                { label: "Current",  val: analysis.priceInfo.currentPrice, highlight: true },
                { label: "52W High", val: analysis.priceInfo["52WeekHigh"] },
                { label: "52W Low",  val: analysis.priceInfo["52WeekLow"] },
                { label: "Volume",   val: analysis.priceInfo.volume },
              ].map(({ label, val, highlight }) => (
                <div key={label} className="bg-background border border-border rounded-lg p-3">
                  <p className="text-muted-foreground font-mono text-[10px] uppercase tracking-widest mb-1.5">{label}</p>
                  <p className={`font-mono font-bold text-lg leading-none ${highlight ? "text-[#F0B429]" : "text-foreground"}`}>
                    {val ? formatCurrency(val) : "—"}
                  </p>
                </div>
              ))}
            </div>
            <Row label="Support Level"    value={analysis.priceInfo.supportLevel ? formatCurrency(analysis.priceInfo.supportLevel) : null} />
            <Row label="Resistance Level" value={analysis.priceInfo.resistanceLevel ? formatCurrency(analysis.priceInfo.resistanceLevel) : null} />
            <Row label="ATH"              value={analysis.priceInfo.allTimeHigh ? formatCurrency(analysis.priceInfo.allTimeHigh) : null} />
          </Section>

          {/* Pattern */}
          <Section title="Technical Pattern" icon={Tag} delay={0.15}>
            <Row label="Pattern"     value={analysis.technicalPattern.patternType} />
            <Row label="Trend"       value={
              <span style={{ color: trend.color }} className="capitalize font-mono text-xs font-bold">{analysis.technicalPattern.trend}</span>
            } />
            <Row label="Confidence"  value={
              <span style={{ color: confColor }} className="capitalize font-mono text-xs font-bold">{analysis.technicalPattern.confidenceLevel}</span>
            } />
            <Row label="Entry Zone"  value={analysis.technicalPattern.entryZone || null} />
            <Row label="Time Horizon" value={analysis.technicalPattern.timeHorizon || null} />
            {analysis.technicalPattern.keyLevels && analysis.technicalPattern.keyLevels.length > 0 && (
              <div className="pt-2">
                <p className="text-muted-foreground font-mono text-[10px] uppercase tracking-widest mb-2">Key Levels</p>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.technicalPattern.keyLevels.map((level: string, i: number) => (
                    <span key={i} className="bg-accent border border-border rounded px-2 py-0.5 font-mono text-xs text-muted-foreground">{level}</span>
                  ))}
                </div>
              </div>
            )}
          </Section>

          {/* Indicators */}
          {timeframes.length > 0 && (
            <Section title="Technical Indicators" icon={BarChart3} delay={0.2}>
              <div className="space-y-4">
                {timeframes.map(([tf, v]) => {
                  const vals = v as Record<string, number | string | undefined>;
                  return (
                    <div key={tf}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[#F0B429] font-mono text-[10px] uppercase tracking-widest font-bold">
                          {TIMEFRAME_LABELS[tf as keyof typeof TIMEFRAME_LABELS] || tf}
                        </span>
                        <div className="flex-1 h-px bg-[#1a1a1a]" />
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {Object.entries(vals).filter(([, val]) => val !== undefined && val !== null && val !== "").map(([key, val]) => (
                          <div key={key} className="bg-background border border-border rounded-lg px-3 py-2">
                            <p className="text-muted-foreground font-mono text-[9px] uppercase tracking-widest mb-1">{key.toUpperCase()}</p>
                            <p className="text-foreground font-mono text-sm font-bold">{String(val)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Section>
          )}

          {/* Reason */}
          {analysis.analysisReason && (
            <Section title="Analysis Reasoning" icon={FileText} delay={0.25}>
              <div
                className="prose prose-sm prose-invert max-w-none text-muted-foreground leading-relaxed [&_strong]:text-foreground [&_mark]:bg-[rgba(240,180,41,0.2)] [&_mark]:text-inherit [&_ul]:text-muted-foreground [&_ol]:text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: analysis.analysisReason }}
              />
            </Section>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Trade Recommendation */}
          {analysis.tradeRecommendation && (
            <Section title="Trade Setup" icon={Target} delay={0.12}>
              <div className="space-y-2">
                {[
                  { label: "Action",      val: analysis.tradeRecommendation.action,       accent: trend.color },
                  { label: "Entry",       val: analysis.tradeRecommendation.entryPrice ? formatCurrency(analysis.tradeRecommendation.entryPrice) : null },
                  { label: "Stop Loss",   val: analysis.tradeRecommendation.stopLoss     ? formatCurrency(analysis.tradeRecommendation.stopLoss)   : null },
                  { label: "Target 1",    val: analysis.tradeRecommendation.target1      ? formatCurrency(analysis.tradeRecommendation.target1)    : null },
                  { label: "Target 2",    val: analysis.tradeRecommendation.target2      ? formatCurrency(analysis.tradeRecommendation.target2)    : null },
                  { label: "Target 3",    val: analysis.tradeRecommendation.target3      ? formatCurrency(analysis.tradeRecommendation.target3)    : null },
                  { label: "Position Size", val: analysis.tradeRecommendation.positionSize },
                  { label: "Risk/Reward", val: analysis.tradeRecommendation.riskRewardRatio },
                ].map(({ label, val, accent }) => val !== undefined && val !== null && (
                  <div key={label} className="flex items-center justify-between py-1.5 border-b border-[#0d0d0d] last:border-0">
                    <span className="text-muted-foreground font-mono text-[10px] uppercase tracking-widest">{label}</span>
                    <span className="font-mono text-sm font-bold" style={{ color: accent || "#F5F0E8" }}>{String(val)}</span>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Risk */}
          <Section title="Risk Profile" icon={Shield} delay={0.18}>
            <Row label="Risk Level" value={
              <span className="capitalize font-mono text-xs font-bold" style={{ color: confColor }}>
                {analysis.tradeRecommendation?.riskLevel || "—"}
              </span>
            } />
            <Row label="Confidence" value={
              <span className="capitalize font-mono text-xs font-bold" style={{ color: confColor }}>
                {analysis.technicalPattern.confidenceLevel}
              </span>
            } />
            {analysis.tradeRecommendation?.notes && (
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-muted-foreground font-mono text-[10px] uppercase tracking-widest mb-2">Notes</p>
                <p className="text-muted-foreground text-xs leading-relaxed">{analysis.tradeRecommendation.notes}</p>
              </div>
            )}
          </Section>

          {/* Meta */}
          <Section title="Metadata" icon={Calendar} delay={0.22}>
            <Row label="Created"   value={<span className="font-mono text-xs">{formatDate(analysis.createdAt)}</span>} />
            <Row label="Updated"   value={<span className="font-mono text-xs">{formatDate(analysis.updatedAt)}</span>} />
            <Row label="Analysis"  value={<span className="font-mono text-xs">{formatDate(analysis.analysisDate)}</span>} />
            <Row label="Status"    value={<span className="capitalize font-mono text-xs">{analysis.status}</span>} />
          </Section>
        </div>
      </div>
    </div>
  );
}
