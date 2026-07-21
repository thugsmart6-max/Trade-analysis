"use client";

import { LineChart, Line, ResponsiveContainer, Tooltip } from "recharts";

interface Props {
  data: number[];
  color?: string;
  height?: number;
}

export function MiniSparkline({ data, color = "#F0B429", height = 40 }: Props) {
  if (!data.length) return null;
  const chartData = data.map((v, i) => ({ i, v }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData}>
        <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} dot={false} />
        <Tooltip
          contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 6, fontSize: 10, fontFamily: "monospace" }}
          formatter={(v) => [Number(v ?? 0).toFixed(2)]}
          labelFormatter={() => ""}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
