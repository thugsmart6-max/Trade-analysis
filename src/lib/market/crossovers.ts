import type { OHLCV } from "./indicators";
import { SMA, EMA } from "technicalindicators";

export type CrossType =
  | "SMA20×SMA50"
  | "SMA50×SMA200"
  | "EMA20×EMA50"
  | "EMA50×EMA200"
  | "Golden Cross"
  | "Death Cross";

export interface CrossEvent {
  type: CrossType;
  direction: "bullish" | "bearish";
  date: string;
  index: number;
  priceAtCross: number;
}

function seriesSMA(closes: number[], period: number): (number | null)[] {
  const vals = SMA.calculate({ values: closes, period });
  const pad = Array(closes.length - vals.length).fill(null) as null[];
  return [...pad, ...vals];
}

function seriesEMA(closes: number[], period: number): (number | null)[] {
  const vals = EMA.calculate({ values: closes, period });
  const pad = Array(closes.length - vals.length).fill(null) as null[];
  return [...pad, ...vals];
}

function fmtDate(d: Date | string) {
  const dt = d instanceof Date ? d : new Date(d);
  return isNaN(dt.getTime()) ? "" : dt.toISOString().split("T")[0];
}

function detectCross(
  fast: (number | null)[],
  slow: (number | null)[],
  data: OHLCV[],
  bullishType: CrossType,
  bearishType: CrossType,
): CrossEvent[] {
  const events: CrossEvent[] = [];
  for (let i = 1; i < data.length; i++) {
    const f0 = fast[i - 1], s0 = slow[i - 1];
    const f1 = fast[i], s1 = slow[i];
    if (f0 == null || s0 == null || f1 == null || s1 == null) continue;
    if (f0 <= s0 && f1 > s1) {
      events.push({
        type: bullishType,
        direction: "bullish",
        date: fmtDate(data[i].date),
        index: i,
        priceAtCross: data[i].close,
      });
    } else if (f0 >= s0 && f1 < s1) {
      events.push({
        type: bearishType,
        direction: "bearish",
        date: fmtDate(data[i].date),
        index: i,
        priceAtCross: data[i].close,
      });
    }
  }
  return events;
}

export function detectAllCrosses(data: OHLCV[]): CrossEvent[] {
  if (data.length < 210) return [];
  const closes = data.map((d) => d.close);
  const sma20  = seriesSMA(closes, 20);
  const sma50  = seriesSMA(closes, 50);
  const sma200 = seriesSMA(closes, 200);
  const ema20  = seriesEMA(closes, 20);
  const ema50  = seriesEMA(closes, 50);
  const ema200 = seriesEMA(closes, 200);

  return [
    ...detectCross(sma20, sma50, data, "SMA20×SMA50", "SMA20×SMA50"),
    ...detectCross(sma50, sma200, data, "Golden Cross", "Death Cross"),
    ...detectCross(ema20, ema50, data, "EMA20×EMA50", "EMA20×EMA50"),
    ...detectCross(ema50, ema200, data, "EMA50×EMA200", "EMA50×EMA200"),
  ].sort((a, b) => a.index - b.index);
}

/** Latest cross of each type within lookback days */
export function recentCrosses(data: OHLCV[], lookbackDays: number): CrossEvent[] {
  const all = detectAllCrosses(data);
  if (!all.length) return [];
  const cutoff = data.length - 1 - lookbackDays;
  return all.filter((e) => e.index >= cutoff);
}

export function pctChangeSince(data: OHLCV[], fromIndex: number): number | null {
  if (fromIndex < 0 || fromIndex >= data.length - 1) return null;
  const from = data[fromIndex].close;
  const to = data[data.length - 1].close;
  if (!from) return null;
  return parseFloat((((to - from) / from) * 100).toFixed(2));
}
