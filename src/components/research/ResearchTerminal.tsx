"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, TrendingUp, TrendingDown, Sparkles, ExternalLink, GitCompare, Info, RefreshCw, Save, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { refreshStockResearch, saveStockResearch, getTodayResearchPath } from "@/actions/research";
import { formatResearchDateKey, toCompanyKey } from "@/lib/market/research-path";
import { OverviewModule }     from "./OverviewModule";
import { TechnicalModule }    from "./TechnicalModule";
import { FundamentalModule }  from "./FundamentalModule";
import { HistoricalModule }   from "./HistoricalModule";
import { PatternStatsModule } from "./PatternStatsModule";
import { SignalStatsModule }  from "./SignalStatsModule";
import { FrequencyModule }    from "./FrequencyModule";
import { AIInsightsModule }   from "./AIInsightsModule";

const TABS = [
  { id: "overview",    label: "Overview"    },
  { id: "technical",   label: "Technical"   },
  { id: "fundamental", label: "Fundamental" },
  { id: "historical",  label: "Historical"  },
  { id: "patterns",    label: "Patterns"    },
  { id: "signals",     label: "Signals"     },
  { id: "frequency",   label: "Frequency"   },
  { id: "ai",          label: "AI Insights" },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ResearchTerminal({ data }: { data: any }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [isPending, startTransition] = useTransition();
  const [isSaving, setIsSaving] = useState(false);
  const [savedPath, setSavedPath] = useState<string | null>(data?.path ?? null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const autoSaveTried = useRef(false);

  const ov = data?.overview ?? {};
  const isAI = !ov.dataSource || ov.dataSource === "ai";
  const isUp = (ov.priceChange ?? 0) >= 0;
  const TIcon = isUp ? TrendingUp : TrendingDown;
  const color = isUp ? "#00D4AA" : "#FF4D6A";

  const symbol = String(ov.symbol ?? data?.symbol ?? "");
  const name = String(data?.name ?? ov.name ?? "");
  const companyKey = toCompanyKey(name, symbol);
  const dateKey = formatResearchDateKey();
  const previewPath = `${companyKey}/${dateKey}`;

  const redToast = {
    duration: 5000,
    style: {
      background: "#2A0F16",
      border: "1px solid #FF4D6A",
      color: "#FF4D6A",
    },
  } as const;

  async function persistResearch(showSuccessToast: boolean) {
    setIsSaving(true);
    setValidationError(null);
    try {
      const result = await saveStockResearch(data);
      if (result.ok) {
        setSavedPath(result.path);
        setValidationError(null);
        if (showSuccessToast) toast.success(`Saved as ${result.path}`);
        return;
      }
      if (result.reason === "duplicate") {
        setSavedPath(result.path);
        setValidationError(result.message);
        toast.error(result.message, redToast);
        return;
      }
      setValidationError(result.message);
      toast.error(result.message, redToast);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to save research";
      setValidationError(msg);
      toast.error(msg, redToast);
    } finally {
      setIsSaving(false);
    }
  }

  // Auto-save once when research data is displayed
  useEffect(() => {
    if (!symbol || autoSaveTried.current) return;
    autoSaveTried.current = true;

    (async () => {
      const existing = await getTodayResearchPath(name, symbol);
      if (existing?.path) {
        setSavedPath(existing.path);
        const msg = `Research for ${existing.companyKey} on ${existing.researchDateKey} already exists (${existing.path}).`;
        setValidationError(msg);
        toast.error(msg, redToast);
        return;
      }
      await persistResearch(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol]);

  function handleRefresh() {
    startTransition(async () => {
      autoSaveTried.current = false;
      setSavedPath(null);
      setValidationError(null);
      await refreshStockResearch(symbol);
      router.refresh();
    });
  }

  function handleSave() {
    void persistResearch(true);
  }

  const historical = (data?.historical ?? []).map((d: { date: string | Date; close: number; volume: number }) => ({
    date:   new Date(d.date).toISOString().split("T")[0],
    close:  d.close,
    volume: d.volume,
  }));

  return (
    <div className="space-y-4">
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

      {validationError && (
        <div className="flex items-start gap-2.5 px-4 py-3 bg-[#FF4D6A]/10 border border-[#FF4D6A]/40 rounded-xl">
          <AlertCircle className="w-4 h-4 text-[#FF4D6A] mt-0.5 shrink-0" />
          <p className="text-[#FF4D6A] text-xs font-mono leading-relaxed">{validationError}</p>
        </div>
      )}

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-4 md:px-5 py-3 border-b border-border flex items-center gap-2 md:gap-3">
          <button onClick={() => router.back()} className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="text-muted-foreground font-mono text-[10px] uppercase tracking-widest truncate">Stock Research Terminal</span>
          <div className="ml-auto flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleSave}
              disabled={isSaving}
              title={savedPath ? `Saved as ${savedPath}` : `Save as ${previewPath}`}
              className="flex items-center gap-1.5 h-7 px-2.5 bg-[#F0B429]/10 border border-[#F0B429]/30 rounded-lg text-[10px] font-mono text-[#F0B429] hover:bg-[#F0B429]/20 transition-colors disabled:opacity-50"
            >
              <Save className={`w-3 h-3 ${isSaving ? "animate-pulse" : ""}`} />
              <span className="hidden sm:inline">
                {isSaving ? "Saving…" : savedPath ? "Saved" : "Save"}
              </span>
            </button>
            <button
              onClick={handleRefresh}
              disabled={isPending}
              title="Refresh live data"
              className="flex items-center gap-1.5 h-7 px-2.5 bg-accent border border-border rounded-lg text-[10px] font-mono text-muted-foreground hover:text-[#F0B429] hover:border-[#F0B429]/30 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${isPending ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">{isPending ? "Updating…" : "Refresh"}</span>
            </button>
            <Link href={`/research/compare?symbols=${symbol.replace(".NS","")}`}>
              <button className="hidden sm:flex items-center gap-1.5 h-7 px-2.5 bg-accent border border-border rounded-lg text-[10px] font-mono text-muted-foreground hover:text-[#F0B429] hover:border-[#F0B429]/30 transition-colors">
                <GitCompare className="w-3 h-3" /> Compare
              </button>
            </Link>
            {ov.website && (
              <a href={ov.website} target="_blank" rel="noopener noreferrer">
                <button className="hidden md:flex items-center gap-1.5 h-7 px-2.5 bg-accent border border-border rounded-lg text-[10px] font-mono text-muted-foreground hover:text-[#F0B429] hover:border-[#F0B429]/30 transition-colors">
                  <ExternalLink className="w-3 h-3" /> Website
                </button>
              </a>
            )}
          </div>
        </div>

        <div className="px-4 md:px-5 py-1.5 border-b border-border bg-background/40 flex items-center justify-between gap-2">
          <p className="text-muted-foreground font-mono text-[9px] uppercase tracking-widest truncate">
            {savedPath ? `Saved path: ${savedPath}` : isSaving ? `Saving as: ${previewPath}` : `Will save as: ${previewPath}`}
          </p>
          {!savedPath && !isSaving && (
            <span className="text-muted-foreground/60 font-mono text-[9px] shrink-0">Auto-saving…</span>
          )}
        </div>

        <div className="px-4 md:px-5 py-4 flex flex-col sm:flex-row sm:items-start gap-4 sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-[#F0B429]/10 border border-[#F0B429]/20 flex items-center justify-center shrink-0">
              <span className="text-[#F0B429] font-black text-xs md:text-sm">{symbol.slice(0, 3) || "??"}</span>
            </div>
            <div className="min-w-0">
              <h1 className="font-display text-foreground text-lg md:text-xl font-bold truncate">{ov.name}</h1>
              <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                <span className="text-muted-foreground font-mono text-[10px]">{symbol}</span>
                {ov.exchange && <span className="text-muted-foreground font-mono text-[10px]">· {ov.exchange}</span>}
                {ov.sector   && <span className="text-muted-foreground font-mono text-[10px] hidden sm:inline">· {ov.sector}</span>}
              </div>
            </div>
          </div>

          <div className="flex items-end justify-between sm:flex-col sm:items-end gap-2">
            <div>
              <p className="font-display text-2xl md:text-3xl font-bold text-foreground">
                ₹{(ov.currentPrice ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5" style={{ color }}>
                <TIcon className="w-3.5 h-3.5" />
                <span className="font-mono text-sm font-bold">
                  {isUp ? "+" : ""}{(ov.priceChange ?? 0).toFixed(2)} ({isUp ? "+" : ""}{((ov.priceChangePct ?? 0) * 100).toFixed(2)}%)
                </span>
              </div>
            </div>
            <div className="text-right">
              {ov.weekHigh52 && <p className="text-[10px] font-mono text-muted-foreground">52W H: <span className="text-foreground">₹{Number(ov.weekHigh52).toLocaleString("en-IN")}</span></p>}
              {ov.weekLow52  && <p className="text-[10px] font-mono text-muted-foreground">52W L: <span className="text-foreground">₹{Number(ov.weekLow52).toLocaleString("en-IN")}</span></p>}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="flex overflow-x-auto border-b border-border [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
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
            className="p-3 md:p-5"
          >
            {activeTab === "overview"    && <OverviewModule    data={data} historical={historical} />}
            {activeTab === "technical"   && <TechnicalModule   data={data} historical={historical} />}
            {activeTab === "fundamental" && <FundamentalModule data={data} />}
            {activeTab === "historical"  && <HistoricalModule  data={data} historical={historical} />}
            {activeTab === "patterns"    && <PatternStatsModule data={data} />}
            {activeTab === "signals"     && <SignalStatsModule  data={data} />}
            {activeTab === "frequency"   && <FrequencyModule    data={data} />}
            {activeTab === "ai"          && <AIInsightsModule   data={data} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
