"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface Props {
  data: { label: string; value: number; color?: string }[];
  height?: number;
  unit?: string;
}

export function BarChartSimple({ data, height = 160, unit = "%" }: Props) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
        <XAxis dataKey="label" tick={{ fill: "#6b6560", fontSize: 9, fontFamily: "monospace" }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fill: "#6b6560", fontSize: 9, fontFamily: "monospace" }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}${unit}`} width={36} />
        <Tooltip
          contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 11, fontFamily: "monospace" }}
          formatter={(v) => [`${Number(v ?? 0).toFixed(2)}${unit}`]}
        />
        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.color ?? "#F0B429"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
