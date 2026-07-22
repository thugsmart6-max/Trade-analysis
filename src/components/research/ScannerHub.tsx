"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Loader2, Filter, Crosshair, BarChart3 } from "lucide-react";
import { scanByTrend, scanByCross, scanByVolume } from "@/actions/research";

const CHART_PATTERNS = [
  "Ascending Triangle", "Descending Triangle", "Symmetrical Triangle",
  "Cup and Handle", "Double Top", "Double Bottom",
  "Head and Shoulders", "Inverse Head and Shoulders",
  "Bull Flag", "Bear Flag", "Pennant", "Rectangle",
  "Ascending Channel", "Descending Channel",
  "Rising Wedge", "Falling Wedge", "Rounded Bottom", "Rounded Top",
] as const;

const TRENDS = [
  "Uptrend", "Strong Uptrend", "Downtrend", "Strong Downtrend",
  "Sideways", "Consolidation",
  ...CHART_PATTERNS,
];

const CROSS_TYPES = [
  { value: "any", label: "Any Cross" },
  { value: "SMA20×SMA50", label: "SMA20 × SMA50" },
  { value: "SMA50×SMA200", label: "SMA50 × SMA200" },
  { value: "EMA20×EMA50", label: "EMA20 × EMA50" },
  { value: "EMA50×EMA200", label: "EMA50 × EMA200" },
  { value: "Golden Cross", label: "Golden Cross" },
  { value: "Death Cross", label: "Death Cross" },
] as const;

const LOOKBACKS = [
  { value: 1, label: "Today" },
  { value: 3, label: "Past 3 Days" },
  { value: 7, label: "Past 7 Days" },
  { value: 15, label: "Past 15 Days" },
  { value: 30, label: "Past 30 Days" },
];

const VOL_FILTERS = [
  { value: "gte_100", label: "≥ 100% Avg" },
  { value: "gte_120", label: "≥ 120% Avg" },
  { value: "gte_150", label: "≥ 150% Avg" },
  { value: "gte_200", label: "≥ 200% Avg" },
] as const;

const AVG_PERIODS = [20, 50, 75, 100] as const;

type Tab = "trend" | "cross" | "volume";

function fmtINR(v: unknown) {
  if (v == null) return "—";
  return `₹${Number(v).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}
function fmtVol(v: unknown) {
  if (v == null) return "—";
  return Number(v).toLocaleString("en-IN");
}

export function ScannerHub() {
  const [tab, setTab] = useState<Tab>("trend");
  const [pending, startTransition] = useTransition();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [rows, setRows] = useState<any[]>([]);

  const [trend, setTrend] = useState("Uptrend");
  const [crossType, setCrossType] = useState<string>("Golden Cross");
  const [lookback, setLookback] = useState(7);
  const [volFilter, setVolFilter] = useState<"gte_100" | "gte_120" | "gte_150" | "gte_200">("gte_150");
  const [avgPeriod, setAvgPeriod] = useState<20 | 50 | 75 | 100>(20);

  function run() {
    startTransition(async () => {
      if (tab === "trend") {
        setRows(await scanByTrend(trend));
      } else if (tab === "cross") {
        setRows(await scanByCross({
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          crossType: crossType as any,
          lookbackDays: lookback,
        }));
      } else {
        setRows(await scanByVolume({ filter: volFilter, avgPeriod }));
      }
    });
  }

  return (
    <div className="space-y-5">
      {/* Sticky filter bar */}
      <div className="sticky top-0 z-20 -mx-1 px-1 py-2 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="flex flex-wrap gap-2 mb-3">
          {([
            { id: "trend" as const, label: "Trend Filter", icon: Filter },
            { id: "cross" as const, label: "SMA Crossover", icon: Crosshair },
            { id: "volume" as const, label: "Volume Filter", icon: BarChart3 },
          ]).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => { setTab(id); setRows([]); }}
              className={`flex items-center gap-1.5 h-8 px-3 rounded-lg font-mono text-[10px] uppercase tracking-widest border transition-colors ${
                tab === id
                  ? "bg-[#F0B429]/10 text-[#F0B429] border-[#F0B429]/30"
                  : "bg-card text-muted-foreground border-border hover:text-foreground"
              }`}
            >
              <Icon className="w-3 h-3" /> {label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-end gap-3">
          {tab === "trend" && (
            <div className="flex-1 min-w-[180px]">
              <label className="text-muted-foreground font-mono text-[9px] uppercase tracking-widest block mb-1">Trend / Pattern</label>
              <select
                value={trend}
                onChange={(e) => setTrend(e.target.value)}
                className="w-full h-9 px-3 bg-card border border-border rounded-lg text-foreground font-mono text-xs focus:outline-none focus:border-[#F0B429]/50"
              >
                {TRENDS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          )}

          {tab === "cross" && (
            <>
              <div className="flex-1 min-w-[160px]">
                <label className="text-muted-foreground font-mono text-[9px] uppercase tracking-widest block mb-1">Cross Type</label>
                <select
                  value={crossType}
                  onChange={(e) => setCrossType(e.target.value)}
                  className="w-full h-9 px-3 bg-card border border-border rounded-lg text-foreground font-mono text-xs focus:outline-none focus:border-[#F0B429]/50"
                >
                  {CROSS_TYPES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div className="min-w-[140px]">
                <label className="text-muted-foreground font-mono text-[9px] uppercase tracking-widest block mb-1">Lookback</label>
                <select
                  value={lookback}
                  onChange={(e) => setLookback(Number(e.target.value))}
                  className="w-full h-9 px-3 bg-card border border-border rounded-lg text-foreground font-mono text-xs focus:outline-none focus:border-[#F0B429]/50"
                >
                  {LOOKBACKS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
              </div>
            </>
          )}

          {tab === "volume" && (
            <>
              <div className="flex-1 min-w-[140px]">
                <label className="text-muted-foreground font-mono text-[9px] uppercase tracking-widest block mb-1">Volume vs Avg</label>
                <select
                  value={volFilter}
                  onChange={(e) => setVolFilter(e.target.value as typeof volFilter)}
                  className="w-full h-9 px-3 bg-card border border-border rounded-lg text-foreground font-mono text-xs focus:outline-none focus:border-[#F0B429]/50"
                >
                  {VOL_FILTERS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
              </div>
              <div className="min-w-[120px]">
                <label className="text-muted-foreground font-mono text-[9px] uppercase tracking-widest block mb-1">Avg Period</label>
                <select
                  value={avgPeriod}
                  onChange={(e) => setAvgPeriod(Number(e.target.value) as typeof avgPeriod)}
                  className="w-full h-9 px-3 bg-card border border-border rounded-lg text-foreground font-mono text-xs focus:outline-none focus:border-[#F0B429]/50"
                >
                  {AVG_PERIODS.map((p) => <option key={p} value={p}>{p}-Day Avg</option>)}
                </select>
              </div>
            </>
          )}

          <button
            onClick={run}
            disabled={pending}
            className="h-9 px-5 bg-[#F0B429] text-[#080808] rounded-lg font-mono text-[10px] uppercase tracking-widest font-bold hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
          >
            {pending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
            Scan
          </button>
        </div>
      </div>

      {/* Results */}
      {pending && (
        <div className="py-16 flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 text-[#F0B429] animate-spin" />
          <p className="text-muted-foreground font-mono text-xs">Scanning NSE universe…</p>
        </div>
      )}

      {!pending && !rows.length && (
        <div className="py-16 text-center border border-dashed border-border rounded-xl">
          <p className="text-muted-foreground font-mono text-xs">Set filters and click Scan. Results use cached research data.</p>
        </div>
      )}

      {!pending && rows.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[700px] text-left">
            <thead>
              <tr className="border-b border-border bg-background/60">
                {tab === "trend" && ["Company", "Trend", "Pattern", "Price", "Change", "RSI", "Volume"].map((h) => (
                  <th key={h} className="px-3 py-2.5 text-muted-foreground/60 font-mono text-[9px] uppercase tracking-widest">{h}</th>
                ))}
                {tab === "cross" && ["Company", "Cross Type", "Date", "Price", "% Since Cross", "Trend", "Volume"].map((h) => (
                  <th key={h} className="px-3 py-2.5 text-muted-foreground/60 font-mono text-[9px] uppercase tracking-widest">{h}</th>
                ))}
                {tab === "volume" && ["Company", "Today Vol", "Avg Vol", "Ratio", "Increase %", "Trend", "Pattern"].map((h) => (
                  <th key={h} className="px-3 py-2.5 text-muted-foreground/60 font-mono text-[9px] uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const sym = String(r.symbol ?? "").replace(".NS", "");
                return (
                  <tr key={`${sym}-${r.crossType ?? r.pattern ?? ""}-${r.crossDate ?? ""}`} className="border-b border-border last:border-0 hover:bg-accent/40">
                    <td className="px-3 py-2.5">
                      <Link href={`/research/${sym}`} className="text-[#F0B429] font-mono text-xs font-bold hover:underline">
                        {sym}
                      </Link>
                      <p className="text-muted-foreground font-mono text-[9px] truncate max-w-[140px]">{r.name}</p>
                    </td>
                    {tab === "trend" && (
                      <>
                        <td className="px-3 py-2.5 text-foreground font-mono text-xs">{r.trend}</td>
                        <td className="px-3 py-2.5 text-muted-foreground font-mono text-xs">{r.pattern}</td>
                        <td className="px-3 py-2.5 text-foreground font-mono text-xs">{fmtINR(r.price)}</td>
                        <td className="px-3 py-2.5 font-mono text-xs" style={{ color: Number(r.changePct) >= 0 ? "#00D4AA" : "#FF4D6A" }}>
                          {r.changePct != null ? `${(Number(r.changePct) * 100).toFixed(2)}%` : "—"}
                        </td>
                        <td className="px-3 py-2.5 text-foreground font-mono text-xs">{r.rsi != null ? Number(r.rsi).toFixed(1) : "—"}</td>
                        <td className="px-3 py-2.5 text-muted-foreground font-mono text-xs">{fmtVol(r.volume)}</td>
                      </>
                    )}
                    {tab === "cross" && (
                      <>
                        <td className="px-3 py-2.5 text-[#F0B429] font-mono text-xs font-semibold">{r.crossType}</td>
                        <td className="px-3 py-2.5 text-muted-foreground font-mono text-xs">{r.crossDate}</td>
                        <td className="px-3 py-2.5 text-foreground font-mono text-xs">{fmtINR(r.price)}</td>
                        <td className="px-3 py-2.5 font-mono text-xs font-bold" style={{ color: Number(r.pctSinceCross) >= 0 ? "#00D4AA" : "#FF4D6A" }}>
                          {r.pctSinceCross != null ? `${r.pctSinceCross}%` : "—"}
                        </td>
                        <td className="px-3 py-2.5 text-foreground font-mono text-xs">{r.trend}</td>
                        <td className="px-3 py-2.5 text-muted-foreground font-mono text-xs">{fmtVol(r.volume)}</td>
                      </>
                    )}
                    {tab === "volume" && (
                      <>
                        <td className="px-3 py-2.5 text-foreground font-mono text-xs">{fmtVol(r.todayVolume)}</td>
                        <td className="px-3 py-2.5 text-muted-foreground font-mono text-xs">{fmtVol(r.averageVolume)}</td>
                        <td className="px-3 py-2.5 text-[#F0B429] font-mono text-xs font-bold">{r.volumeRatio != null ? `${r.volumeRatio}×` : "—"}</td>
                        <td className="px-3 py-2.5 font-mono text-xs" style={{ color: Number(r.increasePct) >= 0 ? "#00D4AA" : "#FF4D6A" }}>
                          {r.increasePct != null ? `${r.increasePct}%` : "—"}
                        </td>
                        <td className="px-3 py-2.5 text-foreground font-mono text-xs">{r.trend}</td>
                        <td className="px-3 py-2.5 text-muted-foreground font-mono text-xs">{r.pattern}</td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
