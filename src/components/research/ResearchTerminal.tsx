"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, TrendingUp, TrendingDown, Sparkles, ExternalLink, GitCompare, Info } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { OverviewModule }     from "./OverviewModule";
import { TechnicalModule }    from "./TechnicalModule";
import { FundamentalModule }  from "./FundamentalModule";
import { HistoricalModule }   from "./HistoricalModule";
import { PatternStatsModule } from "./PatternStatsModule";
import { SignalStatsModule }  from "./SignalStatsModule";
import { AIInsightsModule }   from "./AIInsightsModule";

const TABS = [
  { id: "overview",    label: "Overview"    },
  { id: "technical",   label: "Technical"   },
  { id: "fundamental", label: "Fundamental" },
  { id: "historical",  label: "Historical"  },
  { id: "patterns",    label: "Patterns"    },
  { id: "signals",     label: "Signals"     },
  { id: "ai",          label: "AI Insights" },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ResearchTerminal({ data }: { data: any }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");

  const ov = data?.overview ?? {};
  const isAI = !ov.dataSource || ov.dataSource === "ai";
  const isUp = (ov.priceChange ?? 0) >= 0;
  const TIcon = isUp ? TrendingUp : TrendingDown;
  const color = isUp ? "#00D4AA" : "#FF4D6A";

  const historical = (data?.historical ?? []).map((d: { date: string | Date; close: number; volume: number }) => ({
    date:   new Date(d.date).toISOString().split("T")[0],
    close:  d.close,
    volume: d.volume,
  }));

  return (
    <div className="space-y-4">
      {/* Data source banner — only shown when Yahoo Finance is unavailable and AI is used */}
      {isAI && (
        <div className="flex items-start gap-2.5 px-4 py-3 bg-[#FF8C42]/6 border border-[#FF8C42]/20 rounded-xl">
          <Sparkles className="w-3.5 h-3.5 text-[#FF8C42] mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[#FF8C42] text-[10px] font-mono font-semibold uppercase tracking-widest mb-0.5">AI-Estimated Data — Live market feed unavailable</p>
            <p className="text-muted-foreground text-[10px] font-mono leading-relaxed">
              Prices, ratios, and indicators are AI-estimated from training knowledge — not real-time. Actual market values may differ significantly.
            </p>
          </div>
          <Info className="w-3.5 h-3.5 text-muted-foreground/40 mt-0.5 shrink-0" />
        </div>
      )}

      {/* Stock Header */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-border flex items-center gap-3">
          <button onClick={() => router.back()} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="text-muted-foreground font-mono text-[10px] uppercase tracking-widest">Stock Research Terminal</span>
          <div className="ml-auto flex items-center gap-2">
            <Link href={`/research/compare?symbols=${ov.symbol?.replace(".NS","")}`}>
              <button className="flex items-center gap-1.5 h-7 px-3 bg-accent border border-border rounded-lg text-[10px] font-mono text-muted-foreground hover:text-[#F0B429] hover:border-[#F0B429]/30 transition-colors">
                <GitCompare className="w-3 h-3" /> Compare
              </button>
            </Link>
            {ov.website && (
              <a href={ov.website} target="_blank" rel="noopener noreferrer">
                <button className="flex items-center gap-1.5 h-7 px-3 bg-accent border border-border rounded-lg text-[10px] font-mono text-muted-foreground hover:text-[#F0B429] hover:border-[#F0B429]/30 transition-colors">
                  <ExternalLink className="w-3 h-3" /> Website
                </button>
              </a>
            )}
          </div>
        </div>

        <div className="px-5 py-4 flex flex-wrap items-start gap-4 justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#F0B429]/10 border border-[#F0B429]/20 flex items-center justify-center shrink-0">
              <span className="text-[#F0B429] font-black text-sm">{(ov.symbol ?? "??").slice(0, 3)}</span>
            </div>
            <div>
              <h1 className="font-display text-foreground text-xl font-bold">{ov.name}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="text-muted-foreground font-mono text-[10px]">{ov.symbol}</span>
                {ov.exchange && <span className="text-muted-foreground font-mono text-[10px]">· {ov.exchange}</span>}
                {ov.sector   && <span className="text-muted-foreground font-mono text-[10px]">· {ov.sector}</span>}
              </div>
            </div>
          </div>

          <div className="flex items-end gap-4">
            <div>
              <p className="font-display text-3xl font-bold text-foreground">
                ₹{(ov.currentPrice ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </p>
              <div className="flex items-center gap-1.5 mt-1" style={{ color }}>
                <TIcon className="w-3.5 h-3.5" />
                <span className="font-mono text-sm font-bold">
                  {isUp ? "+" : ""}{(ov.priceChange ?? 0).toFixed(2)} ({isUp ? "+" : ""}{((ov.priceChangePct ?? 0) * 100).toFixed(2)}%)
                </span>
              </div>
            </div>
            <div className="text-right">
              {ov.weekHigh52 && <p className="text-[10px] font-mono text-muted-foreground">52W H: <span className="text-foreground">₹{ov.weekHigh52.toLocaleString("en-IN")}</span></p>}
              {ov.weekLow52  && <p className="text-[10px] font-mono text-muted-foreground">52W L: <span className="text-foreground">₹{ov.weekLow52.toLocaleString("en-IN")}</span></p>}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="flex overflow-x-auto border-b border-border">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-4 py-3 font-mono text-[11px] uppercase tracking-widest whitespace-nowrap transition-colors shrink-0 ${
                activeTab === tab.id
                  ? "text-[#F0B429]"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="tabLine"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F0B429]"
                />
              )}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="p-5"
          >
            {activeTab === "overview"    && <OverviewModule    data={data} historical={historical} />}
            {activeTab === "technical"   && <TechnicalModule   data={data} historical={historical} />}
            {activeTab === "fundamental" && <FundamentalModule data={data} />}
            {activeTab === "historical"  && <HistoricalModule  data={data} historical={historical} />}
            {activeTab === "patterns"    && <PatternStatsModule data={data} />}
            {activeTab === "signals"     && <SignalStatsModule  data={data} />}
            {activeTab === "ai"          && <AIInsightsModule   data={data} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
