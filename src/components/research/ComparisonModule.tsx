"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";

function n(v: unknown, d = 2) { return v != null ? Number(v).toFixed(d) : "—"; }
function pct(v: unknown) { return v != null ? `${(Number(v) * 100).toFixed(2)}%` : "—"; }
function inr(v: unknown) {
  if (v == null) return "—";
  const num = Number(v);
  if (Math.abs(num) >= 1e7) return `₹${(num / 1e7).toFixed(2)}Cr`;
  return `₹${num.toFixed(2)}`;
}

const METRICS = [
  { section: "Price", rows: [
    { label: "Current Price",  get: (d: Record<string, unknown>) => inr((d.overview as Record<string,unknown>)?.currentPrice) },
    { label: "52W High",       get: (d: Record<string, unknown>) => inr((d.overview as Record<string,unknown>)?.weekHigh52) },
    { label: "52W Low",        get: (d: Record<string, unknown>) => inr((d.overview as Record<string,unknown>)?.weekLow52) },
    { label: "Market Cap",     get: (d: Record<string, unknown>) => inr((d.overview as Record<string,unknown>)?.marketCap) },
    { label: "Beta",           get: (d: Record<string, unknown>) => n((d.overview as Record<string,unknown>)?.beta) },
  ]},
  { section: "Valuation", rows: [
    { label: "PE Ratio",   get: (d: Record<string, unknown>) => n((d.fundamental as Record<string,unknown>)?.peRatio) },
    { label: "PB Ratio",   get: (d: Record<string, unknown>) => n((d.fundamental as Record<string,unknown>)?.pbRatio) },
    { label: "PEG Ratio",  get: (d: Record<string, unknown>) => n((d.fundamental as Record<string,unknown>)?.pegRatio) },
    { label: "EV/EBITDA",  get: (d: Record<string, unknown>) => n((d.fundamental as Record<string,unknown>)?.evEbitda) },
    { label: "EPS (TTM)",  get: (d: Record<string, unknown>) => inr((d.fundamental as Record<string,unknown>)?.eps) },
  ]},
  { section: "Profitability", rows: [
    { label: "Gross Margin",     get: (d: Record<string, unknown>) => pct((d.fundamental as Record<string,unknown>)?.grossMargin) },
    { label: "Operating Margin", get: (d: Record<string, unknown>) => pct((d.fundamental as Record<string,unknown>)?.operatingMargin) },
    { label: "Net Margin",       get: (d: Record<string, unknown>) => pct((d.fundamental as Record<string,unknown>)?.netMargin) },
    { label: "ROE",              get: (d: Record<string, unknown>) => pct((d.fundamental as Record<string,unknown>)?.roe) },
    { label: "ROCE",             get: (d: Record<string, unknown>) => pct((d.fundamental as Record<string,unknown>)?.roce) },
  ]},
  { section: "Solvency", rows: [
    { label: "Debt/Equity",   get: (d: Record<string, unknown>) => n((d.fundamental as Record<string,unknown>)?.debtToEquity) },
    { label: "Current Ratio", get: (d: Record<string, unknown>) => n((d.fundamental as Record<string,unknown>)?.currentRatio) },
    { label: "Quick Ratio",   get: (d: Record<string, unknown>) => n((d.fundamental as Record<string,unknown>)?.quickRatio) },
    { label: "Free Cash Flow",get: (d: Record<string, unknown>) => inr((d.fundamental as Record<string,unknown>)?.freeCashFlow) },
  ]},
  { section: "Technical", rows: [
    { label: "Trend",        get: (d: Record<string, unknown>) => (d.technical as Record<string,unknown>)?.trend as string ?? "—" },
    { label: "RSI (14)",     get: (d: Record<string, unknown>) => n((d.technical as Record<string,unknown>)?.rsi) },
    { label: "RSI Signal",   get: (d: Record<string, unknown>) => (d.technical as Record<string,unknown>)?.rsiSignal as string ?? "—" },
    { label: "MACD Signal",  get: (d: Record<string, unknown>) => (d.technical as Record<string,unknown>)?.macdSignal as string ?? "—" },
    { label: "MA Cross",     get: (d: Record<string, unknown>) => (d.technical as Record<string,unknown>)?.crossSignal as string ?? "—" },
  ]},
  { section: "Dividends", rows: [
    { label: "Dividend Yield",  get: (d: Record<string, unknown>) => pct((d.fundamental as Record<string,unknown>)?.dividendYield) },
    { label: "Payout Ratio",    get: (d: Record<string, unknown>) => pct((d.fundamental as Record<string,unknown>)?.dividendPayout) },
  ]},
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ComparisonModule({ data, initialSymbols }: { data: any[]; initialSymbols: string[] }) {
  const router = useRouter();
  const [newSymbol, setNewSymbol] = useState("");

  function addSymbol() {
    const s = newSymbol.trim().toUpperCase();
    if (!s) return;
    const updated = [...initialSymbols.filter(Boolean), s].slice(0, 4);
    router.push(`/research/compare?symbols=${updated.join(",")}`);
    setNewSymbol("");
  }

  function removeSymbol(sym: string) {
    const updated = initialSymbols.filter((s) => s !== sym && s !== `${sym}.NS`);
    router.push(`/research/compare?symbols=${updated.join(",")}`);
  }

  const cols = data.length;

  return (
    <div className="space-y-5">
      <div>
        <span className="text-muted-foreground font-mono text-[10px] uppercase tracking-widest block mb-1">Comparison</span>
        <h1 className="font-display text-foreground text-2xl font-bold">Stock Comparison</h1>
        <p className="text-muted-foreground text-xs mt-1">Compare up to 4 stocks side-by-side across all financial and technical metrics.</p>
      </div>

      {/* Add symbol */}
      <div className="flex gap-2 flex-wrap">
        {initialSymbols.map((s) => (
          <div key={s} className="flex items-center gap-1.5 px-3 py-1.5 bg-card border border-border rounded-lg">
            <span className="font-mono text-xs text-foreground font-bold">{s}</span>
            <button onClick={() => removeSymbol(s)} className="text-muted-foreground hover:text-[#FF4D6A] transition-colors">
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        {initialSymbols.length < 4 && (
          <div className="flex gap-2">
            <input
              value={newSymbol}
              onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && addSymbol()}
              placeholder="Add symbol..."
              className="h-8 px-3 bg-card border border-border rounded-lg font-mono text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#F0B429]/50"
            />
            <button onClick={addSymbol} className="h-8 px-3 bg-[#F0B429] text-[#080808] rounded-lg font-mono text-xs font-bold hover:bg-[#d4a025] transition-colors flex items-center gap-1">
              <Plus className="w-3 h-3" /> Add
            </button>
          </div>
        )}
      </div>

      {cols === 0 ? (
        <div className="py-16 text-center">
          <p className="text-muted-foreground font-mono text-xs">Add stock symbols above to compare.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-muted-foreground font-mono text-[10px] uppercase tracking-widest w-36">Metric</th>
                {data.map((d) => (
                  <th key={d.symbol} className="py-3 px-4 text-center">
                    <a href={`/research/${d.symbol.replace(".NS","").replace(".BO","")}`} className="hover:text-[#F0B429] transition-colors">
                      <p className="text-foreground font-mono text-xs font-bold">{d.symbol}</p>
                      <p className="text-muted-foreground font-mono text-[9px] truncate max-w-24 mx-auto">{(d.overview as Record<string,unknown>)?.name as string ?? ""}</p>
                    </a>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {METRICS.map(({ section, rows }) => (
                <>
                  <tr key={`sec-${section}`} className="border-b border-border bg-accent/30">
                    <td colSpan={cols + 1} className="px-4 py-2">
                      <span className="text-[#F0B429] font-mono text-[9px] uppercase tracking-widest font-bold">{section}</span>
                    </td>
                  </tr>
                  {rows.map(({ label, get }) => (
                    <tr key={label} className="border-b border-border hover:bg-accent/20 transition-colors">
                      <td className="px-4 py-2.5 text-muted-foreground font-mono text-[10px] uppercase tracking-widest">{label}</td>
                      {data.map((d) => (
                        <td key={d.symbol} className="px-4 py-2.5 text-center text-foreground font-mono text-xs font-medium">
                          {get(d as unknown as Record<string, unknown>)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
