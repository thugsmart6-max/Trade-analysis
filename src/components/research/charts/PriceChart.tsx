"use client";

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";

interface PricePoint { date: string; close: number; volume: number }

interface Props {
  data: PricePoint[];
  color?: string;
  support?: number | null;
  resistance?: number | null;
  sma20?: number | null;
  sma50?: number | null;
}

export function PriceChart({ data, color = "#F0B429", support, resistance, sma20, sma50 }: Props) {
  if (!data.length) return <div className="h-48 flex items-center justify-center text-muted-foreground text-xs font-mono">No price data</div>;

  const prices = data.map((d) => d.close);
  const min = Math.min(...prices) * 0.98;
  const max = Math.max(...prices) * 1.02;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={color} stopOpacity={0.15} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        <XAxis
          dataKey="date"
          tick={{ fill: "#6b6560", fontSize: 9, fontFamily: "monospace" }}
          tickLine={false} axisLine={false}
          tickFormatter={(v) => v.slice(2, 7)}
          interval="preserveStartEnd"
        />
        <YAxis
          domain={[min, max]}
          tick={{ fill: "#6b6560", fontSize: 9, fontFamily: "monospace" }}
          tickLine={false} axisLine={false}
          tickFormatter={(v) => `₹${v.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
          width={58}
        />
        <Tooltip
          contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 11, fontFamily: "monospace" }}
          labelStyle={{ color: "var(--muted-foreground)" }}
          itemStyle={{ color }}
          formatter={(v) => [`₹${Number(v ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, "Close"]}
        />
        {support    && <ReferenceLine y={support}    stroke="#00D4AA" strokeDasharray="4 2" label={{ value: "S", fill: "#00D4AA", fontSize: 9 }} />}
        {resistance && <ReferenceLine y={resistance} stroke="#FF4D6A" strokeDasharray="4 2" label={{ value: "R", fill: "#FF4D6A", fontSize: 9 }} />}
        {sma20      && <ReferenceLine y={sma20}      stroke="#F0B429" strokeDasharray="2 2" />}
        {sma50      && <ReferenceLine y={sma50}      stroke="#FF8C42" strokeDasharray="2 2" />}
        <Area type="monotone" dataKey="close" stroke={color} strokeWidth={1.5} fill="url(#priceGrad)" dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
