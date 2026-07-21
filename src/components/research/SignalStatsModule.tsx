"use client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function SignalStatsModule({ data }: { data: any }) {
  const stats = data?.technical?.signalStats;

  if (!stats) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground font-mono text-xs">Insufficient historical data to compute signal statistics.</p>
      </div>
    );
  }

  const rows = [
    {
      signal: "RSI Oversold (<30)",
      occurrences: stats.rsiOversold?.occurrences ?? 0,
      successRate: stats.rsiOversold?.successRate ?? 0,
      avgMove:     stats.rsiOversold?.avgMovePercent ?? 0,
      desc:        "5-day forward return after RSI drops below 30",
    },
    {
      signal: "RSI Overbought (>70)",
      occurrences: stats.rsiOverbought?.occurrences ?? 0,
      successRate: stats.rsiOverbought?.successRate ?? 0,
      avgMove:     stats.rsiOverbought?.avgMovePercent ?? 0,
      desc:        "5-day forward return after RSI rises above 70",
    },
    {
      signal: "MACD Bullish Crossover",
      occurrences: stats.macdBullish?.occurrences ?? 0,
      successRate: stats.macdBullish?.successRate ?? 0,
      avgMove:     stats.macdBullish?.avgMovePercent ?? 0,
      desc:        "5-day return after MACD line crosses above signal",
    },
    {
      signal: "Bollinger Breakout",
      occurrences: stats.bollingerBreakout?.occurrences ?? 0,
      successRate: null,
      avgMove:     stats.bollingerBreakout?.avgMovePercent ?? 0,
      desc:        "3-day return after price exits Bollinger Bands",
    },
    {
      signal: "Volume Spike (2×Avg)",
      occurrences: stats.volumeSpike?.occurrences ?? 0,
      successRate: null,
      avgMove:     stats.volumeSpike?.avgMovePercent ?? 0,
      desc:        "3-day return after volume exceeds 2× average",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-muted-foreground font-mono text-[10px] uppercase tracking-widest mb-1">Signal Historical Statistics</p>
        <p className="text-muted-foreground/60 text-[10px] font-mono mb-4">
          Calculated from 5 years of price history. Success = correct directional move. Statistical analysis only.
        </p>
      </div>

      <div className="space-y-3">
        {rows.map((r) => (
          <div key={r.signal} className="bg-background border border-border rounded-xl p-4">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
              <div>
                <p className="text-foreground font-mono text-xs font-semibold">{r.signal}</p>
                <p className="text-muted-foreground text-[10px] mt-0.5">{r.desc}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-center">
                  <p className="text-muted-foreground/50 font-mono text-[9px] uppercase">Occurrences</p>
                  <p className="text-foreground font-mono text-sm font-bold">{r.occurrences}</p>
                </div>
                {r.successRate != null && (
                  <div className="text-center">
                    <p className="text-muted-foreground/50 font-mono text-[9px] uppercase">Success Rate</p>
                    <p className="font-mono text-sm font-bold" style={{ color: r.successRate >= 55 ? "#00D4AA" : r.successRate >= 45 ? "#FF8C42" : "#FF4D6A" }}>
                      {r.successRate}%
                    </p>
                  </div>
                )}
                <div className="text-center">
                  <p className="text-muted-foreground/50 font-mono text-[9px] uppercase">Avg Move</p>
                  <p className="font-mono text-sm font-bold" style={{ color: r.avgMove >= 0 ? "#00D4AA" : "#FF4D6A" }}>
                    {r.avgMove >= 0 ? "+" : ""}{r.avgMove}%
                  </p>
                </div>
              </div>
            </div>

            {/* Visual success bar */}
            {r.successRate != null && (
              <div className="h-1.5 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${r.successRate}%`,
                    background: r.successRate >= 55 ? "#00D4AA" : r.successRate >= 45 ? "#FF8C42" : "#FF4D6A",
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <p className="text-muted-foreground/50 font-mono text-[9px] text-center">
        Historical signal performance does not predict future results. For informational purposes only.
      </p>
    </div>
  );
}
