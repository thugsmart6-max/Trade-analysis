"use client";

import { useState } from "react";
import { Brain, Loader2, RefreshCw, AlertTriangle } from "lucide-react";
import { generateAIInsights } from "@/actions/research";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function AIInsightsModule({ data }: { data: any }) {
  const symbol   = data?.symbol ?? data?.overview?.symbol;
  const existing = data?.aiInsights ?? [];
  const latest   = existing[existing.length - 1];

  const [insight,  setInsight]  = useState<string>(latest?.text ?? "");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [genAt,    setGenAt]    = useState<string>(latest?.generatedAt ? new Date(latest.generatedAt).toLocaleString() : "");

  const hasKey = typeof window !== "undefined" ? true : !!process.env.OPENROUTER_API_KEY;

  async function generate() {
    if (!symbol) return;
    setLoading(true);
    setError(null);
    try {
      const text = await generateAIInsights(symbol);
      setInsight(text);
      setGenAt(new Date().toLocaleString());
    } catch (e) {
      setError((e as Error).message ?? "Failed to generate insights.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Brain className="w-4 h-4 text-[#F0B429]" />
            <h3 className="font-display text-foreground text-sm font-semibold">AI Research Note</h3>
          </div>
          <p className="text-muted-foreground text-[10px] font-mono">
            Neutral observations based on calculated metrics. No investment recommendations.
          </p>
        </div>
        <button
          onClick={generate}
          disabled={loading}
          className="flex items-center gap-2 h-9 px-4 bg-[#F0B429]/10 hover:bg-[#F0B429]/20 text-[#F0B429] border border-[#F0B429]/30 rounded-lg font-mono text-[10px] uppercase tracking-widest transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
          {insight ? "Regenerate" : "Generate"}
        </button>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-2.5 px-4 py-3 bg-[#FF8C42]/8 border border-[#FF8C42]/20 rounded-lg">
        <AlertTriangle className="w-3.5 h-3.5 text-[#FF8C42] mt-0.5 shrink-0" />
        <p className="text-[#FF8C42] text-[10px] font-mono leading-relaxed">
          This AI note is generated from factual market data only. It contains zero investment recommendations.
          The platform strictly prohibits terms like Buy, Sell, Hold, Avoid, or Strong Buy.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-3 bg-[#FF4D6A]/8 border border-[#FF4D6A]/20 rounded-lg">
          <p className="text-[#FF4D6A] text-xs font-mono">{error}</p>
          {error.includes("API") && (
            <p className="text-muted-foreground text-[10px] mt-1 font-mono">
              Ensure OPENROUTER_API_KEY is set in your Vercel environment variables.
            </p>
          )}
        </div>
      )}

      {/* Content */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <Loader2 className="w-6 h-6 text-[#F0B429] animate-spin" />
          <p className="text-muted-foreground font-mono text-xs">Analysing data and generating research note...</p>
        </div>
      )}

      {!loading && !insight && !error && (
        <div className="py-12 text-center">
          <Brain className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground font-mono text-xs">Click Generate to create a factual AI research note for {data?.overview?.name ?? symbol}.</p>
        </div>
      )}

      {!loading && insight && (
        <div className="bg-background border border-border rounded-xl p-5">
          <div className="prose prose-sm dark:prose-invert max-w-none">
            {insight.split("\n").map((line, i) => {
              const trimmed = line.trim();
              if (!trimmed) return <br key={i} />;
              if (trimmed.startsWith("## ")) return <h3 key={i} className="text-foreground font-display text-sm font-bold mt-4 mb-2">{trimmed.replace("## ", "")}</h3>;
              if (trimmed.startsWith("# "))  return <h2 key={i} className="text-foreground font-display text-base font-bold mt-4 mb-2">{trimmed.replace("# ", "")}</h2>;
              if (trimmed.startsWith("**") && trimmed.endsWith("**")) return <p key={i} className="text-foreground font-semibold text-xs mt-3">{trimmed.replace(/\*\*/g, "")}</p>;
              return <p key={i} className="text-muted-foreground text-xs leading-relaxed mb-2">{trimmed}</p>;
            })}
          </div>
          {genAt && <p className="text-muted-foreground/40 font-mono text-[9px] mt-4 pt-3 border-t border-border">Generated: {genAt}</p>}
        </div>
      )}
    </div>
  );
}
