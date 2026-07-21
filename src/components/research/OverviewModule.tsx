"use client";

import { PriceChart } from "./charts/PriceChart";

function fmt(v: unknown, prefix = "", suffix = "", decimals = 2) {
  if (v == null) return "—";
  const n = Number(v);
  if (isNaN(n)) return "—";
  if (Math.abs(n) >= 1e12) return `${prefix}${(n / 1e12).toFixed(2)}T${suffix}`;
  if (Math.abs(n) >= 1e9)  return `${prefix}${(n / 1e9).toFixed(2)}B${suffix}`;
  if (Math.abs(n) >= 1e7)  return `${prefix}${(n / 1e7).toFixed(2)}Cr${suffix}`;
  if (Math.abs(n) >= 1e5)  return `${prefix}${(n / 1e5).toFixed(2)}L${suffix}`;
  return `${prefix}${n.toLocaleString("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${suffix}`;
}
function fmtINR(v: unknown) { return v != null ? `₹${fmt(v, "", "", 2)}` : "—"; }
function fmtPct(v: unknown) { return v != null ? `${(Number(v) * 100).toFixed(2)}%` : "—"; }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function OverviewModule({ data, historical }: { data: any; historical: any[] }) {
  const ov = data?.overview ?? {};
  const tech = data?.technical ?? {};
  const sr = tech?.supportResistance ?? {};

  const stats = [
    { label: "Current Price",  value: fmtINR(ov.currentPrice) },
    { label: "Previous Close", value: fmtINR(ov.previousClose) },
    { label: "Day Open",       value: fmtINR(ov.open) },
    { label: "Day High",       value: fmtINR(ov.dayHigh) },
    { label: "Day Low",        value: fmtINR(ov.dayLow) },
    { label: "52W High",       value: fmtINR(ov.weekHigh52) },
    { label: "52W Low",        value: fmtINR(ov.weekLow52) },
    { label: "All-Time High",  value: fmtINR(ov.allTimeHigh) },
    { label: "Market Cap",     value: fmtINR(ov.marketCap) },
    { label: "Volume",         value: ov.volume ? ov.volume.toLocaleString("en-IN") : "—" },
    { label: "Avg Volume",     value: ov.avgVolume ? ov.avgVolume.toLocaleString("en-IN") : "—" },
    { label: "Beta",           value: ov.beta != null ? Number(ov.beta).toFixed(2) : "—" },
    { label: "PE Ratio",       value: ov.peRatio != null ? Number(ov.peRatio).toFixed(2) : "—" },
    { label: "EPS (TTM)",      value: fmtINR(ov.eps) },
    { label: "Dividend Yield", value: fmtPct(ov.dividendYield) },
    { label: "Face Value",     value: fmtINR(ov.faceValue) },
    { label: "Employees",      value: ov.employees ? ov.employees.toLocaleString() : "—" },
    { label: "Sector",         value: ov.sector || "—" },
    { label: "Industry",       value: ov.industry || "—" },
    { label: "Exchange",       value: ov.exchange || "—" },
  ];

  const signals = [
    { label: "Trend",       value: tech.trend ?? "—",     color: tech.trend === "Uptrend" ? "#00D4AA" : tech.trend === "Downtrend" ? "#FF4D6A" : "#FF8C42" },
    { label: "MA Cross",    value: tech.crossSignal ?? "—", color: tech.crossSignal === "Golden Cross" ? "#00D4AA" : "#FF4D6A" },
    { label: "RSI Signal",  value: tech.rsiSignal ?? "—", color: tech.rsiSignal === "Oversold" ? "#00D4AA" : tech.rsiSignal === "Overbought" ? "#FF4D6A" : "#FF8C42" },
    { label: "MACD Signal", value: tech.macdSignal ?? "—", color: tech.macdSignal === "Bullish" ? "#00D4AA" : "#FF4D6A" },
    { label: "BB Signal",   value: tech.bbSignal ?? "—",   color: "#FF8C42" },
    { label: "Candle Pattern", value: (tech.candlePatterns ?? []).join(", ") || "None", color: "#F0B429" },
  ];

  return (
    <div className="space-y-6">
      {/* Price Chart */}
      <div>
        <p className="text-muted-foreground font-mono text-[10px] uppercase tracking-widest mb-3">Price History (5 Years)</p>
        <PriceChart
          data={historical}
          support={sr.support}
          resistance={sr.resistance}
          sma20={tech?.sma?.sma20}
          sma50={tech?.sma?.sma50}
        />
      </div>

      {/* Quick signals */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {signals.map(({ label, value, color }) => (
          <div key={label} className="bg-background border border-border rounded-lg p-3 text-center">
            <p className="text-muted-foreground font-mono text-[9px] uppercase tracking-widest mb-1">{label}</p>
            <p className="text-xs font-bold font-mono" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Key stats grid */}
      <div>
        <p className="text-muted-foreground font-mono text-[10px] uppercase tracking-widest mb-3">Key Statistics</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-0 border border-border rounded-xl overflow-hidden">
          {stats.map(({ label, value }, i) => (
            <div key={label} className={`flex items-center justify-between px-4 py-2.5 border-b border-r border-border ${i % 3 === 2 ? "border-r-0" : ""} last:border-b-0`}>
              <span className="text-muted-foreground font-mono text-[10px] uppercase tracking-widest">{label}</span>
              <span className="text-foreground font-mono text-xs font-bold">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Description */}
      {ov.description && (
        <div>
          <p className="text-muted-foreground font-mono text-[10px] uppercase tracking-widest mb-2">About</p>
          <p className="text-muted-foreground text-xs leading-relaxed line-clamp-4">{ov.description}</p>
        </div>
      )}
    </div>
  );
}
