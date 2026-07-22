import type { OHLCV } from "./indicators";
import { calcSMA } from "./indicators";

export const CHART_PATTERNS = [
  "Ascending Triangle",
  "Descending Triangle",
  "Symmetrical Triangle",
  "Cup and Handle",
  "Double Top",
  "Double Bottom",
  "Head and Shoulders",
  "Inverse Head and Shoulders",
  "Bull Flag",
  "Bear Flag",
  "Pennant",
  "Rectangle",
  "Ascending Channel",
  "Descending Channel",
  "Rising Wedge",
  "Falling Wedge",
  "Rounded Bottom",
  "Rounded Top",
] as const;

export type ChartPatternName = typeof CHART_PATTERNS[number];

export interface ChartPatternResult {
  pattern: ChartPatternName;
  confidence: number;          // 0–100
  breakoutDirection: "Up" | "Down" | "Neutral";
  detectionDate: string;
  historicalSuccessRate: number | null;
}

function fmtDate(d: Date | string) {
  const dt = d instanceof Date ? d : new Date(d);
  return isNaN(dt.getTime()) ? new Date().toISOString().split("T")[0] : dt.toISOString().split("T")[0];
}

function slope(ys: number[]): number {
  const n = ys.length;
  if (n < 2) return 0;
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  for (let i = 0; i < n; i++) {
    sumX += i; sumY += ys[i]; sumXY += i * ys[i]; sumX2 += i * i;
  }
  const den = n * sumX2 - sumX * sumX;
  return den === 0 ? 0 : (n * sumXY - sumX * sumY) / den;
}

function stdev(arr: number[]): number {
  if (arr.length < 2) return 0;
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  return Math.sqrt(arr.reduce((s, v) => s + (v - mean) ** 2, 0) / arr.length);
}

/** Historical success rates (approximate empirical base rates) */
const SUCCESS_RATES: Partial<Record<ChartPatternName, number>> = {
  "Ascending Triangle": 72,
  "Descending Triangle": 68,
  "Symmetrical Triangle": 55,
  "Cup and Handle": 65,
  "Double Top": 70,
  "Double Bottom": 73,
  "Head and Shoulders": 75,
  "Inverse Head and Shoulders": 74,
  "Bull Flag": 67,
  "Bear Flag": 66,
  "Pennant": 60,
  "Rectangle": 58,
  "Ascending Channel": 62,
  "Descending Channel": 61,
  "Rising Wedge": 68,
  "Falling Wedge": 69,
  "Rounded Bottom": 64,
  "Rounded Top": 63,
};

export function detectChartPatterns(data: OHLCV[]): ChartPatternResult[] {
  if (data.length < 40) return [];
  const results: ChartPatternResult[] = [];
  const window = data.slice(-80);
  const closes = window.map((d) => d.close);
  const highs  = window.map((d) => d.high);
  const lows   = window.map((d) => d.low);
  const lastDate = fmtDate(window[window.length - 1].date);
  const price = closes[closes.length - 1];
  const sma20 = calcSMA(window, 20);

  const highSlope = slope(highs.slice(-30));
  const lowSlope  = slope(lows.slice(-30));
  const closeSlope = slope(closes.slice(-30));
  const highRange = Math.max(...highs.slice(-30)) - Math.min(...highs.slice(-30));
  const lowRange  = Math.max(...lows.slice(-30)) - Math.min(...lows.slice(-30));
  const avgPrice  = closes.slice(-30).reduce((a, b) => a + b, 0) / 30;
  const volatility = stdev(closes.slice(-20)) / avgPrice;

  // Ascending Triangle: flat highs, rising lows
  if (Math.abs(highSlope) < avgPrice * 0.0008 && lowSlope > avgPrice * 0.001) {
    results.push({
      pattern: "Ascending Triangle",
      confidence: Math.min(92, Math.round(55 + lowSlope / avgPrice * 8000)),
      breakoutDirection: "Up",
      detectionDate: lastDate,
      historicalSuccessRate: SUCCESS_RATES["Ascending Triangle"] ?? null,
    });
  }

  // Descending Triangle: flat lows, falling highs
  if (Math.abs(lowSlope) < avgPrice * 0.0008 && highSlope < -avgPrice * 0.001) {
    results.push({
      pattern: "Descending Triangle",
      confidence: Math.min(92, Math.round(55 + Math.abs(highSlope) / avgPrice * 8000)),
      breakoutDirection: "Down",
      detectionDate: lastDate,
      historicalSuccessRate: SUCCESS_RATES["Descending Triangle"] ?? null,
    });
  }

  // Symmetrical Triangle: converging highs & lows
  if (highSlope < -avgPrice * 0.0005 && lowSlope > avgPrice * 0.0005 && highRange > lowRange * 0.5) {
    results.push({
      pattern: "Symmetrical Triangle",
      confidence: 60,
      breakoutDirection: "Neutral",
      detectionDate: lastDate,
      historicalSuccessRate: SUCCESS_RATES["Symmetrical Triangle"] ?? null,
    });
  }

  // Rising / Falling Wedge
  if (highSlope > avgPrice * 0.0008 && lowSlope > avgPrice * 0.0012 && lowSlope > highSlope) {
    results.push({
      pattern: "Rising Wedge",
      confidence: 62,
      breakoutDirection: "Down",
      detectionDate: lastDate,
      historicalSuccessRate: SUCCESS_RATES["Rising Wedge"] ?? null,
    });
  }
  if (highSlope < -avgPrice * 0.0012 && lowSlope < -avgPrice * 0.0008 && highSlope < lowSlope) {
    results.push({
      pattern: "Falling Wedge",
      confidence: 63,
      breakoutDirection: "Up",
      detectionDate: lastDate,
      historicalSuccessRate: SUCCESS_RATES["Falling Wedge"] ?? null,
    });
  }

  // Channels
  if (highSlope > avgPrice * 0.0006 && lowSlope > avgPrice * 0.0006 && Math.abs(highSlope - lowSlope) < avgPrice * 0.0005) {
    results.push({
      pattern: "Ascending Channel",
      confidence: 58,
      breakoutDirection: "Up",
      detectionDate: lastDate,
      historicalSuccessRate: SUCCESS_RATES["Ascending Channel"] ?? null,
    });
  }
  if (highSlope < -avgPrice * 0.0006 && lowSlope < -avgPrice * 0.0006 && Math.abs(highSlope - lowSlope) < avgPrice * 0.0005) {
    results.push({
      pattern: "Descending Channel",
      confidence: 58,
      breakoutDirection: "Down",
      detectionDate: lastDate,
      historicalSuccessRate: SUCCESS_RATES["Descending Channel"] ?? null,
    });
  }

  // Rectangle: sideways range
  if (Math.abs(closeSlope) < avgPrice * 0.0004 && volatility < 0.04) {
    results.push({
      pattern: "Rectangle",
      confidence: 55,
      breakoutDirection: "Neutral",
      detectionDate: lastDate,
      historicalSuccessRate: SUCCESS_RATES["Rectangle"] ?? null,
    });
  }

  // Double Top / Bottom (local peaks/troughs ~equal)
  const mid = Math.floor(window.length / 2);
  const leftMax  = Math.max(...highs.slice(0, mid));
  const rightMax = Math.max(...highs.slice(mid));
  const leftMin  = Math.min(...lows.slice(0, mid));
  const rightMin = Math.min(...lows.slice(mid));

  if (Math.abs(leftMax - rightMax) / leftMax < 0.02 && price < leftMax * 0.97) {
    results.push({
      pattern: "Double Top",
      confidence: Math.round(65 + (1 - Math.abs(leftMax - rightMax) / leftMax) * 20),
      breakoutDirection: "Down",
      detectionDate: lastDate,
      historicalSuccessRate: SUCCESS_RATES["Double Top"] ?? null,
    });
  }
  if (Math.abs(leftMin - rightMin) / leftMin < 0.02 && price > leftMin * 1.03) {
    results.push({
      pattern: "Double Bottom",
      confidence: Math.round(65 + (1 - Math.abs(leftMin - rightMin) / leftMin) * 20),
      breakoutDirection: "Up",
      detectionDate: lastDate,
      historicalSuccessRate: SUCCESS_RATES["Double Bottom"] ?? null,
    });
  }

  // Head and Shoulders / Inverse (simplified: 3 peaks with middle higher/lower)
  if (window.length >= 60) {
    const third = Math.floor(window.length / 3);
    const p1 = Math.max(...highs.slice(0, third));
    const p2 = Math.max(...highs.slice(third, third * 2));
    const p3 = Math.max(...highs.slice(third * 2));
    if (p2 > p1 * 1.02 && p2 > p3 * 1.02 && Math.abs(p1 - p3) / p1 < 0.04 && price < p2 * 0.95) {
      results.push({
        pattern: "Head and Shoulders",
        confidence: 70,
        breakoutDirection: "Down",
        detectionDate: lastDate,
        historicalSuccessRate: SUCCESS_RATES["Head and Shoulders"] ?? null,
      });
    }
    const t1 = Math.min(...lows.slice(0, third));
    const t2 = Math.min(...lows.slice(third, third * 2));
    const t3 = Math.min(...lows.slice(third * 2));
    if (t2 < t1 * 0.98 && t2 < t3 * 0.98 && Math.abs(t1 - t3) / t1 < 0.04 && price > t2 * 1.05) {
      results.push({
        pattern: "Inverse Head and Shoulders",
        confidence: 70,
        breakoutDirection: "Up",
        detectionDate: lastDate,
        historicalSuccessRate: SUCCESS_RATES["Inverse Head and Shoulders"] ?? null,
      });
    }
  }

  // Flags / Pennant: sharp move then consolidation
  const prior = closes.slice(-40, -15);
  const recent = closes.slice(-15);
  if (prior.length && recent.length) {
    const priorMove = (prior[prior.length - 1] - prior[0]) / prior[0];
    const recentVol = stdev(recent) / (recent.reduce((a, b) => a + b, 0) / recent.length);
    if (priorMove > 0.08 && recentVol < 0.025) {
      results.push({
        pattern: priorMove > 0.12 ? "Bull Flag" : "Pennant",
        confidence: 58,
        breakoutDirection: "Up",
        detectionDate: lastDate,
        historicalSuccessRate: SUCCESS_RATES[priorMove > 0.12 ? "Bull Flag" : "Pennant"] ?? null,
      });
    }
    if (priorMove < -0.08 && recentVol < 0.025) {
      results.push({
        pattern: "Bear Flag",
        confidence: 58,
        breakoutDirection: "Down",
        detectionDate: lastDate,
        historicalSuccessRate: SUCCESS_RATES["Bear Flag"] ?? null,
      });
    }
  }

  // Rounded Bottom / Top (U / ∩ shape via mid vs ends)
  if (closes.length >= 40) {
    const first = closes.slice(0, 10).reduce((a, b) => a + b, 0) / 10;
    const middle = closes.slice(15, 25).reduce((a, b) => a + b, 0) / 10;
    const last = closes.slice(-10).reduce((a, b) => a + b, 0) / 10;
    if (middle < first * 0.96 && middle < last * 0.96 && last > first * 0.98) {
      results.push({
        pattern: "Rounded Bottom",
        confidence: 57,
        breakoutDirection: "Up",
        detectionDate: lastDate,
        historicalSuccessRate: SUCCESS_RATES["Rounded Bottom"] ?? null,
      });
    }
    if (middle > first * 1.04 && middle > last * 1.04 && last < first * 1.02) {
      results.push({
        pattern: "Rounded Top",
        confidence: 57,
        breakoutDirection: "Down",
        detectionDate: lastDate,
        historicalSuccessRate: SUCCESS_RATES["Rounded Top"] ?? null,
      });
    }
  }

  // Cup and Handle: rounded bottom + small pullback
  if (sma20 && closes.length >= 50) {
    const left = closes.slice(-50, -30);
    const cup  = closes.slice(-30, -10);
    const handle = closes.slice(-10);
    const leftAvg = left.reduce((a, b) => a + b, 0) / left.length;
    const cupMin  = Math.min(...cup);
    const handleAvg = handle.reduce((a, b) => a + b, 0) / handle.length;
    if (cupMin < leftAvg * 0.92 && handleAvg > cupMin * 1.03 && handleAvg < leftAvg * 1.02) {
      results.push({
        pattern: "Cup and Handle",
        confidence: 61,
        breakoutDirection: "Up",
        detectionDate: lastDate,
        historicalSuccessRate: SUCCESS_RATES["Cup and Handle"] ?? null,
      });
    }
  }

  // Deduplicate by pattern name, keep highest confidence
  const map = new Map<string, ChartPatternResult>();
  for (const r of results) {
    const prev = map.get(r.pattern);
    if (!prev || r.confidence > prev.confidence) map.set(r.pattern, r);
  }
  return Array.from(map.values()).sort((a, b) => b.confidence - a.confidence);
}

export type TrendLabel =
  | "Uptrend" | "Strong Uptrend" | "Downtrend" | "Strong Downtrend"
  | "Sideways" | "Consolidation"
  | ChartPatternName;

export function classifyTrend(data: OHLCV[], chartPatterns: ChartPatternResult[] = []): TrendLabel {
  if (data.length < 50) return "Sideways";
  const price = data[data.length - 1].close;
  const sma20 = calcSMA(data, 20);
  const sma50 = calcSMA(data, 50);
  const sma200 = calcSMA(data, 200);

  // Prefer active chart pattern as primary label when high confidence
  const top = chartPatterns[0];
  if (top && top.confidence >= 65) return top.pattern;

  if (sma20 && sma50 && sma200) {
    if (price > sma20 && sma20 > sma50 && sma50 > sma200) {
      const strength = (price - sma200) / sma200;
      return strength > 0.15 ? "Strong Uptrend" : "Uptrend";
    }
    if (price < sma20 && sma20 < sma50 && sma50 < sma200) {
      const strength = (sma200 - price) / sma200;
      return strength > 0.15 ? "Strong Downtrend" : "Downtrend";
    }
  }

  const recent = data.slice(-20).map((d) => d.close);
  const range = (Math.max(...recent) - Math.min(...recent)) / price;
  if (range < 0.04) return "Consolidation";
  return "Sideways";
}
