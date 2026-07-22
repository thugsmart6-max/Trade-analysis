"use client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function PatternStatsModule({ data }: { data: any }) {
  const patterns: Array<{
    pattern: string;
    confidence?: number;
    breakoutDirection?: string;
    detectionDate?: string;
    historicalSuccessRate?: number | null;
    successPercent?: number;
  }> = data?.technical?.chartPatterns
    ?? data?.technical?.patternStats
    ?? [];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-muted-foreground font-mono text-[10px] uppercase tracking-widest mb-1">Chart Pattern Detection</p>
        <p className="text-muted-foreground/60 text-[10px] font-mono mb-4">
          Structural chart patterns only — candlestick patterns removed. Factual detection, no recommendations.
        </p>
      </div>

      {!patterns.length ? (
        <p className="text-muted-foreground text-xs font-mono py-12 text-center border border-dashed border-border rounded-xl">
          No chart patterns detected in the current window.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {patterns.map((p) => {
            const conf = p.confidence ?? p.successPercent ?? 0;
            const success = p.historicalSuccessRate ?? p.successPercent ?? null;
            const dir = p.breakoutDirection ?? "Neutral";
            const dirColor = dir === "Up" ? "#00D4AA" : dir === "Down" ? "#FF4D6A" : "#FF8C42";
            return (
              <div key={p.pattern} className="bg-card/80 backdrop-blur-sm border border-border rounded-xl p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h4 className="font-display text-sm font-bold text-foreground">{p.pattern}</h4>
                    <p className="text-muted-foreground font-mono text-[10px] mt-0.5">
                      Detected {p.detectionDate ?? "—"}
                    </p>
                  </div>
                  <span
                    className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase"
                    style={{ color: dirColor, background: `${dirColor}18` }}
                  >
                    {dir}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-muted-foreground/50 font-mono text-[9px] uppercase mb-1">Confidence</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-[#F0B429]" style={{ width: `${conf}%` }} />
                      </div>
                      <span className="font-mono text-xs font-bold text-[#F0B429]">{conf}%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-muted-foreground/50 font-mono text-[9px] uppercase mb-1">Hist. Success</p>
                    <p className="font-mono text-sm font-bold text-foreground">
                      {success != null ? `${success}%` : "—"}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-muted-foreground/50 font-mono text-[9px] text-center">
        Past pattern statistics do not guarantee future results. Data display only.
      </p>
    </div>
  );
}
