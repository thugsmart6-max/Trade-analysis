export const dynamic = "force-dynamic";

import { ResearchSearch } from "@/components/research/ResearchSearch";
import Link from "next/link";
import { TrendingUp, BarChart3, Brain, Activity, GitCompare, Crosshair, Filter } from "lucide-react";

const POPULAR = [
  "RELIANCE", "TCS", "INFY", "HDFCBANK", "ICICIBANK",
  "SBIN", "WIPRO", "BAJFINANCE", "ADANIENT", "MARUTI",
];

const FEATURES = [
  { icon: TrendingUp, title: "Multi-Level S/R", desc: "Three support & resistance cards with strength, touches, and distance %" },
  { icon: Filter,     title: "Trend Filters", desc: "Scan uptrends, triangles, flags, wedges, and chart patterns" },
  { icon: Crosshair,  title: "SMA / EMA Scanners", desc: "Golden Cross, Death Cross, and short-window MA crossovers" },
  { icon: BarChart3,  title: "Volume Scanner", desc: "Compare today's volume vs 20/50/75/100-day averages" },
  { icon: Activity,   title: "Frequency Analysis", desc: "Occurrence counts, avg move, success frequency for every event" },
  { icon: GitCompare, title: "Comparison Desk", desc: "Side-by-side PE, ROE, RSI, volume ratio, 52W distance & more" },
  { icon: Brain,      title: "AI Insights", desc: "Neutral research notes — factual observations only" },
];

export default function ResearchPage() {
  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto w-full">
      <div className="text-center mb-8 md:mb-10">
        <span className="text-muted-foreground font-mono text-[10px] uppercase tracking-widest block mb-3">
          Trading Research Dashboard
        </span>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground tracking-tight mb-3">
          Market<span className="text-[#F0B429]">Intelligence</span>
        </h1>
        <p className="text-muted-foreground text-sm max-w-xl mx-auto leading-relaxed">
          Bloomberg-style scanners, multi-level levels, chart patterns, and frequency stats.
          No Buy / Hold / Sell recommendations — data only.
        </p>
      </div>

      <div className="mb-6">
        <ResearchSearch />
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10">
        <Link href="/research/scanners" className="bg-card border border-border rounded-xl p-4 hover:border-[#F0B429]/40 transition-colors">
          <Filter className="w-4 h-4 text-[#F0B429] mb-2" />
          <p className="font-display text-sm font-semibold text-foreground">Scanners</p>
          <p className="text-muted-foreground text-[10px] font-mono mt-1">Trend · Cross · Volume</p>
        </Link>
        <Link href="/research/compare" className="bg-card border border-border rounded-xl p-4 hover:border-[#F0B429]/40 transition-colors">
          <GitCompare className="w-4 h-4 text-[#F0B429] mb-2" />
          <p className="font-display text-sm font-semibold text-foreground">Compare</p>
          <p className="text-muted-foreground text-[10px] font-mono mt-1">Up to 6 stocks</p>
        </Link>
        <Link href="/research/TCS" className="bg-card border border-border rounded-xl p-4 hover:border-[#F0B429]/40 transition-colors">
          <TrendingUp className="w-4 h-4 text-[#F0B429] mb-2" />
          <p className="font-display text-sm font-semibold text-foreground">Terminal</p>
          <p className="text-muted-foreground text-[10px] font-mono mt-1">Open sample: TCS</p>
        </Link>
      </div>

      <div className="mb-10">
        <p className="text-muted-foreground font-mono text-[10px] uppercase tracking-widest mb-3">Popular stocks</p>
        <div className="flex flex-wrap gap-2">
          {POPULAR.map((s) => (
            <Link
              key={s}
              href={`/research/${s}`}
              className="px-3 py-1.5 bg-card border border-border rounded-lg text-xs font-mono text-muted-foreground hover:text-[#F0B429] hover:border-[#F0B429]/40 transition-colors"
            >
              {s}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {FEATURES.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="bg-card/80 backdrop-blur-sm border border-border rounded-xl p-5">
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
