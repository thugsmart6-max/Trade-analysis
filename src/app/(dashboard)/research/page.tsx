export const dynamic = "force-dynamic";

import { ResearchSearch } from "@/components/research/ResearchSearch";
import { TrendingUp, BarChart3, Brain, Activity } from "lucide-react";

const POPULAR = [
  "RELIANCE", "TCS", "INFY", "HDFCBANK", "ICICIBANK",
  "SBIN", "WIPRO", "BAJFINANCE", "ADANIENT", "MARUTI",
];

const FEATURES = [
  { icon: TrendingUp, title: "Technical Analysis",    desc: "RSI, MACD, Bollinger Bands, ADX, ATR, VWAP, Fibonacci & more" },
  { icon: BarChart3,  title: "Fundamental Analysis",  desc: "PE, PB, ROE, ROCE, EPS, Debt/Equity, Cash Flow & 20+ ratios" },
  { icon: Activity,   title: "Pattern & Signal Stats", desc: "Historical pattern success rates, signal statistics & backtest data" },
  { icon: Brain,      title: "AI Insights",           desc: "Neutral, data-driven research notes powered by AI — no recommendations" },
];

export default function ResearchPage() {
  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <span className="text-muted-foreground font-mono text-[10px] uppercase tracking-widest block mb-3">
          Stock Research Platform
        </span>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground tracking-tight mb-3">
          Market<span className="text-[#F0B429]">Intelligence</span>
        </h1>
        <p className="text-muted-foreground text-sm max-w-xl mx-auto leading-relaxed">
          Technical analysis, fundamental ratios, historical statistics, and AI observations — all in one terminal.
          No investment recommendations, only data.
        </p>
      </div>

      {/* Search */}
      <div className="mb-8">
        <ResearchSearch />
      </div>

      {/* Popular */}
      <div className="mb-10">
        <p className="text-muted-foreground font-mono text-[10px] uppercase tracking-widest mb-3">Popular stocks</p>
        <div className="flex flex-wrap gap-2">
          {POPULAR.map((s) => (
            <a
              key={s}
              href={`/research/${s}`}
              className="px-3 py-1.5 bg-card border border-border rounded-lg text-xs font-mono text-muted-foreground hover:text-[#F0B429] hover:border-[#F0B429]/40 transition-colors"
            >
              {s}
            </a>
          ))}
        </div>
      </div>

      {/* Feature grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {FEATURES.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-[#F0B429]/10 border border-[#F0B429]/20 flex items-center justify-center">
                <Icon className="w-4 h-4 text-[#F0B429]" />
              </div>
              <h3 className="font-display text-sm font-semibold text-foreground">{title}</h3>
            </div>
            <p className="text-muted-foreground text-xs leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
