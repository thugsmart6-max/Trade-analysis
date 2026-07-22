import type { OHLCV } from "./indicators";

export interface PriceLevel {
  rank: number;
  price: number;
  distancePct: number;
  strength: number;       // 0–100
  touches: number;
  lastTested: string | null;
  type: "support" | "resistance";
}

export interface MultiLevelSR {
  supports: PriceLevel[];
  resistances: PriceLevel[];
  currentPrice: number;
}

function fmtDate(d: Date | string) {
  const dt = d instanceof Date ? d : new Date(d);
  return isNaN(dt.getTime()) ? null : dt.toISOString().split("T")[0];
}

/** Find local pivot highs/lows with a lookback window */
function findPivots(data: OHLCV[], lookback = 5) {
  const highs: { price: number; index: number; date: string }[] = [];
  const lows:  { price: number; index: number; date: string }[] = [];

  for (let i = lookback; i < data.length - lookback; i++) {
    const hi = data[i].high;
    const lo = data[i].low;
    let isHigh = true;
    let isLow  = true;
    for (let j = 1; j <= lookback; j++) {
      if (data[i - j].high >= hi || data[i + j].high >= hi) isHigh = false;
      if (data[i - j].low  <= lo || data[i + j].low  <= lo) isLow  = false;
    }
    if (isHigh) highs.push({ price: hi, index: i, date: fmtDate(data[i].date) ?? "" });
    if (isLow)  lows.push({ price: lo, index: i, date: fmtDate(data[i].date) ?? "" });
  }
  return { highs, lows };
}

/** Cluster nearby price levels within tolerance */
function clusterLevels(
  pivots: { price: number; index: number; date: string }[],
  currentPrice: number,
  type: "support" | "resistance",
  tolerancePct = 0.015,
): PriceLevel[] {
  if (!pivots.length) return [];

  const sorted = [...pivots].sort((a, b) => a.price - b.price);
  const clusters: { prices: number[]; dates: string[]; indices: number[] }[] = [];

  for (const p of sorted) {
    const last = clusters[clusters.length - 1];
    if (last && Math.abs(p.price - last.prices[last.prices.length - 1]) / p.price < tolerancePct) {
      last.prices.push(p.price);
      last.dates.push(p.date);
      last.indices.push(p.index);
    } else {
      clusters.push({ prices: [p.price], dates: [p.date], indices: [p.index] });
    }
  }

  const levels: PriceLevel[] = clusters.map((c) => {
    const price = c.prices.reduce((a, b) => a + b, 0) / c.prices.length;
    const touches = c.prices.length;
    const lastTested = c.dates.sort().reverse()[0] || null;
    // Strength: more touches + more recent = stronger (cap 100)
    const recencyBoost = lastTested
      ? Math.max(0, 30 - Math.floor((Date.now() - new Date(lastTested).getTime()) / (86400000 * 30)))
      : 0;
    const strength = Math.min(100, Math.round(touches * 18 + recencyBoost));
    const distancePct = currentPrice
      ? parseFloat((((price - currentPrice) / currentPrice) * 100).toFixed(2))
      : 0;
    return { rank: 0, price: parseFloat(price.toFixed(2)), distancePct, strength, touches, lastTested, type };
  });

  // For support: below price, closest first (S1 = nearest)
  // For resistance: above price, closest first (R1 = nearest)
  const filtered = type === "support"
    ? levels.filter((l) => l.price < currentPrice).sort((a, b) => b.price - a.price)
    : levels.filter((l) => l.price > currentPrice).sort((a, b) => a.price - b.price);

  return filtered.slice(0, 3).map((l, i) => ({ ...l, rank: i + 1 }));
}

export function calcMultiLevelSR(data: OHLCV[]): MultiLevelSR {
  const currentPrice = data.length ? data[data.length - 1].close : 0;
  if (data.length < 30) {
    return { supports: [], resistances: [], currentPrice };
  }

  const window = data.slice(-252); // ~1 year
  const { highs, lows } = findPivots(window, 5);

  const supports    = clusterLevels(lows,  currentPrice, "support");
  const resistances = clusterLevels(highs, currentPrice, "resistance");

  // Fallback: if fewer than 3, pad with ATR-based levels
  if (supports.length < 3 || resistances.length < 3) {
    const recent = window.slice(-60);
    const hi = Math.max(...recent.map((d) => d.high));
    const lo = Math.min(...recent.map((d) => d.low));
    const mid = (hi + lo) / 2;

    while (supports.length < 3) {
      const price = lo + (supports.length * (mid - lo) / 3);
      if (price >= currentPrice) break;
      supports.push({
        rank: supports.length + 1,
        price: parseFloat(price.toFixed(2)),
        distancePct: parseFloat((((price - currentPrice) / currentPrice) * 100).toFixed(2)),
        strength: 40 - supports.length * 8,
        touches: 1,
        lastTested: null,
        type: "support",
      });
    }
    while (resistances.length < 3) {
      const price = mid + (resistances.length * (hi - mid) / 3);
      if (price <= currentPrice) break;
      resistances.push({
        rank: resistances.length + 1,
        price: parseFloat(price.toFixed(2)),
        distancePct: parseFloat((((price - currentPrice) / currentPrice) * 100).toFixed(2)),
        strength: 40 - resistances.length * 8,
        touches: 1,
        lastTested: null,
        type: "resistance",
      });
    }
  }

  return { supports, resistances, currentPrice };
}
