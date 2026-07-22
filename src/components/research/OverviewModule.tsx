"use client";

import { PriceChart } from "./charts/PriceChart";

function fmtINR(v: unknown) {
  if (v == null) return "—";
  const n = Number(v);
  if (isNaN(n)) return "—";
  return `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function fmtVol(v: unknown) {
  if (v == null) return "—";
  return Number(v).toLocaleString("en-IN");
}
function fmtPct(v: unknown) {
  if (v == null) return "—";
  const n = Number(v);
  return `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
}

interface Level {
  rank: number;
  price: number;
  distancePct: number;
  strength: number;
  touches: number;
  lastTested: string | null;
  type: "support" | "resistance";
}

function StrengthBar({ value }: { value: number }) {
  const color = value >= 70 ? "#00D4AA" : value >= 45 ? "#F0B429" : "#FF8C42";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${Math.min(100, value)}%`, background: color }} />
      </div>
      <span className="font-mono text-[10px] font-bold" style={{ color }}>{value}</span>
    </div>
  );
}

function LevelCard({ level, accent }: { level: Level; accent: string }) {
  return (
    <div className="bg-background/60 backdrop-blur-sm border border-border rounded-xl p-4 hover:border-[#F0B429]/30 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: accent }}>
          {level.type === "support" ? "Support" : "Resistance"} {level.rank}
        </span>
        <span className="font-display text-lg font-bold text-foreground">{fmtINR(level.price)}</span>
      </div>
      <div className="space-y-2.5">
        <div className="flex justify-between text-[10px] font-mono">
          <span className="text-muted-foreground uppercase tracking-widest">Distance</span>
          <span className="text-foreground font-bold">{fmtPct(level.distancePct)}</span>
        </div>
        <div>
          <p className="text-muted-foreground font-mono text-[9px] uppercase tracking-widest mb-1">Strength</p>
          <StrengthBar value={level.strength} />
        </div>
        <div className="flex justify-between text-[10px] font-mono">
          <span className="text-muted-foreground uppercase tracking-widest">
            {level.type === "support" ? "Touches" : "Rejections"}
          </span>
          <span className="text-foreground font-bold">{level.touches}</span>
        </div>
        <div className="flex justify-between text-[10px] font-mono">
          <span className="text-muted-foreground uppercase tracking-widest">Last Tested</span>
          <span className="text-foreground font-bold">{level.lastTested ?? "—"}</span>
        </div>
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function OverviewModule({ data, historical }: { data: any; historical: any[] }) {
  const ov = data?.overview ?? {};
  const tech = data?.technical ?? {};
  const levels = tech.levels ?? tech.supportResistance ?? {};
  const supports: Level[] = levels.supports ?? [];
  const resistances: Level[] = levels.resistances ?? [];
  const sr = tech.supportResistance ?? {};
  const changePct = ov.priceChangePct != null ? Number(ov.priceChangePct) * 100 : null;
  const isUp = (ov.priceChange ?? 0) >= 0;

  const patterns = (tech.chartPatterns as Array<{ pattern: string; confidence: number }> | undefined) ?? [];

  return (
    <div className="space-y-6">
      {/* Price Chart */}
      <div className="bg-background/40 border border-border rounded-xl p-3 md:p-4">
        <p className="text-muted-foreground font-mono text-[10px] uppercase tracking-widest mb-3">Price History</p>
        <PriceChart
          data={historical}
          support={supports[0]?.price ?? sr.support}
          resistance={resistances[0]?.price ?? sr.resistance}
          sma20={tech?.sma?.sma20}
          sma50={tech?.sma?.sma50}
        />
      </div>

      {/* Current Price Card */}
      <div>
        <p className="text-muted-foreground font-mono text-[10px] uppercase tracking-widest mb-3">Current Price</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: "Current Price", value: fmtINR(ov.currentPrice) },
            { label: "52W High", value: fmtINR(ov.weekHigh52) },
            { label: "52W Low", value: fmtINR(ov.weekLow52) },
            { label: "Today's Change", value: changePct != null ? `${isUp ? "+" : ""}${Number(ov.priceChange ?? 0).toFixed(2)} (${fmtPct(changePct)})` : "—", color: isUp ? "#00D4AA" : "#FF4D6A" },
            { label: "Volume", value: fmtVol(ov.volume) },
            { label: "Avg Volume", value: fmtVol(ov.avgVolume) },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-card/80 backdrop-blur-sm border border-border rounded-xl p-3.5">
              <p className="text-muted-foreground font-mono text-[9px] uppercase tracking-widest mb-1.5">{label}</p>
              <p className="font-mono text-sm font-bold text-foreground truncate" style={color ? { color } : undefined}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Support Levels */}
      <div>
        <p className="text-muted-foreground font-mono text-[10px] uppercase tracking-widest mb-3">Support Levels</p>
        {supports.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {supports.map((s) => <LevelCard key={`s${s.rank}`} level={s} accent="#00D4AA" />)}
          </div>
        ) : (
          <p className="text-muted-foreground text-xs font-mono py-4 text-center border border-dashed border-border rounded-xl">Insufficient data for support levels</p>
        )}
      </div>

      {/* Resistance Levels */}
      <div>
        <p className="text-muted-foreground font-mono text-[10px] uppercase tracking-widest mb-3">Resistance Levels</p>
        {resistances.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {resistances.map((r) => <LevelCard key={`r${r.rank}`} level={r} accent="#FF4D6A" />)}
          </div>
        ) : (
          <p className="text-muted-foreground text-xs font-mono py-4 text-center border border-dashed border-border rounded-xl">Insufficient data for resistance levels</p>
        )}
      </div>

      {/* Quick signals */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {[
          { label: "Trend", value: tech.trend ?? "—", color: String(tech.trend).includes("Up") ? "#00D4AA" : String(tech.trend).includes("Down") ? "#FF4D6A" : "#FF8C42" },
          { label: "MA Cross", value: tech.crossSignal ?? "—", color: tech.crossSignal === "Golden Cross" ? "#00D4AA" : "#FF4D6A" },
          { label: "RSI", value: tech.rsi != null ? Number(tech.rsi).toFixed(1) : "—", color: "#F0B429" },
          { label: "MACD", value: tech.macdSignal ?? "—", color: tech.macdSignal === "Bullish" ? "#00D4AA" : "#FF4D6A" },
          { label: "Chart Pattern", value: patterns[0]?.pattern ?? "None", color: "#F0B429" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-background border border-border rounded-lg p-3 text-center">
            <p className="text-muted-foreground font-mono text-[9px] uppercase tracking-widest mb-1">{label}</p>
            <p className="text-xs font-bold font-mono truncate" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      {ov.description && (
        <div>
          <p className="text-muted-foreground font-mono text-[10px] uppercase tracking-widest mb-2">About</p>
          <p className="text-muted-foreground text-xs leading-relaxed line-clamp-4">{ov.description}</p>
        </div>
      )}
    </div>
  );
}
