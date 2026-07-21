"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

function pctChange(data: { close: number }[], daysAgo: number) {
  if (data.length < daysAgo + 1) return null;
  const old = data[data.length - 1 - daysAgo].close;
  const curr = data[data.length - 1].close;
  return ((curr - old) / old) * 100;
}

function PctBadge({ value }: { value: number | null }) {
  if (value == null) return <span className="text-muted-foreground font-mono text-xs">—</span>;
  const color = value >= 0 ? "#00D4AA" : "#FF4D6A";
  return <span className="font-mono text-xs font-bold" style={{ color }}>{value >= 0 ? "+" : ""}{value.toFixed(2)}%</span>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function HistoricalModule({ data, historical }: { data: any; historical: any[] }) {
  const ov = data?.overview ?? {};

  // Performance table
  const perfRows = [
    { label: "1 Week",   days: 5 },
    { label: "1 Month",  days: 21 },
    { label: "3 Months", days: 63 },
    { label: "6 Months", days: 126 },
    { label: "1 Year",   days: 252 },
    { label: "3 Years",  days: 756 },
    { label: "5 Years",  days: 1260 },
  ];

  // Price volatility by year
  const yearlyData: Record<string, { year: string; high: number; low: number; close: number }> = {};
  for (const d of historical) {
    const yr = d.date.slice(0, 4);
    if (!yearlyData[yr]) yearlyData[yr] = { year: yr, high: d.close, low: d.close, close: d.close };
    else {
      yearlyData[yr].high  = Math.max(yearlyData[yr].high,  d.close);
      yearlyData[yr].low   = Math.min(yearlyData[yr].low,   d.close);
      yearlyData[yr].close = d.close;
    }
  }
  const yearly = Object.values(yearlyData).sort((a, b) => a.year.localeCompare(b.year));

  // Monthly data for area chart (last 2 years)
  const monthly: Record<string, { month: string; close: number; volume: number }> = {};
  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - 2);
  for (const d of historical) {
    if (new Date(d.date) < cutoff) continue;
    const m = d.date.slice(0, 7);
    monthly[m] = { month: m, close: d.close, volume: d.volume };
  }
  const monthlyArr = Object.values(monthly).sort((a, b) => a.month.localeCompare(b.month));

  return (
    <div className="space-y-6">
      {/* Price history chart */}
      <div>
        <p className="text-muted-foreground font-mono text-[10px] uppercase tracking-widest mb-3">Monthly Close Price — Last 2 Years</p>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={monthlyArr}>
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#F0B429" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#F0B429" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="month" tick={{ fill: "#6b6560", fontSize: 9, fontFamily: "monospace" }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: "#6b6560", fontSize: 9, fontFamily: "monospace" }} tickLine={false} axisLine={false} width={58}
              tickFormatter={(v) => `₹${v.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`} />
            <Tooltip
              contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 11, fontFamily: "monospace" }}
              formatter={(v) => [`₹${Number(v ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, "Close"]}
            />
            <Area type="monotone" dataKey="close" stroke="#F0B429" strokeWidth={1.5} fill="url(#areaGrad)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Performance table */}
      <div>
        <p className="text-muted-foreground font-mono text-[10px] uppercase tracking-widest mb-3">Price Performance</p>
        <div className="overflow-x-auto rounded-xl border border-border">
          <div className="min-w-[280px] bg-background">
            <div className="grid grid-cols-3 px-4 py-2 border-b border-border">
              <span className="text-muted-foreground/50 font-mono text-[9px] uppercase tracking-widest">Period</span>
              <span className="text-muted-foreground/50 font-mono text-[9px] uppercase tracking-widest text-right">Change</span>
              <span className="text-muted-foreground/50 font-mono text-[9px] uppercase tracking-widest text-right">Price Then</span>
            </div>
            {perfRows.map(({ label, days }) => {
              const pct = pctChange(historical, days);
              const old = historical.length > days ? historical[historical.length - 1 - days]?.close : null;
              return (
                <div key={label} className="grid grid-cols-3 px-4 py-2.5 border-b border-border last:border-0">
                  <span className="text-foreground font-mono text-xs">{label}</span>
                  <span className="text-right"><PctBadge value={pct} /></span>
                  <span className="text-right text-muted-foreground font-mono text-xs">{old ? `₹${old.toFixed(2)}` : "—"}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Yearly high/low table */}
      {yearly.length > 0 && (
        <div>
          <p className="text-muted-foreground font-mono text-[10px] uppercase tracking-widest mb-3">Yearly Price Range</p>
          <div className="overflow-x-auto rounded-xl border border-border">
            <div className="min-w-[320px] bg-background">
              <div className="grid grid-cols-4 px-4 py-2 border-b border-border">
                {["Year", "High", "Low", "Year Close"].map((h) => (
                  <span key={h} className="text-muted-foreground/50 font-mono text-[9px] uppercase tracking-widest">{h}</span>
                ))}
              </div>
              {yearly.slice(-6).reverse().map(({ year, high, low, close }) => (
                <div key={year} className="grid grid-cols-4 px-4 py-2.5 border-b border-border last:border-0">
                  <span className="text-foreground font-mono text-xs font-bold">{year}</span>
                  <span className="text-[#00D4AA] font-mono text-xs">₹{high.toFixed(2)}</span>
                  <span className="text-[#FF4D6A] font-mono text-xs">₹{low.toFixed(2)}</span>
                  <span className="text-foreground font-mono text-xs">₹{close.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Yearly high/low range chart */}
      {yearly.length > 0 && (
        <div>
          <p className="text-muted-foreground font-mono text-[10px] uppercase tracking-widest mb-3">Yearly High vs Low</p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={yearly}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="year" tick={{ fill: "#6b6560", fontSize: 9, fontFamily: "monospace" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: "#6b6560", fontSize: 9, fontFamily: "monospace" }} tickLine={false} axisLine={false} width={58}
                tickFormatter={(v) => `₹${v.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 11, fontFamily: "monospace" }}
                formatter={(v, name) => [`₹${Number(v ?? 0).toFixed(2)}`, name === "high" ? "High" : name === "low" ? "Low" : "Close"]} />
              <Legend wrapperStyle={{ fontSize: 9, fontFamily: "monospace" }} />
              <Area type="monotone" dataKey="high"  stroke="#00D4AA" fill="rgba(0,212,170,0.08)" strokeWidth={1.5} dot={false} />
              <Area type="monotone" dataKey="close" stroke="#F0B429" fill="rgba(240,180,41,0.08)" strokeWidth={1.5} dot={false} />
              <Area type="monotone" dataKey="low"   stroke="#FF4D6A" fill="rgba(255,77,106,0.08)" strokeWidth={1.5} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
