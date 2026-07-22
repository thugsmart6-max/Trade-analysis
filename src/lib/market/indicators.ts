import {
  RSI, MACD, SMA, EMA, ADX, ATR, OBV, CCI, SD,
} from "technicalindicators";

export interface OHLCV {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

function closes(d: OHLCV[]) { return d.map((x) => x.close); }
function highs(d: OHLCV[])  { return d.map((x) => x.high); }
function lows(d: OHLCV[])   { return d.map((x) => x.low); }
function vols(d: OHLCV[])   { return d.map((x) => x.volume); }
function opens(d: OHLCV[])  { return d.map((x) => x.open); }

function last<T>(arr: T[]): T | null { return arr.length ? arr[arr.length - 1] : null; }
function pad<T>(arr: T[], n: number, fill: T): T[] {
  const pre = Array(Math.max(0, n - arr.length)).fill(fill);
  return [...pre, ...arr];
}

export function calcRSI(data: OHLCV[], period = 14) {
  if (data.length < period + 1) return null;
  const vals = RSI.calculate({ values: closes(data), period });
  return last(vals);
}

export function calcMACD(data: OHLCV[]) {
  if (data.length < 26) return null;
  const vals = MACD.calculate({
    values: closes(data),
    fastPeriod: 12, slowPeriod: 26, signalPeriod: 9,
    SimpleMAOscillator: false, SimpleMASignal: false,
  });
  return last(vals);
}

export function calcSMA(data: OHLCV[], period: number) {
  if (data.length < period) return null;
  const vals = SMA.calculate({ values: closes(data), period });
  return last(vals);
}

export function calcEMA(data: OHLCV[], period: number) {
  if (data.length < period) return null;
  const vals = EMA.calculate({ values: closes(data), period });
  return last(vals);
}

export function calcBollinger(data: OHLCV[], period = 20, mult = 2) {
  if (data.length < period) return null;
  const slice = closes(data).slice(-period);
  const mean  = slice.reduce((s, v) => s + v, 0) / period;
  const sdVals = SD.calculate({ values: slice, period });
  const sd     = last(sdVals) ?? 0;
  return { upper: mean + mult * sd, middle: mean, lower: mean - mult * sd };
}

export function calcADX(data: OHLCV[], period = 14) {
  if (data.length < period + 1) return null;
  const vals = ADX.calculate({
    close: closes(data), high: highs(data), low: lows(data), period,
  });
  return last(vals);
}

export function calcATR(data: OHLCV[], period = 14) {
  if (data.length < period + 1) return null;
  const vals = ATR.calculate({
    close: closes(data), high: highs(data), low: lows(data), period,
  });
  return last(vals);
}

export function calcVWAP(data: OHLCV[]) {
  // VWAP for last 20 bars
  const d = data.slice(-20);
  if (!d.length) return null;
  let tvpv = 0, tvol = 0;
  for (const bar of d) {
    const tp = (bar.high + bar.low + bar.close) / 3;
    tvpv += tp * bar.volume;
    tvol += bar.volume;
  }
  return tvol ? tvpv / tvol : null;
}

export function calcFibonacci(data: OHLCV[]) {
  const d = data.slice(-60);
  if (!d.length) return null;
  const high = Math.max(...d.map((x) => x.high));
  const low  = Math.min(...d.map((x) => x.low));
  const diff = high - low;
  return {
    level_0:    high,
    level_236:  high - 0.236 * diff,
    level_382:  high - 0.382 * diff,
    level_5:    high - 0.5   * diff,
    level_618:  high - 0.618 * diff,
    level_786:  high - 0.786 * diff,
    level_1:    low,
  };
}

/** @deprecated Prefer calcMultiLevelSR from levels.ts — kept for chart ReferenceLine fallback */
export function calcSupportResistance(data: OHLCV[]) {
  const d = data.slice(-60);
  if (d.length < 5) return { support: null, resistance: null };
  const highs60 = d.map((x) => x.high);
  const lows60  = d.map((x) => x.low);
  return { support: Math.min(...lows60), resistance: Math.max(...highs60) };
}

export function calcOBV(data: OHLCV[]) {
  if (data.length < 2) return null;
  const vals = OBV.calculate({ close: closes(data), volume: vols(data) });
  return last(vals);
}

export function calcStoch(data: OHLCV[], period = 14) {
  if (data.length < period) return null;
  const slice = data.slice(-period);
  const highP = Math.max(...slice.map((d) => d.high));
  const lowP  = Math.min(...slice.map((d) => d.low));
  const curr  = slice[slice.length - 1].close;
  const k = lowP === highP ? 50 : ((curr - lowP) / (highP - lowP)) * 100;
  return { k: parseFloat(k.toFixed(2)), d: parseFloat(k.toFixed(2)) };
}

export function calcCCI(data: OHLCV[], period = 20) {
  if (data.length < period) return null;
  const vals = CCI.calculate({
    close: closes(data), high: highs(data), low: lows(data), period,
  });
  return last(vals);
}

export function calcAllIndicators(data: OHLCV[]) {
  const sma20  = calcSMA(data, 20);
  const sma50  = calcSMA(data, 50);
  const sma100 = calcSMA(data, 100);
  const sma200 = calcSMA(data, 200);
  const ema9   = calcEMA(data, 9);
  const ema21  = calcEMA(data, 21);
  const ema50  = calcEMA(data, 50);
  const ema200 = calcEMA(data, 200);
  const rsi    = calcRSI(data);
  const macd   = calcMACD(data);
  const bb     = calcBollinger(data);
  const adx    = calcADX(data);
  const atr    = calcATR(data);
  const vwap   = calcVWAP(data);
  const fib    = calcFibonacci(data);
  const sr     = calcSupportResistance(data);
  const stoch  = calcStoch(data);
  const cci    = calcCCI(data);
  const obv    = calcOBV(data);
  const currentPrice = data.length ? data[data.length - 1].close : null;

  let trend = "Neutral";
  if (sma20 && sma50 && currentPrice) {
    if (currentPrice > sma20 && sma20 > sma50) trend = "Uptrend";
    else if (currentPrice < sma20 && sma20 < sma50) trend = "Downtrend";
    else trend = "Sideways";
  }

  let cross = "None";
  if (sma50 && sma200) {
    if (sma50 > sma200) cross = "Golden Cross";
    else cross = "Death Cross";
  }

  let rsiSignal = "Neutral";
  if (rsi !== null) {
    if (rsi > 70) rsiSignal = "Overbought";
    else if (rsi < 30) rsiSignal = "Oversold";
  }

  let macdSignal = "Neutral";
  if (macd) {
    if ((macd.MACD ?? 0) > (macd.signal ?? 0)) macdSignal = "Bullish";
    else macdSignal = "Bearish";
  }

  let bbSignal = "Mid";
  if (bb && currentPrice) {
    if (currentPrice > bb.upper) bbSignal = "Above Upper Band";
    else if (currentPrice < bb.lower) bbSignal = "Below Lower Band";
    else if (currentPrice > bb.middle) bbSignal = "Above Middle Band";
    else bbSignal = "Below Middle Band";
  }

  return {
    sma: { sma20, sma50, sma100, sma200 },
    ema: { ema9, ema21, ema50, ema200 },
    rsi, rsiSignal,
    macd, macdSignal,
    bollingerBands: bb, bbSignal,
    adx, atr, vwap,
    fibonacci: fib,
    supportResistance: sr,
    stochastic: stoch,
    cci, obv,
    trend, crossSignal: cross,
    currentPrice,
  };
}

// Signal statistics: count historical occurrences and outcomes
export function calcSignalStats(data: OHLCV[]) {
  if (data.length < 50) return null;

  const results = {
    goldenCross: { occurrences: 0, avgMovePercent: 0, maxGain: 0, maxLoss: 0, avgDays: 0 },
    deathCross:  { occurrences: 0, avgMovePercent: 0, maxGain: 0, maxLoss: 0, avgDays: 0 },
    rsiOversold: { occurrences: 0, successRate: 0, avgMovePercent: 0 },
    rsiOverbought: { occurrences: 0, successRate: 0, avgMovePercent: 0 },
    macdBullish: { occurrences: 0, successRate: 0, avgMovePercent: 0 },
    bollingerBreakout: { occurrences: 0, avgMovePercent: 0 },
    volumeSpike: { occurrences: 0, avgMovePercent: 0 },
  };

  const closes = data.map((d) => d.close);
  const avgVolume = data.slice(0, -1).reduce((s, d) => s + d.volume, 0) / (data.length - 1);

  // RSI signals
  let rsiOversoldWins = 0, rsiOversoldTotal = 0, rsiOversoldMove = 0;
  let rsiOverboughtWins = 0, rsiOverboughtTotal = 0, rsiOverboughtMove = 0;
  for (let i = 20; i < data.length - 5; i++) {
    const slice = data.slice(0, i + 1);
    const rsi = calcRSI(slice);
    if (rsi === null) continue;
    const pctMove = ((closes[i + 5] - closes[i]) / closes[i]) * 100;
    if (rsi < 30) {
      rsiOversoldTotal++;
      rsiOversoldMove += pctMove;
      if (pctMove > 0) rsiOversoldWins++;
    }
    if (rsi > 70) {
      rsiOverboughtTotal++;
      rsiOverboughtMove += pctMove;
      if (pctMove < 0) rsiOverboughtWins++;
    }
  }
  results.rsiOversold  = {
    occurrences: rsiOversoldTotal,
    successRate: rsiOversoldTotal ? Math.round((rsiOversoldWins / rsiOversoldTotal) * 100) : 0,
    avgMovePercent: rsiOversoldTotal ? parseFloat((rsiOversoldMove / rsiOversoldTotal).toFixed(2)) : 0,
  };
  results.rsiOverbought = {
    occurrences: rsiOverboughtTotal,
    successRate: rsiOverboughtTotal ? Math.round((rsiOverboughtWins / rsiOverboughtTotal) * 100) : 0,
    avgMovePercent: rsiOverboughtTotal ? parseFloat((rsiOverboughtMove / rsiOverboughtTotal).toFixed(2)) : 0,
  };

  // Volume spikes
  let vsCount = 0, vsMoveTotal = 0;
  for (let i = 1; i < data.length - 3; i++) {
    if (data[i].volume > avgVolume * 2) {
      vsCount++;
      const pct = ((closes[i + 3] - closes[i]) / closes[i]) * 100;
      vsMoveTotal += pct;
    }
  }
  results.volumeSpike = {
    occurrences: vsCount,
    avgMovePercent: vsCount ? parseFloat((vsMoveTotal / vsCount).toFixed(2)) : 0,
  };

  // MACD bullish crossovers
  let macdWins = 0, macdTotal = 0, macdMove = 0;
  for (let i = 30; i < data.length - 5; i++) {
    const prev = MACD.calculate({ values: closes.slice(0, i),     fastPeriod: 12, slowPeriod: 26, signalPeriod: 9, SimpleMAOscillator: false, SimpleMASignal: false });
    const curr = MACD.calculate({ values: closes.slice(0, i + 1), fastPeriod: 12, slowPeriod: 26, signalPeriod: 9, SimpleMAOscillator: false, SimpleMASignal: false });
    const p = prev[prev.length - 1];
    const c = curr[curr.length - 1];
    if (!p || !c) continue;
    const prevDiff = (p.MACD ?? 0) - (p.signal ?? 0);
    const currDiff = (c.MACD ?? 0) - (c.signal ?? 0);
    if (prevDiff < 0 && currDiff > 0) {
      macdTotal++;
      const pct = ((closes[i + 5] - closes[i]) / closes[i]) * 100;
      macdMove += pct;
      if (pct > 0) macdWins++;
    }
  }
  results.macdBullish = {
    occurrences: macdTotal,
    successRate: macdTotal ? Math.round((macdWins / macdTotal) * 100) : 0,
    avgMovePercent: macdTotal ? parseFloat((macdMove / macdTotal).toFixed(2)) : 0,
  };

  // Bollinger breakouts
  let bbCount = 0, bbMoveTotal = 0;
  for (let i = 25; i < data.length - 3; i++) {
    const b = calcBollinger(data.slice(0, i + 1));
    if (!b) continue;
    if (closes[i] > b.upper || closes[i] < b.lower) {
      bbCount++;
      const pct = ((closes[i + 3] - closes[i]) / closes[i]) * 100;
      bbMoveTotal += pct;
    }
  }
  results.bollingerBreakout = {
    occurrences: bbCount,
    avgMovePercent: bbCount ? parseFloat((bbMoveTotal / bbCount).toFixed(2)) : 0,
  };

  return results;
}

/** Chart pattern occurrence stats — uses detectChartPatterns from patterns.ts */
export function calcPatternStats(data: OHLCV[]) {
  // Deferred to patterns module at action layer; keep empty stub for backward compat
  void data;
  return [] as Array<{
    pattern: string;
    occurrences: number;
    successfulBreakouts: number;
    failedBreakouts: number;
    successPercent: number;
    avgReturn: number;
    avgDuration: number;
  }>;
}
