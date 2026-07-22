import type { OHLCV } from "./indicators";
import { calcRSI, calcMACD } from "./indicators";
import { detectAllCrosses } from "./crossovers";
import { detectChartPatterns } from "./patterns";
import { calcMultiLevelSR } from "./levels";

export interface FrequencyStats {
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
}

function median(arr: number[]): number {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

function summarize(
  event: string,
  indices: number[],
  data: OHLCV[],
  holdDays: number,
  successFn: (move: number) => boolean,
): FrequencyStats {
  const moves: number[] = [];
  const holds: number[] = [];
  let wins = 0;
  const oneYearAgo = data.length - 252;
  const fiveYearAgo = data.length - 1260;

  for (const i of indices) {
    if (i + holdDays >= data.length) continue;
    const move = ((data[i + holdDays].close - data[i].close) / data[i].close) * 100;
    moves.push(move);
    holds.push(holdDays);
    if (successFn(move)) wins++;
  }

  return {
    event,
    totalOccurrences: indices.length,
    last1Year: indices.filter((i) => i >= oneYearAgo).length,
    last5Years: indices.filter((i) => i >= fiveYearAgo).length,
    avgMovePct: moves.length ? parseFloat((moves.reduce((a, b) => a + b, 0) / moves.length).toFixed(2)) : 0,
    medianMovePct: parseFloat(median(moves).toFixed(2)),
    maxGainPct: moves.length ? parseFloat(Math.max(...moves).toFixed(2)) : 0,
    maxLossPct: moves.length ? parseFloat(Math.min(...moves).toFixed(2)) : 0,
    avgHoldingDays: holdDays,
    successFrequencyPct: moves.length ? Math.round((wins / moves.length) * 100) : 0,
  };
}

export function calcFrequencyAnalysis(data: OHLCV[]): FrequencyStats[] {
  if (data.length < 100) return [];
  const stats: FrequencyStats[] = [];

  // RSI Oversold / Overbought
  const rsiOversold: number[] = [];
  const rsiOverbought: number[] = [];
  for (let i = 20; i < data.length; i++) {
    const rsi = calcRSI(data.slice(0, i + 1));
    if (rsi == null) continue;
    if (rsi < 30) rsiOversold.push(i);
    if (rsi > 70) rsiOverbought.push(i);
  }
  stats.push(summarize("RSI Oversold (<30)", rsiOversold, data, 5, (m) => m > 0));
  stats.push(summarize("RSI Overbought (>70)", rsiOverbought, data, 5, (m) => m < 0));

  // MACD bullish / bearish cross
  const macdBull: number[] = [];
  const macdBear: number[] = [];
  for (let i = 35; i < data.length; i++) {
    const prev = calcMACD(data.slice(0, i));
    const curr = calcMACD(data.slice(0, i + 1));
    if (!prev || !curr) continue;
    const pd = (prev.MACD ?? 0) - (prev.signal ?? 0);
    const cd = (curr.MACD ?? 0) - (curr.signal ?? 0);
    if (pd < 0 && cd > 0) macdBull.push(i);
    if (pd > 0 && cd < 0) macdBear.push(i);
  }
  stats.push(summarize("MACD Bullish Crossover", macdBull, data, 5, (m) => m > 0));
  stats.push(summarize("MACD Bearish Crossover", macdBear, data, 5, (m) => m < 0));

  // MA Crossovers
  const crosses = detectAllCrosses(data);
  const golden = crosses.filter((c) => c.type === "Golden Cross").map((c) => c.index);
  const death  = crosses.filter((c) => c.type === "Death Cross").map((c) => c.index);
  const sma20x = crosses.filter((c) => c.type === "SMA20×SMA50" && c.direction === "bullish").map((c) => c.index);
  stats.push(summarize("Golden Cross (SMA50×SMA200)", golden, data, 20, (m) => m > 0));
  stats.push(summarize("Death Cross (SMA50×SMA200)", death, data, 20, (m) => m < 0));
  stats.push(summarize("SMA20×SMA50 Bullish", sma20x, data, 10, (m) => m > 0));

  // Volume breakouts
  const volBreak: number[] = [];
  for (let i = 20; i < data.length; i++) {
    const avg = data.slice(i - 20, i).reduce((s, d) => s + d.volume, 0) / 20;
    if (avg > 0 && data[i].volume >= avg * 1.5) volBreak.push(i);
  }
  stats.push(summarize("Volume Breakout (≥150% Avg)", volBreak, data, 3, (m) => m > 0));

  // Support bounce / Resistance breakout (approx using multi-level)
  const bounce: number[] = [];
  const resistBreak: number[] = [];
  for (let i = 60; i < data.length - 5; i += 5) {
    const slice = data.slice(0, i + 1);
    const sr = calcMultiLevelSR(slice);
    const s1 = sr.supports[0]?.price;
    const r1 = sr.resistances[0]?.price;
    const c = data[i].close;
    const next = data[Math.min(i + 5, data.length - 1)].close;
    if (s1 && Math.abs(c - s1) / c < 0.015 && next > c) bounce.push(i);
    if (r1 && c > r1 && next > c) resistBreak.push(i);
  }
  stats.push(summarize("Support Bounce", bounce, data, 5, (m) => m > 0));
  stats.push(summarize("Resistance Breakout", resistBreak, data, 5, (m) => m > 0));

  // Chart patterns (sample every 10 bars for performance)
  const patternHits: Record<string, number[]> = {};
  for (let i = 80; i < data.length; i += 10) {
    const found = detectChartPatterns(data.slice(0, i + 1));
    for (const p of found.slice(0, 2)) {
      if (!patternHits[p.pattern]) patternHits[p.pattern] = [];
      patternHits[p.pattern].push(i);
    }
  }
  for (const [name, idxs] of Object.entries(patternHits)) {
    const bearishName =
      name.toLowerCase().includes("bear") ||
      name.toLowerCase().includes("top") ||
      (name.includes("Shoulders") && !name.includes("Inverse"));
    const successFn = bearishName
      ? (m: number) => m < 0
      : (m: number) => m > 0;
    stats.push(summarize(`Chart Pattern: ${name}`, idxs, data, 10, successFn));
  }

  return stats;
}
