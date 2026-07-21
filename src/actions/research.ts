"use server";

import { connectDB }       from "@/lib/db/connect";
import StockResearch       from "@/lib/db/models/StockResearch";
import { toNSE, fetchQuote, fetchSummary, fetchHistorical, searchStocks } from "@/lib/market/yahoo";
import { calcRSI, calcMACD, calcSMA, calcEMA, calcBollinger, calcADX,
         calcATR, calcVWAP, calcFibonacci, calcSupportResistance,
         detectCandlePattern, calcOBV, calcStoch, calcCCI,
         calcSignalStats, calcPatternStats, OHLCV } from "@/lib/market/indicators";
import { calcFundamentals } from "@/lib/market/fundamentals";
import { generateInsights }  from "@/lib/market/ai";
import { generateStockDataWithAI } from "@/lib/market/ai-research";

const LIVE_TTL_MS = 15 * 60 * 1000;   // 15 min cache for live data
const AI_TTL_MS  = 12 * 60 * 60 * 1000; // 12 hour cache for AI fallback

function isStale(lastFetched: Date | null, ttl: number) {
  if (!lastFetched) return true;
  return Date.now() - new Date(lastFetched).getTime() > ttl;
}

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

// ─── Main fetch: real Yahoo Finance data ────────────────────────────────────
export async function getStockResearch(rawSymbol: string) {
  const symbol = toNSE(rawSymbol.trim().toUpperCase());
  await connectDB();

  // Return cache if still fresh
  const cached = await StockResearch.findOne({ symbol }).lean();
  const ttl = (cached?.overview as Record<string,unknown>)?.dataSource === "ai"
    ? AI_TTL_MS
    : LIVE_TTL_MS;
  if (cached && !isStale(cached.lastFetched as Date | null, ttl)) {
    return JSON.parse(JSON.stringify(cached));
  }

  // ── Try Yahoo Finance (real live data) ──────────────────────────────────
  try {
    return await fetchFromYahoo(symbol);
  } catch (yahooErr) {
    console.warn("Yahoo Finance failed, falling back to AI:", (yahooErr as Error).message);
  }

  // ── Fallback: AI-generated data ─────────────────────────────────────────
  const clean = symbol.replace(/\.(NS|BO)$/i, "");
  const aiData = await generateStockDataWithAI(clean);

  const doc = {
    symbol,
    exchange:    "NS" as const,
    name:        aiData.name,
    sector:      aiData.sector,
    industry:    aiData.industry,
    lastFetched: new Date(),
    overview:    { ...aiData.overview, dataSource: "ai", dataNote: aiData.dataNote },
    technical:   aiData.technical,
    fundamental: aiData.fundamental,
    historical:  aiData.historical.slice(-365).map((h) => ({
      date: new Date(h.date), open: h.close, high: h.close * 1.01,
      low: h.close * 0.99, close: h.close, volume: h.volume,
    })),
    aiInsights: aiData.aiInsights,
  };

  await StockResearch.findOneAndUpdate({ symbol }, doc, { upsert: true, returnDocument: "after" });
  return JSON.parse(JSON.stringify({ ...doc, historical: aiData.historical }));
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
  const sr     = calcSupportResistance(historical);
  const candles = detectCandlePattern(historical);
  const obv    = calcOBV(historical);
  const stoch  = calcStoch(historical);
  const cci    = calcCCI(historical);

  // trend detection
  const price = Number(q.regularMarketPrice ?? 0);
  let trend = "Sideways";
  if (sma50 && sma200) {
    if (price > sma50 && sma50 > sma200) trend = "Uptrend";
    else if (price < sma50 && sma50 < sma200) trend = "Downtrend";
  }

  // cross signal
  let crossSignal = "None";
  if (sma50 && sma200) {
    crossSignal = sma50 > sma200 ? "Golden Cross" : "Death Cross";
  }

  const rsiSignal = rsi == null ? "Neutral" : rsi > 70 ? "Overbought" : rsi < 30 ? "Oversold" : "Neutral";
  const macdSignal = macd ? (macd.MACD != null && macd.signal != null && macd.MACD > macd.signal ? "Bullish" : "Bearish") : "Neutral";
  const bbSignal   = bb && price ? (price > bb.upper ? "Above Upper Band" : price < bb.lower ? "Below Lower Band" : "Mid") : "Mid";

  const patternStats = calcPatternStats(historical);
  const signalStats  = calcSignalStats(historical);

  // ── Fundamental data ────────────────────────────────────────────────────
  const fund = calcFundamentals(sum);

  // ── Build overview ───────────────────────────────────────────────────────
  const ap  = (sum as Record<string, unknown>)?.assetProfile as Record<string, unknown> ?? {};
  const sd  = (sum as Record<string, unknown>)?.summaryDetail as Record<string, unknown> ?? {};
  const ks  = (sum as Record<string, unknown>)?.defaultKeyStatistics as Record<string, unknown> ?? {};
  const fd  = (sum as Record<string, unknown>)?.financialData as Record<string, unknown> ?? {};
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
    volume:         q.regularMarketVolume ?? null,
    avgVolume:      q.averageDailyVolume3Month ?? null,
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
    trend, crossSignal,
    rsi, rsiSignal, macdSignal, bbSignal,
    candlePatterns: candles,
    currentPrice: price,
    sma:  { sma20, sma50, sma100, sma200 },
    ema:  { ema9, ema21, ema50, ema200 },
    macd, bollingerBands: bb, adx: adxVal,
    atr, vwap, stochastic: stoch, cci, obv,
    fibonacci: fib,
    supportResistance: sr,
    signalStats, patternStats,
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
    aiInsights:  [],
  };

  await StockResearch.findOneAndUpdate({ symbol }, doc, { upsert: true, returnDocument: "after" });

  return JSON.parse(JSON.stringify({ ...doc, historical: historicalForChart }));
}

// ─── Generate AI insight for a fetched stock ────────────────────────────────
export async function generateAIInsights(symbol: string) {
  await connectDB();
  const doc = await StockResearch.findOne({ symbol }).lean();
  if (!doc) throw new Error("Stock data not found. Load the stock page first.");

  const insightData = {
    overview:   { name: doc.name, symbol: doc.symbol, sector: doc.sector },
    technical: {
      trend:      (doc.technical as Record<string, unknown>)?.trend,
      rsi:        (doc.technical as Record<string, unknown>)?.rsi,
      macdSignal: (doc.technical as Record<string, unknown>)?.macdSignal,
    },
    fundamental: doc.fundamental,
  };

  const text = await generateInsights(doc.name ?? symbol, symbol, insightData);

  await StockResearch.findOneAndUpdate(
    { symbol },
    { $push: { aiInsights: { text, model: process.env.OPENROUTER_MODEL ?? "ai", generatedAt: new Date() } } }
  );

  return text;
}

// ─── Comparison ─────────────────────────────────────────────────────────────
export async function getComparisonData(symbols: string[]) {
  await connectDB();
  const results = await Promise.all(
    symbols.map((s) => getStockResearch(s).catch(() => null))
  );
  return results.filter(Boolean);
}
