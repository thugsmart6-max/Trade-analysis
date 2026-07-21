"use client";

import { BarChartSimple } from "./charts/BarChartSimple";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function PatternStatsModule({ data }: { data: any }) {
  const stats: {
    pattern: string;
    occurrences: number;
    successfulBreakouts: number;
    failedBreakouts: number;
    successPercent: number;
    avgReturn: number;
    avgDuration: number;
  }[] = data?.technical?.patternStats ?? [];

  const chartData = stats.map((s) => ({
    label: s.pattern.replace(" ", "\n"),
    value: s.successPercent,
    color: s.successPercent >= 60 ? "#00D4AA" : s.successPercent >= 40 ? "#FF8C42" : "#FF4D6A",
  }));

  return (
    <div className="space-y-6">
      <div>
        <p className="text-muted-foreground font-mono text-[10px] uppercase tracking-widest mb-1">Historical Pattern Success Rate</p>
        <p className="text-muted-foreground/60 text-[10px] font-mono mb-4">
          Based on 5-day forward returns after pattern detection. Data-only — no investment guidance.
        </p>
        {chartData.length > 0
          ? <BarChartSimple data={chartData} height={180} unit="%" />
          : <p className="text-muted-foreground text-xs font-mono py-8 text-center">Insufficient historical data to calculate pattern statistics.</p>
        }
      </div>

      {stats.length > 0 && (
        <>
          {/* Mobile: card layout */}
          <div className="flex flex-col gap-3 md:hidden">
            {stats.map((s) => {
              const c = s.successPercent >= 60 ? "#00D4AA" : s.successPercent >= 40 ? "#FF8C42" : "#FF4D6A";
              return (
                <div key={s.pattern} className="bg-background border border-border rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-foreground font-mono text-xs font-semibold">{s.pattern}</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold" style={{ color: c, background: `${c}18` }}>
                      {s.successPercent}%
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    {[
                      { label: "Total", value: s.occurrences, color: "text-foreground" },
                      { label: "Success", value: s.successfulBreakouts, color: "text-[#00D4AA]" },
                      { label: "Failed", value: s.failedBreakouts, color: "text-[#FF4D6A]" },
                      { label: "Avg Return", value: `${s.avgReturn >= 0 ? "+" : ""}${s.avgReturn}%`, color: s.avgReturn >= 0 ? "text-[#00D4AA]" : "text-[#FF4D6A]" },
                    ].map(({ label, value, color }) => (
                      <div key={label}>
                        <p className="text-muted-foreground/50 font-mono text-[9px] uppercase">{label}</p>
                        <p className={`font-mono text-xs font-bold mt-0.5 ${color}`}>{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop: table */}
          <div className="hidden md:block bg-background border border-border rounded-xl overflow-hidden">
            <div className="grid grid-cols-6 px-4 py-2.5 border-b border-border">
              {["Pattern", "Occurrences", "Success", "Failed", "Success %", "Avg Return"].map((h) => (
                <span key={h} className="text-muted-foreground/50 font-mono text-[9px] uppercase tracking-widest">{h}</span>
              ))}
            </div>
            {stats.map((s) => (
              <div key={s.pattern} className="grid grid-cols-6 px-4 py-3 border-b border-border last:border-0 items-center">
                <span className="text-foreground font-mono text-[10px] font-semibold">{s.pattern}</span>
                <span className="text-muted-foreground font-mono text-xs">{s.occurrences}</span>
                <span className="text-[#00D4AA] font-mono text-xs">{s.successfulBreakouts}</span>
                <span className="text-[#FF4D6A] font-mono text-xs">{s.failedBreakouts}</span>
                <div>
                  <span
                    className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold"
                    style={{
                      color:      s.successPercent >= 60 ? "#00D4AA" : s.successPercent >= 40 ? "#FF8C42" : "#FF4D6A",
                      background: s.successPercent >= 60 ? "rgba(0,212,170,0.1)" : s.successPercent >= 40 ? "rgba(255,140,66,0.1)" : "rgba(255,77,106,0.1)",
                    }}
                  >
                    {s.successPercent}%
                  </span>
                </div>
                <span className={`font-mono text-xs font-bold ${s.avgReturn >= 0 ? "text-[#00D4AA]" : "text-[#FF4D6A]"}`}>
                  {s.avgReturn >= 0 ? "+" : ""}{s.avgReturn}%
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      <p className="text-muted-foreground/50 font-mono text-[9px] text-center">
        Past pattern performance does not guarantee future results. Statistical analysis only.
      </p>
    </div>
  );
}
