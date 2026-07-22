"use client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function FrequencyModule({ data }: { data: any }) {
  const stats: Array<{
    event: string;
    totalOccurrences: number;
    last1Year: number;
    last5Years: number;
    avgMovePct: number;
    medianMovePct: number;
    maxGainPct: number;
    maxLossPct: number;
    avgHoldingDays: number;
    successFrequencyPct: number;
  }> = data?.technical?.frequencyStats ?? [];

  if (!stats.length) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground font-mono text-xs">
          Insufficient history for frequency analysis. Refresh after data loads.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-muted-foreground font-mono text-[10px] uppercase tracking-widest mb-1">Frequency Analysis</p>
        <p className="text-muted-foreground/60 text-[10px] font-mono mb-4">
          Historical occurrence counts and forward-return statistics for technical events. No recommendations.
        </p>
      </div>

      {/* Mobile cards */}
      <div className="flex flex-col gap-3 md:hidden">
        {stats.map((s) => (
          <div key={s.event} className="bg-card border border-border rounded-xl p-4">
            <p className="text-foreground font-mono text-xs font-semibold mb-3">{s.event}</p>
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
              <div><span className="text-muted-foreground">Total</span><p className="font-bold text-foreground">{s.totalOccurrences}</p></div>
              <div><span className="text-muted-foreground">1Y / 5Y</span><p className="font-bold text-foreground">{s.last1Year} / {s.last5Years}</p></div>
              <div><span className="text-muted-foreground">Avg Move</span><p className="font-bold" style={{ color: s.avgMovePct >= 0 ? "#00D4AA" : "#FF4D6A" }}>{s.avgMovePct}%</p></div>
              <div><span className="text-muted-foreground">Success</span><p className="font-bold text-[#F0B429]">{s.successFrequencyPct}%</p></div>
              <div><span className="text-muted-foreground">Max Gain</span><p className="font-bold text-[#00D4AA]">+{s.maxGainPct}%</p></div>
              <div><span className="text-muted-foreground">Max Loss</span><p className="font-bold text-[#FF4D6A]">{s.maxLossPct}%</p></div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[900px] text-left">
          <thead>
            <tr className="border-b border-border bg-background/60">
              {["Event", "Total", "1Y", "5Y", "Avg Move", "Median", "Max Gain", "Max Loss", "Hold Days", "Success %"].map((h) => (
                <th key={h} className="px-3 py-2.5 text-muted-foreground/60 font-mono text-[9px] uppercase tracking-widest font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {stats.map((s) => (
              <tr key={s.event} className="border-b border-border last:border-0 hover:bg-accent/40">
                <td className="px-3 py-2.5 text-foreground font-mono text-[11px] font-semibold">{s.event}</td>
                <td className="px-3 py-2.5 text-muted-foreground font-mono text-xs">{s.totalOccurrences}</td>
                <td className="px-3 py-2.5 text-muted-foreground font-mono text-xs">{s.last1Year}</td>
                <td className="px-3 py-2.5 text-muted-foreground font-mono text-xs">{s.last5Years}</td>
                <td className="px-3 py-2.5 font-mono text-xs font-bold" style={{ color: s.avgMovePct >= 0 ? "#00D4AA" : "#FF4D6A" }}>{s.avgMovePct}%</td>
                <td className="px-3 py-2.5 text-foreground font-mono text-xs">{s.medianMovePct}%</td>
                <td className="px-3 py-2.5 text-[#00D4AA] font-mono text-xs">+{s.maxGainPct}%</td>
                <td className="px-3 py-2.5 text-[#FF4D6A] font-mono text-xs">{s.maxLossPct}%</td>
                <td className="px-3 py-2.5 text-muted-foreground font-mono text-xs">{s.avgHoldingDays}</td>
                <td className="px-3 py-2.5">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold text-[#F0B429] bg-[#F0B429]/10">
                    {s.successFrequencyPct}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
