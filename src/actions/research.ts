"use server";

import { connectDB }       from "@/lib/db/connect";
import StockResearch       from "@/lib/db/models/StockResearch";
import { toNSE, fetchQuote, fetchSummary, fetchHistorical, searchStocks } from "@/lib/market/yahoo";
import { recentCrosses, pctChangeSince, type CrossType } from "@/lib/market/crossovers";
import { calcFrequencyAnalysis } from "@/lib/market/frequency";
import { calcVolumeProfile, matchesVolumeFilter, type VolumeFilter } from "@/lib/market/volume";
import { calcFundamentals } from "@/lib/market/fundamentals";
import { generateInsights }  from "@/lib/market/ai";
import { generateStockDataWithAI } from "@/lib/market/ai-research";
import { calcRSI, calcMACD, calcSMA, calcEMA, calcBollinger, calcADX,
         calcATR, calcVWAP, calcFibonacci, calcSupportResistance,
         calcOBV, calcStoch, calcCCI,
         calcSignalStats, type OHLCV } from "@/lib/market/indicators";
import { calcMultiLevelSR } from "@/lib/market/levels";
import { detectChartPatterns, classifyTrend } from "@/lib/market/patterns";
import { formatResearchDateKey, toCompanyKey, startOfLocalDay } from "@/lib/market/research-path";

// ─── Search ────────────────────────────────────────────────────────────────
const NSE_STOCKS = [
  { symbol: "RELIANCE.NS",   longname: "Reliance Industries Ltd",       shortname: "RELIANCE"   },
  { symbol: "TCS.NS",        longname: "Tata Consultancy Services Ltd", shortname: "TCS"        },
  { symbol: "INFY.NS",       longname: "Infosys Ltd",                   shortname: "INFY"       },
  { symbol: "HDFCBANK.NS",   longname: "HDFC Bank Ltd",                 shortname: "HDFCBANK"   },
  { symbol: "ICICIBANK.NS",  longname: "ICICI Bank Ltd",                shortname: "ICICIBANK"  },
  { symbol: "SBIN.NS",       longname: "State Bank of India",           shortname: "SBIN"       },
  { symbol: "WIPRO.NS",      longname: "Wipro Ltd",                     shortname: "WIPRO"      },
  { symbol: "BAJFINANCE.NS", longname: "Bajaj Finance Ltd",             shortname: "BAJFINANCE" },
  { symbol: "ADANIENT.NS",   longname: "Adani Enterprises Ltd",         shortname: "ADANIENT"   },
  { symbol: "MARUTI.NS",     longname: "Maruti Suzuki India Ltd",       shortname: "MARUTI"     },
  { symbol: "TATAMOTORS.NS", longname: "Tata Motors Ltd",               shortname: "TATAMOTORS" },
  { symbol: "TATASTEEL.NS",  longname: "Tata Steel Ltd",                shortname: "TATASTEEL"  },
  { symbol: "HCLTECH.NS",    longname: "HCL Technologies Ltd",          shortname: "HCLTECH"    },
  { symbol: "SUNPHARMA.NS",  longname: "Sun Pharmaceutical Industries", shortname: "SUNPHARMA"  },
  { symbol: "AXISBANK.NS",   longname: "Axis Bank Ltd",                 shortname: "AXISBANK"   },
  { symbol: "KOTAKBANK.NS",  longname: "Kotak Mahindra Bank Ltd",       shortname: "KOTAKBANK"  },
  { symbol: "LTIM.NS",       longname: "LTIMindtree Ltd",               shortname: "LTIM"       },
  { symbol: "BAJAJFINSV.NS", longname: "Bajaj Finserv Ltd",             shortname: "BAJAJFINSV" },
  { symbol: "TITAN.NS",      longname: "Titan Company Ltd",             shortname: "TITAN"      },
  { symbol: "NESTLEIND.NS",  longname: "Nestle India Ltd",              shortname: "NESTLEIND"  },
  { symbol: "ULTRACEMCO.NS", longname: "UltraTech Cement Ltd",          shortname: "ULTRACEMCO" },
  { symbol: "ASIANPAINT.NS", longname: "Asian Paints Ltd",              shortname: "ASIANPAINT" },
  { symbol: "POWERGRID.NS",  longname: "Power Grid Corporation",        shortname: "POWERGRID"  },
  { symbol: "NTPC.NS",       longname: "NTPC Ltd",                      shortname: "NTPC"       },
  { symbol: "ONGC.NS",       longname: "Oil & Natural Gas Corporation", shortname: "ONGC"       },
  { symbol: "COALINDIA.NS",  longname: "Coal India Ltd",                shortname: "COALINDIA"  },
  { symbol: "HINDUNILVR.NS", longname: "Hindustan Unilever Ltd",        shortname: "HINDUNILVR" },
  { symbol: "ITC.NS",        longname: "ITC Ltd",                       shortname: "ITC"        },
  { symbol: "JSWSTEEL.NS",   longname: "JSW Steel Ltd",                 shortname: "JSWSTEEL"   },
  { symbol: "DRREDDY.NS",    longname: "Dr Reddy's Laboratories Ltd",   shortname: "DRREDDY"    },
  { symbol: "DIVISLAB.NS",   longname: "Divi's Laboratories Ltd",       shortname: "DIVISLAB"   },
  { symbol: "CIPLA.NS",      longname: "Cipla Ltd",                     shortname: "CIPLA"      },
  { symbol: "EICHERMOT.NS",  longname: "Eicher Motors Ltd",             shortname: "EICHERMOT"  },
  { symbol: "HEROMOTOCO.NS", longname: "Hero MotoCorp Ltd",             shortname: "HEROMOTOCO" },
  { symbol: "TECHM.NS",      longname: "Tech Mahindra Ltd",             shortname: "TECHM"      },
  { symbol: "BRITANNIA.NS",  longname: "Britannia Industries Ltd",      shortname: "BRITANNIA"  },
  { symbol: "TATACONSUM.NS", longname: "Tata Consumer Products Ltd",    shortname: "TATACONSUM" },
  { symbol: "GRASIM.NS",     longname: "Grasim Industries Ltd",         shortname: "GRASIM"     },
  { symbol: "BPCL.NS",       longname: "Bharat Petroleum Corporation",  shortname: "BPCL"       },
  { symbol: "IOC.NS",        longname: "Indian Oil Corporation Ltd",    shortname: "IOC"        },
];

export async function searchStocksAction(query: string) {
  if (!query.trim()) return [];
  const q = query.toLowerCase();

  // Try Yahoo Finance search first
  try {
    const results = await searchStocks(query);
    if (results.length) return results.slice(0, 8);
  } catch { /* fall through to static list */ }

  // Fallback: static NSE list
  return NSE_STOCKS.filter(
    (s) =>
      s.symbol.toLowerCase().includes(q) ||
      s.longname.toLowerCase().includes(q) ||
      s.shortname.toLowerCase().includes(q)
  ).slice(0, 8);
}

// ─── Refresh — live re-fetch only (does not touch DB) ───────────────────────
export async function refreshStockResearch(rawSymbol: string) {
  return getStockResearch(rawSymbol);
}

// ─── Main fetch: live data only — never auto-saves to DB ────────────────────
export async function getStockResearch(rawSymbol: string) {
  const symbol = toNSE(rawSymbol.trim().toUpperCase());

  try {
    return await fetchFromYahoo(symbol);
  } catch (yahooErr) {
    console.warn("Yahoo Finance failed, falling back to AI:", (yahooErr as Error).message);
  }

  const clean = symbol.replace(/\.(NS|BO)$/i, "");
  const aiData = await generateStockDataWithAI(clean);

  return JSON.parse(JSON.stringify({
    symbol,
    exchange:    "NS",
    name:        aiData.name,
    sector:      aiData.sector,
    industry:    aiData.industry,
    lastFetched: new Date().toISOString(),
    overview:    { ...aiData.overview, dataSource: "ai", dataNote: aiData.dataNote },
    technical:   aiData.technical,
    fundamental: aiData.fundamental,
    historical:  aiData.historical,
    aiInsights:  aiData.aiInsights,
    saved:       false,
  }));
}

export type SaveResearchResult =
  | { ok: true; path: string; id: string }
  | { ok: false; reason: "duplicate"; path: string; message: string }
  | { ok: false; reason: "error"; message: string };

/** Check if company already has a save for today */
export async function getTodayResearchPath(name: string, symbol: string) {
  await connectDB();
  const companyKey = toCompanyKey(name, symbol);
  const researchDateKey = formatResearchDateKey();
  const existing = await StockResearch.findOne({ companyKey, researchDateKey })
    .select("path companyKey researchDateKey")
    .lean();
  if (!existing) return null;
  return {
    path: existing.path,
    companyKey: existing.companyKey,
    researchDateKey: existing.researchDateKey,
  };
}

/** Explicit save — one entry per companyKey + date */
export async function saveStockResearch(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any,
): Promise<SaveResearchResult> {
  try {
    await connectDB();
    // Migrate away from legacy unique {symbol, exchange} index if present
    try {
      await StockResearch.collection.dropIndex("symbol_1_exchange_1");
    } catch { /* index may not exist */ }
    try {
      await StockResearch.syncIndexes();
    } catch { /* indexes may already match */ }

    const symbol = toNSE(String(data.symbol ?? data.overview?.symbol ?? ""));
    if (!symbol || symbol === ".NS") {
      return { ok: false, reason: "error", message: "Missing stock symbol — cannot save research." };
    }
    const name = String(data.name ?? data.overview?.name ?? symbol);
    const companyKey = toCompanyKey(name, symbol);
    const researchDateKey = formatResearchDateKey();
    const path = `${companyKey}/${researchDateKey}`;

    const existing = await StockResearch.findOne({ companyKey, researchDateKey }).lean();
    if (existing) {
      return {
        ok: false,
        reason: "duplicate",
        path: existing.path ?? path,
        message: `Research for ${companyKey} on ${researchDateKey} already exists (${existing.path ?? path}).`,
      };
    }

    const historicalRaw = Array.isArray(data.historical) ? data.historical : [];
    const historical = historicalRaw.map((h: {
      date: string | Date; open?: number; high?: number; low?: number; close: number; volume?: number;
    }) => ({
      date:   new Date(h.date),
      open:   h.open ?? h.close,
      high:   h.high ?? h.close,
      low:    h.low ?? h.close,
      close:  h.close,
      volume: h.volume ?? 0,
    }));

    const doc = await StockResearch.create({
      companyKey,
      researchDateKey,
      researchDate: startOfLocalDay(),
      path,
      symbol,
      exchange:    "NS",
      name,
      sector:      String(data.sector ?? data.overview?.sector ?? ""),
      industry:    String(data.industry ?? data.overview?.industry ?? ""),
      lastFetched: new Date(),
      overview:    data.overview ?? {},
      technical:   data.technical ?? {},
      fundamental: data.fundamental ?? {},
      historical,
      aiInsights:  data.aiInsights ?? [],
    });

    return { ok: true, path, id: String(doc._id) };
  } catch (err) {
    // Race: unique index violation
    if (err && typeof err === "object" && "code" in err && (err as { code: number }).code === 11000) {
      const symbol = toNSE(String(data.symbol ?? data.overview?.symbol ?? ""));
      const name = String(data.name ?? data.overview?.name ?? symbol);
      const companyKey = toCompanyKey(name, symbol);
      const researchDateKey = formatResearchDateKey();
      const path = `${companyKey}/${researchDateKey}`;
      return {
        ok: false,
        reason: "duplicate",
        path,
        message: `Research for ${companyKey} on ${researchDateKey} already exists (${path}).`,
      };
    }
    console.error("saveStockResearch failed:", err);
    return {
      ok: false,
      reason: "error",
      message: err instanceof Error ? err.message : "Failed to save research",
    };
  }
}

// ─── Yahoo Finance full data fetch ──────────────────────────────────────────
async function fetchFromYahoo(symbol: string) {
  const [quoteRaw, summaryRaw, histRaw] = await Promise.all([
    fetchQuote(symbol),
    fetchSummary(symbol).catch(() => null),
    fetchHistorical(symbol, 5).catch(() => []),
  ]);

  const q: Record<string, unknown>   = quoteRaw   ?? {};
  const sum: Record<string, unknown> = summaryRaw ?? {};

  // Map historical to OHLCV
  const historical: OHLCV[] = (histRaw ?? []).map(
    (h: { date: Date; open: number; high: number; low: number; close: number; volume: number }) => ({
      date:   h.date,
      open:   h.open   ?? h.close,
      high:   h.high   ?? h.close,
      low:    h.low    ?? h.close,
      close:  h.close,
      volume: h.volume ?? 0,
    })
  );

  // ── Calculate technical indicators ──────────────────────────────────────
  const rsi  = calcRSI(historical);
  const macd = calcMACD(historical);
  const sma20 = calcSMA(historical, 20);
  const sma50 = calcSMA(historical, 50);
  const sma100 = calcSMA(historical, 100);
  const sma200 = calcSMA(historical, 200);
  const ema9   = calcEMA(historical, 9);
  const ema21  = calcEMA(historical, 21);
  const ema50  = calcEMA(historical, 50);
  const ema200 = calcEMA(historical, 200);
  const bb     = calcBollinger(historical);
  const adxVal = calcADX(historical);
  const atr    = calcATR(historical);
  const vwap   = calcVWAP(historical);
  const fib    = calcFibonacci(historical);
  const srLegacy = calcSupportResistance(historical);
  const levels = calcMultiLevelSR(historical);
  const chartPatterns = detectChartPatterns(historical);
  const trendLabel = classifyTrend(historical, chartPatterns);
  const volumeProfile = calcVolumeProfile(historical);
  const frequencyStats = calcFrequencyAnalysis(historical);
  const recentCross = recentCrosses(historical, 30);
  const obv    = calcOBV(historical);
  const stoch  = calcStoch(historical);
  const cci    = calcCCI(historical);

  const price = Number(q.regularMarketPrice ?? historical[historical.length - 1]?.close ?? 0);

  let crossSignal = "None";
  if (sma50 && sma200) {
    crossSignal = sma50 > sma200 ? "Golden Cross" : "Death Cross";
  }

  const rsiSignal = rsi == null ? "Neutral" : rsi > 70 ? "Overbought" : rsi < 30 ? "Oversold" : "Neutral";
  const macdSignal = macd ? (macd.MACD != null && macd.signal != null && macd.MACD > macd.signal ? "Bullish" : "Bearish") : "Neutral";
  const bbSignal   = bb && price ? (price > bb.upper ? "Above Upper Band" : price < bb.lower ? "Below Lower Band" : "Mid") : "Mid";

  const signalStats  = calcSignalStats(historical);
  const patternStats = chartPatterns.map((p) => ({
    pattern: p.pattern,
    occurrences: 1,
    successfulBreakouts: 0,
    failedBreakouts: 0,
    successPercent: p.historicalSuccessRate ?? 0,
    avgReturn: 0,
    avgDuration: 0,
    confidence: p.confidence,
    breakoutDirection: p.breakoutDirection,
    detectionDate: p.detectionDate,
    historicalSuccessRate: p.historicalSuccessRate,
  }));

  // ── Fundamental data ────────────────────────────────────────────────────
  const fund = calcFundamentals(sum);

  // ── Build overview ───────────────────────────────────────────────────────
  const ap  = (sum as Record<string, unknown>)?.assetProfile as Record<string, unknown> ?? {};
  const sd  = (sum as Record<string, unknown>)?.summaryDetail as Record<string, unknown> ?? {};
  const ks  = (sum as Record<string, unknown>)?.defaultKeyStatistics as Record<string, unknown> ?? {};
  const pr  = (sum as Record<string, unknown>)?.price as Record<string, unknown> ?? {};

  const overview = {
    dataSource:     "live",
    name:           q.longName ?? q.shortName ?? symbol,
    symbol,
    exchange:       q.exchange ?? "NSE",
    sector:         q.sector ?? ap.sector ?? "",
    industry:       q.industry ?? ap.industry ?? "",
    description:    ap.longBusinessSummary ?? "",
    currentPrice:   q.regularMarketPrice ?? null,
    previousClose:  q.regularMarketPreviousClose ?? null,
    open:           q.regularMarketOpen ?? null,
    dayHigh:        q.regularMarketDayHigh ?? null,
    dayLow:         q.regularMarketDayLow ?? null,
    weekHigh52:     q.fiftyTwoWeekHigh ?? null,
    weekLow52:      q.fiftyTwoWeekLow ?? null,
    allTimeHigh:    null,
    marketCap:      q.marketCap ?? pr.marketCap ?? null,
    volume:         q.regularMarketVolume ?? volumeProfile.todayVolume ?? null,
    avgVolume:      q.averageDailyVolume3Month ?? volumeProfile.avg20 ?? null,
    beta:           q.beta ?? ks.beta ?? null,
    peRatio:        q.trailingPE ?? sd.trailingPE ?? null,
    eps:            q.epsTrailingTwelveMonths ?? null,
    dividendYield:  q.dividendYield ?? sd.dividendYield ?? null,
    faceValue:      null,
    employees:      ap.fullTimeEmployees ?? null,
    website:        ap.website ?? "",
    priceChange:    q.regularMarketChange ?? null,
    priceChangePct: q.regularMarketChangePercent != null
      ? Number(q.regularMarketChangePercent) / 100
      : null,
  };

  // Fundamental formatted
  const fundamental = {
    ...fund,
    institutionalHolding: ks.heldPercentInstitutions ?? null,
    promoterHolding:      null,
    publicHolding:        null,
  };

  // Historical for storage
  const historicalForDb = historical.map((h) => ({
    date: h.date, open: h.open, high: h.high, low: h.low, close: h.close, volume: h.volume,
  }));

  // Historical for chart (simple date/close/volume)
  const historicalForChart = historical.map((h) => ({
    date:   h.date instanceof Date ? h.date.toISOString().split("T")[0] : String(h.date),
    close:  h.close,
    volume: h.volume,
  }));

  const technical = {
    dataSource:  "live",
    trend: trendLabel,
    crossSignal,
    rsi, rsiSignal, macdSignal, bbSignal,
    chartPatterns,
    currentPrice: price,
    sma:  { sma20, sma50, sma100, sma200 },
    ema:  { ema9, ema21, ema50, ema200 },
    macd, bollingerBands: bb, adx: adxVal,
    atr, vwap, stochastic: stoch, cci, obv,
    fibonacci: fib,
    supportResistance: {
      support: levels.supports[0]?.price ?? srLegacy.support,
      resistance: levels.resistances[0]?.price ?? srLegacy.resistance,
      supports: levels.supports,
      resistances: levels.resistances,
    },
    levels,
    volumeProfile,
    frequencyStats,
    recentCrosses: recentCross,
    signalStats,
    patternStats,
  };

  const doc = {
    symbol,
    exchange:    "NS" as const,
    name:        String(overview.name),
    sector:      String(overview.sector),
    industry:    String(overview.industry),
    lastFetched: new Date(),
    overview,
    technical,
    fundamental,
    historical:  historicalForDb,
    aiInsights:  [] as Array<{ text: string; model: string; generatedAt: Date }>,
    saved:       false,
  };

  // Live view only — persist happens via saveStockResearch()
  return JSON.parse(JSON.stringify({ ...doc, historical: historicalForChart }));
}

// ─── Generate AI insight from in-memory research payload ────────────────────
export async function generateAIInsights(
  symbol: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  snapshot?: any,
) {
  let name = symbol;
  let insightData: Record<string, unknown>;

  if (snapshot) {
    name = String(snapshot.name ?? snapshot.overview?.name ?? symbol);
    insightData = {
      overview:   { name, symbol: snapshot.symbol ?? symbol, sector: snapshot.sector ?? snapshot.overview?.sector },
      technical: {
        trend:      snapshot.technical?.trend,
        rsi:        snapshot.technical?.rsi,
        macdSignal: snapshot.technical?.macdSignal,
      },
      fundamental: snapshot.fundamental,
    };
  } else {
    await connectDB();
    const doc = await StockResearch.findOne({ symbol }).sort({ researchDate: -1 }).lean();
    if (!doc) throw new Error("Stock data not found. Load or save the stock page first.");
    name = doc.name ?? symbol;
    insightData = {
      overview:   { name: doc.name, symbol: doc.symbol, sector: doc.sector },
      technical: {
        trend:      (doc.technical as Record<string, unknown>)?.trend,
        rsi:        (doc.technical as Record<string, unknown>)?.rsi,
        macdSignal: (doc.technical as Record<string, unknown>)?.macdSignal,
      },
      fundamental: doc.fundamental,
    };
  }

  return generateInsights(name, symbol, insightData);
}

// ─── Comparison ─────────────────────────────────────────────────────────────
export async function getComparisonData(symbols: string[]) {
  await connectDB();
  const results = await Promise.all(
    symbols.map((s) => getStockResearch(s).catch(() => null))
  );
  return results.filter(Boolean);
}

// ─── Universe helpers for scanners ──────────────────────────────────────────
const SCAN_UNIVERSE = [
  "RELIANCE", "TCS", "INFY", "HDFCBANK", "ICICIBANK", "SBIN", "WIPRO",
  "BAJFINANCE", "ADANIENT", "MARUTI", "TATAMOTORS", "TATASTEEL", "HCLTECH",
  "SUNPHARMA", "AXISBANK", "KOTAKBANK", "LTIM", "BAJAJFINSV", "TITAN",
  "NESTLEIND", "ULTRACEMCO", "ASIANPAINT", "POWERGRID", "NTPC", "ONGC",
  "COALINDIA", "HINDUNILVR", "ITC", "JSWSTEEL", "DRREDDY", "DIVISLAB",
  "CIPLA", "EICHERMOT", "HEROMOTOCO", "TECHM", "BRITANNIA", "TATACONSUM",
  "GRASIM", "BPCL", "IOC",
];

async function loadUniverse(limit = 40) {
  await connectDB();
  const symbols = SCAN_UNIVERSE.slice(0, limit);
  // Latest saved research per symbol (explicit saves only)
  const cached = await StockResearch.find({
    symbol: { $in: symbols.map((s) => `${s}.NS`) },
  })
    .sort({ researchDate: -1 })
    .lean();

  const bySym = new Map<string, (typeof cached)[number]>();
  for (const d of cached) {
    if (!bySym.has(d.symbol)) bySym.set(d.symbol, d);
  }

  const missing = symbols.filter((s) => !bySym.has(`${s}.NS`));
  // Live warm for scanners when nothing saved yet (does not persist)
  const warmed = await Promise.all(
    missing.slice(0, 8).map((s) => getStockResearch(s).catch(() => null))
  );
  for (const w of warmed) {
    if (w?.symbol) bySym.set(w.symbol, w);
  }

  return Array.from(bySym.values()).map((d) => JSON.parse(JSON.stringify(d)));
}

function techOf(d: Record<string, unknown>) {
  return (d.technical ?? {}) as Record<string, unknown>;
}
function ovOf(d: Record<string, unknown>) {
  return (d.overview ?? {}) as Record<string, unknown>;
}

/** Trend / chart-pattern filter */
export async function scanByTrend(trend: string) {
  const docs = await loadUniverse();
  return docs
    .filter((d) => {
      const t = techOf(d);
      const label = String(t.trend ?? "");
      const patterns = (t.chartPatterns as Array<{ pattern: string }> | undefined) ?? [];
      if (label === trend) return true;
      return patterns.some((p) => p.pattern === trend);
    })
    .map((d) => ({
      symbol: d.symbol,
      name: d.name,
      trend: techOf(d).trend,
      pattern: ((techOf(d).chartPatterns as Array<{ pattern: string }>) ?? [])[0]?.pattern ?? "—",
      price: ovOf(d).currentPrice,
      changePct: ovOf(d).priceChangePct,
      volume: ovOf(d).volume,
      rsi: techOf(d).rsi,
    }));
}

/** SMA / EMA crossover scanner */
export async function scanByCross(opts: {
  crossType: CrossType | "any";
  lookbackDays: number;
}) {
  const docs = await loadUniverse();
  const results: Array<{
    symbol: string;
    name: string;
    crossType: string;
    crossDate: string;
    price: number | null;
    pctSinceCross: number | null;
    trend: string;
    volume: number | null;
  }> = [];

  for (const d of docs) {
    const histRaw = (d.historical ?? []) as OHLCV[];
    if (histRaw.length < 210) {
      const stored = (techOf(d).recentCrosses as Array<{
        type: string; date: string; direction: string; index: number; priceAtCross: number;
      }>) ?? [];
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - opts.lookbackDays);
      for (const c of stored) {
        if (opts.crossType !== "any" && c.type !== opts.crossType) continue;
        if (new Date(c.date) < cutoffDate) continue;
        const price = Number(ovOf(d).currentPrice ?? c.priceAtCross);
        const pct = c.priceAtCross
          ? parseFloat((((price - c.priceAtCross) / c.priceAtCross) * 100).toFixed(2))
          : null;
        results.push({
          symbol: String(d.symbol),
          name: String(d.name),
          crossType: c.type,
          crossDate: c.date,
          price: ovOf(d).currentPrice as number | null,
          pctSinceCross: pct,
          trend: String(techOf(d).trend ?? "—"),
          volume: ovOf(d).volume as number | null,
        });
      }
      continue;
    }

    const hist = histRaw.map((h) => ({
      ...h,
      date: h.date instanceof Date ? h.date : new Date(h.date),
    }));
    const crosses = recentCrosses(hist, opts.lookbackDays);
    for (const c of crosses) {
      if (opts.crossType !== "any" && c.type !== opts.crossType) continue;
      results.push({
        symbol: String(d.symbol),
        name: String(d.name),
        crossType: c.type,
        crossDate: c.date,
        price: ovOf(d).currentPrice as number | null,
        pctSinceCross: pctChangeSince(hist, c.index),
        trend: String(techOf(d).trend ?? "—"),
        volume: ovOf(d).volume as number | null,
      });
    }
  }

  return results.sort((a, b) => b.crossDate.localeCompare(a.crossDate));
}

/** Volume scanner */
export async function scanByVolume(opts: {
  filter: VolumeFilter;
  avgPeriod: 20 | 50 | 75 | 100;
}) {
  const docs = await loadUniverse();
  return docs
    .map((d) => {
      const vp = (techOf(d).volumeProfile as ReturnType<typeof calcVolumeProfile> | undefined)
        ?? calcVolumeProfile((d.historical as OHLCV[]) ?? []);
      return { d, vp };
    })
    .filter(({ vp }) => matchesVolumeFilter(vp, opts.filter, opts.avgPeriod))
    .map(({ d, vp }) => {
      const avg = opts.avgPeriod === 20 ? vp.avg20
        : opts.avgPeriod === 50 ? vp.avg50
        : opts.avgPeriod === 75 ? vp.avg75
        : vp.avg100;
      return {
        symbol: String(d.symbol),
        name: String(d.name),
        todayVolume: vp.todayVolume,
        averageVolume: avg,
        volumeRatio: avg ? parseFloat((vp.todayVolume / avg).toFixed(2)) : null,
        increasePct: avg ? parseFloat((((vp.todayVolume - avg) / avg) * 100).toFixed(1)) : null,
        trend: String(techOf(d).trend ?? "—"),
        pattern: ((techOf(d).chartPatterns as Array<{ pattern: string }>) ?? [])[0]?.pattern ?? "—",
        price: ovOf(d).currentPrice as number | null,
      };
    })
    .sort((a, b) => (b.volumeRatio ?? 0) - (a.volumeRatio ?? 0));
}
