"use client";

import { useState, Fragment } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, X } from "lucide-react";

function n(v: unknown, d = 2) { return v != null ? Number(v).toFixed(d) : "—"; }
function pct(v: unknown) {
  if (v == null) return "—";
  const num = Number(v);
  // Already percentage (0-100) vs decimal (0-1)
  const val = Math.abs(num) <= 1 ? num * 100 : num;
  return `${val.toFixed(2)}%`;
}
function inr(v: unknown) {
  if (v == null) return "—";
  const num = Number(v);
  if (Math.abs(num) >= 1e7) return `₹${(num / 1e7).toFixed(2)}Cr`;
  return `₹${num.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}
function dist52(current: unknown, level: unknown) {
  if (current == null || level == null) return "—";
  const c = Number(current), l = Number(level);
  if (!c) return "—";
  return `${(((c - l) / l) * 100).toFixed(2)}%`;
}

const METRICS = [
  { section: "Price & Range", rows: [
    { label: "Current Price", get: (d: Record<string, unknown>) => inr((d.overview as Record<string,unknown>)?.currentPrice) },
    { label: "52W High Distance", get: (d: Record<string, unknown>) => {
      const ov = d.overview as Record<string,unknown>;
      return dist52(ov?.currentPrice, ov?.weekHigh52);
    }},
    { label: "52W Low Distance", get: (d: Record<string, unknown>) => {
      const ov = d.overview as Record<string,unknown>;
      return dist52(ov?.currentPrice, ov?.weekLow52);
    }},
    { label: "Market Cap", get: (d: Record<string, unknown>) => inr((d.overview as Record<string,unknown>)?.marketCap) },
  ]},
  { section: "Technical", rows: [
    { label: "RSI", get: (d: Record<string, unknown>) => n((d.technical as Record<string,unknown>)?.rsi) },
    { label: "MACD", get: (d: Record<string, unknown>) => (d.technical as Record<string,unknown>)?.macdSignal as string ?? "—" },
    { label: "Trend", get: (d: Record<string, unknown>) => (d.technical as Record<string,unknown>)?.trend as string ?? "—" },
    { label: "Pattern", get: (d: Record<string, unknown>) => {
      const pats = (d.technical as Record<string,unknown>)?.chartPatterns as Array<{ pattern: string }> | undefined;
      return pats?.[0]?.pattern ?? "—";
    }},
    { label: "Volume Ratio", get: (d: Record<string, unknown>) => {
      const vp = (d.technical as Record<string,unknown>)?.volumeProfile as Record<string,unknown> | undefined;
      return vp?.ratio20 != null ? `${vp.ratio20}×` : "—";
    }},
  ]},
  { section: "Fundamentals", rows: [
    { label: "ROE", get: (d: Record<string, unknown>) => pct((d.fundamental as Record<string,unknown>)?.roe) },
    { label: "ROCE", get: (d: Record<string, unknown>) => pct((d.fundamental as Record<string,unknown>)?.roce) },
    { label: "PE", get: (d: Record<string, unknown>) => n((d.fundamental as Record<string,unknown>)?.peRatio) },
    { label: "PB", get: (d: Record<string, unknown>) => n((d.fundamental as Record<string,unknown>)?.pbRatio) },
    { label: "EPS", get: (d: Record<string, unknown>) => inr((d.fundamental as Record<string,unknown>)?.eps) },
    { label: "Revenue Growth", get: (d: Record<string, unknown>) => pct((d.fundamental as Record<string,unknown>)?.revenueGrowth) },
    { label: "Profit Growth", get: (d: Record<string, unknown>) => pct((d.fundamental as Record<string,unknown>)?.earningsGrowth) },
    { label: "Debt to Equity", get: (d: Record<string, unknown>) => n((d.fundamental as Record<string,unknown>)?.debtToEquity) },
    { label: "Dividend Yield", get: (d: Record<string, unknown>) => pct((d.fundamental as Record<string,unknown>)?.dividendYield) },
  ]},
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ComparisonModule({ data, initialSymbols }: { data: any[]; initialSymbols: string[] }) {
  const router = useRouter();
  const [newSymbol, setNewSymbol] = useState("");

  function addSymbol() {
    const s = newSymbol.trim().toUpperCase();
    if (!s) return;
    const updated = [...initialSymbols.filter(Boolean), s].slice(0, 6);
    router.push(`/research/compare?symbols=${updated.join(",")}`);
    setNewSymbol("");
  }

  function removeSymbol(sym: string) {
    const clean = sym.replace(".NS", "");
    const updated = initialSymbols.filter((s) => s !== sym && s !== clean && s !== `${clean}.NS`);
    router.push(`/research/compare?symbols=${updated.join(",")}`);
  }

  return (
    <div className="space-y-5">
      <div>
        <span className="text-muted-foreground font-mono text-[10px] uppercase tracking-widest block mb-1">Multi-Stock Comparison</span>
        <h1 className="font-display text-2xl font-bold text-foreground">Side-by-Side Research</h1>
        <p className="text-muted-foreground text-xs mt-1">Factual metrics only — no Buy / Hold / Sell language.</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {data.map((d) => {
          const sym = String(d.symbol ?? "").replace(".NS", "");
          return (
            <div key={sym} className="flex items-center gap-2 h-8 pl-3 pr-1.5 bg-card border border-border rounded-lg">
              <Link href={`/research/${sym}`} className="font-mono text-xs text-[#F0B429] font-bold hover:underline">{sym}</Link>
              <button onClick={() => removeSymbol(sym)} className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-[#FF4D6A]">
                <X className="w-3 h-3" />
              </button>
            </div>
          );
        })}
        {initialSymbols.length < 6 && (
          <div className="flex items-center gap-1">
            <input
              value={newSymbol}
              onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && addSymbol()}
              placeholder="Add symbol"
              className="h-8 w-28 px-2 bg-card border border-border rounded-lg font-mono text-xs focus:outline-none focus:border-[#F0B429]/50"
            />
            <button onClick={addSymbol} className="h-8 w-8 flex items-center justify-center bg-[#F0B429]/10 border border-[#F0B429]/30 rounded-lg text-[#F0B429]">
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {!data.length ? (
        <div className="py-16 text-center border border-dashed border-border rounded-xl">
          <p className="text-muted-foreground font-mono text-xs">Add NSE symbols to compare (e.g. TCS, INFY, RELIANCE).</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-border bg-background/60">
                <th className="px-4 py-3 text-left text-muted-foreground/50 font-mono text-[9px] uppercase tracking-widest sticky left-0 bg-background/90">Metric</th>
                {data.map((d) => (
                  <th key={d.symbol} className="px-4 py-3 text-right font-mono text-[10px] text-[#F0B429]">
                    {String(d.symbol).replace(".NS", "")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {METRICS.map((section) => (
                <Fragment key={section.section}>
                  <tr className="bg-accent/30">
                    <td colSpan={data.length + 1} className="px-4 py-2 text-muted-foreground font-mono text-[9px] uppercase tracking-widest sticky left-0">
                      {section.section}
                    </td>
                  </tr>
                  {section.rows.map((row) => (
                    <tr key={row.label} className="border-b border-border last:border-0 hover:bg-accent/20">
                      <td className="px-4 py-2.5 text-muted-foreground font-mono text-[10px] uppercase tracking-widest sticky left-0 bg-card/80">{row.label}</td>
                      {data.map((d) => (
                        <td key={d.symbol} className="px-4 py-2.5 text-right text-foreground font-mono text-xs font-semibold">
                          {row.get(d)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
