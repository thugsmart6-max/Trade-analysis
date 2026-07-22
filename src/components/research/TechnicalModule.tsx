"use client";

import { PriceChart }    from "./charts/PriceChart";
import { BarChartSimple } from "./charts/BarChartSimple";

function Row({ label, value, badge, badgeColor }: { label: string; value: string; badge?: string; badgeColor?: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <span className="text-muted-foreground font-mono text-[10px] uppercase tracking-widest">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-foreground font-mono text-xs font-bold">{value}</span>
        {badge && (
          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase" style={{ color: badgeColor, background: `${badgeColor}18` }}>
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-background border border-border rounded-xl overflow-hidden">
      <div className="px-4 py-2.5 border-b border-border">
        <h3 className="text-foreground font-mono text-[10px] uppercase tracking-widest font-semibold">{title}</h3>
      </div>
      <div className="px-4 py-1">{children}</div>
    </div>
  );
}

function n(v: unknown, d = 2) { return v != null ? Number(v).toFixed(d) : "—"; }
function inr(v: unknown) { return v != null ? `₹${Number(v).toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "—"; }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function TechnicalModule({ data, historical }: { data: any; historical: any[] }) {
  const tech = data?.technical ?? {};
  const sma  = tech.sma  ?? {};
  const ema  = tech.ema  ?? {};
  const macd = tech.macd ?? {};
  const bb   = tech.bollingerBands ?? {};
  const adx  = tech.adx  ?? {};
  const fib  = tech.fibonacci ?? {};
  const sr   = tech.supportResistance ?? {};

  const rsiColor = tech.rsi != null
    ? tech.rsi > 70 ? "#FF4D6A" : tech.rsi < 30 ? "#00D4AA" : "#FF8C42"
    : "#8A8076";

  const trendColor = tech.trend === "Uptrend" ? "#00D4AA" : tech.trend === "Downtrend" ? "#FF4D6A" : "#FF8C42";

  const fibData = fib ? [
    { label: "0%",   value: fib.level_0   ?? 0, color: "#F0B429" },
    { label: "23.6%",value: fib.level_236 ?? 0, color: "#00D4AA" },
    { label: "38.2%",value: fib.level_382 ?? 0, color: "#00D4AA" },
    { label: "50%",  value: fib.level_5   ?? 0, color: "#FF8C42" },
    { label: "61.8%",value: fib.level_618 ?? 0, color: "#FF4D6A" },
    { label: "100%", value: fib.level_1   ?? 0, color: "#FF4D6A" },
  ] : [];

  return (
    <div className="space-y-4">
      {/* Chart */}
      <Section title="Price Chart — 5 Years">
        <div className="py-2">
          <PriceChart data={historical} support={sr.support} resistance={sr.resistance} sma20={sma.sma20} sma50={sma.sma50} />
        </div>
      </Section>

      {/* Trend + S/R */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Section title="Trend & Crossover">
          <Row label="Trend"         value={tech.trend ?? "—"}       badge={tech.trend}       badgeColor={trendColor} />
          <Row label="MA Crossover"  value={tech.crossSignal ?? "—"} badge={tech.crossSignal === "Golden Cross" ? "Golden" : "Death"} badgeColor={tech.crossSignal === "Golden Cross" ? "#00D4AA" : "#FF4D6A"} />
          <Row label="Chart Patterns" value={((tech.chartPatterns ?? []) as Array<{ pattern: string }>).map((p) => p.pattern).join(", ") || "None"} />
          <Row label="Support"       value={inr(sr.supports?.[0]?.price ?? sr.support)} />
          <Row label="Resistance"    value={inr(sr.resistances?.[0]?.price ?? sr.resistance)} />
          <Row label="VWAP"          value={inr(tech.vwap)} />
        </Section>

        <Section title="RSI & Momentum">
          <Row label="RSI (14)"      value={n(tech.rsi)} badge={tech.rsiSignal} badgeColor={rsiColor} />
          <Row label="Stochastic %K" value={tech.stochastic ? n(tech.stochastic.k) : "—"} />
          <Row label="Stochastic %D" value={tech.stochastic ? n(tech.stochastic.d) : "—"} />
          <Row label="CCI (20)"      value={n(tech.cci)} />
          <Row label="OBV"           value={tech.obv != null ? Number(tech.obv).toLocaleString("en-IN") : "—"} />
        </Section>
      </div>

      {/* Moving Averages */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Section title="Simple Moving Averages">
          <Row label="SMA 20"  value={inr(sma.sma20)} />
          <Row label="SMA 50"  value={inr(sma.sma50)} />
          <Row label="SMA 100" value={inr(sma.sma100)} />
          <Row label="SMA 200" value={inr(sma.sma200)} />
        </Section>
        <Section title="Exponential Moving Averages">
          <Row label="EMA 9"   value={inr(ema.ema9)} />
          <Row label="EMA 21"  value={inr(ema.ema21)} />
          <Row label="EMA 50"  value={inr(ema.ema50)} />
          <Row label="EMA 200" value={inr(ema.ema200)} />
        </Section>
      </div>

      {/* MACD + Bollinger */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Section title="MACD (12,26,9)">
          <Row label="MACD Line"   value={n(macd.MACD)}      />
          <Row label="Signal Line" value={n(macd.signal)}    />
          <Row label="Histogram"   value={n(macd.histogram)} badge={tech.macdSignal} badgeColor={tech.macdSignal === "Bullish" ? "#00D4AA" : "#FF4D6A"} />
        </Section>
        <Section title="Bollinger Bands (20,2)">
          <Row label="Upper Band"  value={inr(bb.upper)} />
          <Row label="Middle Band" value={inr(bb.middle)} />
          <Row label="Lower Band"  value={inr(bb.lower)} />
          <Row label="BB Signal"   value={tech.bbSignal ?? "—"} />
        </Section>
      </div>

      {/* ADX + ATR */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Section title="ADX — Trend Strength">
          <Row label="ADX"  value={n(adx.adx)} badge={adx.adx > 25 ? "Strong" : "Weak"} badgeColor={adx.adx > 25 ? "#00D4AA" : "#FF8C42"} />
          <Row label="+DI"  value={n(adx.pdi)} />
          <Row label="-DI"  value={n(adx.mdi)} />
        </Section>
        <Section title="ATR — Volatility">
          <Row label="ATR (14)"  value={inr(tech.atr)} />
          <Row label="VWAP"      value={inr(tech.vwap)} />
        </Section>
      </div>

      {/* Fibonacci */}
      {fibData.length > 0 && (
        <Section title="Fibonacci Retracement Levels">
          <div className="py-3">
            <BarChartSimple data={fibData.map((f) => ({ label: f.label, value: f.value, color: f.color }))} height={140} unit="" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
            {fibData.map((f) => (
              <div key={f.label} className="flex justify-between text-[10px] font-mono">
                <span className="text-muted-foreground">{f.label}</span>
                <span className="text-foreground font-bold">₹{Number(f.value).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}
