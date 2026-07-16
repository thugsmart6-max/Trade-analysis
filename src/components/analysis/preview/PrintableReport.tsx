"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Clock,
  ArrowLeft,
  Printer,
  CheckCircle2,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AnalysisFull, TIMEFRAME_LABELS } from "@/types/analysis";
import {
  formatDate,
  formatDateTime,
  formatCurrency,
  getTrendBg,
  getConfidenceBg,
} from "@/lib/utils";
import { publishAnalysis } from "@/actions/analysis";
import { toast } from "sonner";

interface Props {
  analysis: AnalysisFull;
}

const TrendIcon = ({ trend }: { trend: string }) => {
  if (trend === "bullish") return <TrendingUp className="w-4 h-4" />;
  if (trend === "bearish") return <TrendingDown className="w-4 h-4" />;
  return <Minus className="w-4 h-4" />;
};

function ReportRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-black/5 dark:border-white/5 last:border-0">
      <span className="text-slate-500 text-sm">{label}</span>
      <span className="text-slate-900 dark:text-white text-sm font-semibold">
        {value || "—"}
      </span>
    </div>
  );
}

export function PrintableReport({ analysis }: Props) {
  const router = useRouter();

  async function handlePublish() {
    try {
      await publishAnalysis(analysis._id);
      toast.success("Analysis published!");
      router.refresh();
    } catch {
      toast.error("Failed to publish");
    }
  }

  const timeframes = Object.entries(analysis.indicators || {}).filter(
    ([, v]) => v && Object.values(v).some((x) => x !== undefined && x !== null)
  );

  return (
    <>
      {/* Action bar - hidden on print */}
      <div className="print:hidden sticky top-0 z-10 bg-slate-950/90 backdrop-blur border-b border-white/5 px-6 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href={`/analysis/${analysis._id}`}>
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-white gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Detail
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            {analysis.status === "draft" && (
              <Button
                onClick={handlePublish}
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-500 text-white gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Publish
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="border-white/10 text-slate-300 hover:text-white gap-2"
              onClick={() => window.print()}
            >
              <Printer className="w-4 h-4" />
              Print / PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Report */}
      <div className="max-w-4xl mx-auto p-6 print:p-4">
        {/* Report Header */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden mb-6 print:mb-4 print:rounded-none print:border-slate-300">
          {/* Top accent */}
          <div
            className={`h-2 ${
              analysis.technicalPattern.trend === "bullish"
                ? "bg-emerald-500"
                : analysis.technicalPattern.trend === "bearish"
                ? "bg-rose-500"
                : "bg-amber-500"
            }`}
          />
          <div className="p-6 print:p-4">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-black text-slate-900 dark:text-white print:text-slate-900">
                    {analysis.companyName}
                  </h1>
                  <Badge
                    className={`border ${getTrendBg(
                      analysis.technicalPattern.trend
                    )} flex items-center gap-1.5 text-sm`}
                    variant="outline"
                  >
                    <TrendIcon trend={analysis.technicalPattern.trend} />
                    <span className="capitalize font-bold">
                      {analysis.technicalPattern.trend}
                    </span>
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400 print:text-slate-600">
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300 print:text-slate-700">
                    NSE: {analysis.nseSymbol}
                  </span>
                  <span>Sector: {analysis.sector}</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(analysis.analysisDate)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {analysis.analysisTime}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-slate-900 dark:text-white print:text-slate-900">
                  {formatCurrency(analysis.priceInfo.currentPrice)}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">Current Price</p>
                <Badge
                  className={`mt-2 capitalize border ${
                    analysis.status === "published"
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                      : "bg-slate-500/10 text-slate-500 border-slate-500/30"
                  }`}
                  variant="outline"
                >
                  {analysis.status}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 print:gap-4 mb-5">
          {/* Price Info */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl p-5 print:rounded-none print:border-slate-300 print:p-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-500 mb-3">
              Price Information
            </h2>
            <ReportRow
              label="Current Price"
              value={
                <span className="text-emerald-600 dark:text-emerald-400 font-black">
                  {formatCurrency(analysis.priceInfo.currentPrice)}
                </span>
              }
            />
            <ReportRow
              label="Prev. Open"
              value={
                analysis.priceInfo.prevOpen
                  ? formatCurrency(analysis.priceInfo.prevOpen)
                  : "—"
              }
            />
            <ReportRow
              label="Prev. Close"
              value={
                analysis.priceInfo.prevClose
                  ? formatCurrency(analysis.priceInfo.prevClose)
                  : "—"
              }
            />
            <ReportRow
              label="Prev. High"
              value={
                analysis.priceInfo.prevHigh
                  ? formatCurrency(analysis.priceInfo.prevHigh)
                  : "—"
              }
            />
            <ReportRow
              label="Prev. Low"
              value={
                analysis.priceInfo.prevLow
                  ? formatCurrency(analysis.priceInfo.prevLow)
                  : "—"
              }
            />
            <ReportRow
              label="All Time High"
              value={
                analysis.priceInfo.allTimeHigh
                  ? formatCurrency(analysis.priceInfo.allTimeHigh)
                  : "—"
              }
            />
            <ReportRow
              label="52-Week High"
              value={
                analysis.priceInfo.yearHigh
                  ? formatCurrency(analysis.priceInfo.yearHigh)
                  : "—"
              }
            />
            <ReportRow
              label="52-Week Low"
              value={
                analysis.priceInfo.yearLow
                  ? formatCurrency(analysis.priceInfo.yearLow)
                  : "—"
              }
            />
          </div>

          {/* Pattern + Trade */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl p-5 print:rounded-none print:border-slate-300 print:p-3">
              <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-500 mb-3">
                Technical Pattern
              </h2>
              <ReportRow
                label="Pattern"
                value={analysis.technicalPattern.patternType}
              />
              <ReportRow
                label="Overall Trend"
                value={
                  <Badge
                    className={`border ${getTrendBg(
                      analysis.technicalPattern.trend
                    )} flex items-center gap-1.5 capitalize`}
                    variant="outline"
                  >
                    <TrendIcon trend={analysis.technicalPattern.trend} />
                    {analysis.technicalPattern.trend}
                  </Badge>
                }
              />
              <ReportRow
                label="Confidence"
                value={
                  <Badge
                    className={`border capitalize ${getConfidenceBg(
                      analysis.technicalPattern.confidenceLevel
                    )}`}
                    variant="outline"
                  >
                    {analysis.technicalPattern.confidenceLevel}
                  </Badge>
                }
              />
              {analysis.technicalPattern.notes && (
                <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 print:text-slate-600 italic">
                  {analysis.technicalPattern.notes}
                </p>
              )}
            </div>

            {/* Trade Recommendation */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl p-5 print:rounded-none print:border-slate-300 print:p-3">
              <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-500 mb-3">
                Trade Setup
              </h2>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 print:bg-transparent">
                  <span className="text-blue-600 dark:text-blue-300 text-sm font-medium">
                    Buy Zone
                  </span>
                  <span className="font-black text-blue-700 dark:text-white">
                    {formatCurrency(analysis.tradeRecommendation.buyZone)}
                  </span>
                </div>
                {[
                  {
                    label: "Target 1",
                    value: analysis.tradeRecommendation.target1,
                  },
                  {
                    label: "Target 2",
                    value: analysis.tradeRecommendation.target2,
                  },
                  {
                    label: "Target 3",
                    value: analysis.tradeRecommendation.target3,
                  },
                ]
                  .filter((t) => t.value)
                  .map((t) => (
                    <div
                      key={t.label}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 print:bg-transparent"
                    >
                      <span className="text-emerald-600 dark:text-emerald-300 text-sm font-medium">
                        {t.label}
                      </span>
                      <span className="font-black text-emerald-700 dark:text-white">
                        {formatCurrency(t.value!)}
                      </span>
                    </div>
                  ))}
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-red-50 dark:bg-rose-500/10 border border-red-200 dark:border-rose-500/20 print:bg-transparent">
                  <span className="text-red-600 dark:text-rose-300 text-sm font-medium">
                    Stop Loss
                  </span>
                  <span className="font-black text-red-700 dark:text-white">
                    {formatCurrency(analysis.tradeRecommendation.stopLoss)}
                  </span>
                </div>
                {analysis.tradeRecommendation.riskRewardRatio && (
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 print:bg-transparent">
                    <span className="text-slate-600 dark:text-slate-300 text-sm font-medium">
                      Risk : Reward
                    </span>
                    <span className="font-black text-slate-900 dark:text-white text-lg">
                      1 :{" "}
                      {analysis.tradeRecommendation.riskRewardRatio.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Technical Indicators */}
        {timeframes.length > 0 && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl p-5 print:rounded-none print:border-slate-300 print:p-3 mb-5">
            <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-500 mb-4">
              Technical Indicators
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 print:grid-cols-4">
              {timeframes.map(([tf, indicators]) => (
                <div key={tf}>
                  <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-2 pb-1 border-b border-emerald-500/20">
                    {TIMEFRAME_LABELS[tf] || tf}
                  </p>
                  <div className="space-y-1">
                    {Object.entries(indicators || {}).map(([key, val]) =>
                      val !== undefined && val !== null ? (
                        <div
                          key={key}
                          className="flex items-center justify-between"
                        >
                          <span className="text-xs text-slate-500 dark:text-slate-400 print:text-slate-600">
                            {key.toUpperCase()}
                          </span>
                          <span className="text-xs font-bold text-slate-800 dark:text-white print:text-slate-800">
                            {typeof val === "number" ? val.toFixed(2) : String(val)}
                          </span>
                        </div>
                      ) : null
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analysis Reason */}
        {analysis.analysisReason && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl p-5 print:rounded-none print:border-slate-300 print:p-3 mb-5">
            <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-500 mb-4">
              Analysis Rationale
            </h2>
            <div
              className="prose prose-slate dark:prose-invert prose-sm max-w-none print:text-slate-900"
              dangerouslySetInnerHTML={{ __html: analysis.analysisReason }}
            />
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-slate-400 dark:text-slate-600 print:text-slate-500 pt-4 border-t border-slate-200 dark:border-white/5">
          <p>
            Generated by TradeAnalysis · {formatDateTime(analysis.updatedAt)} ·
            For internal use only
          </p>
          <p className="mt-1">
            This analysis is for informational purposes only and does not
            constitute investment advice.
          </p>
        </div>
      </div>
    </>
  );
}
