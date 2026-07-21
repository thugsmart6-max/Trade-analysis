"use server";

import { connectDB } from "@/lib/db/connect";
import StockResearch from "@/lib/db/models/StockResearch";
import { fetchQuote, fetchSummary, fetchHistorical, searchStocks, toNSE } from "@/lib/market/yahoo";
import { calcAllIndicators, calcSignalStats, calcPatternStats, type OHLCV } from "@/lib/market/indicators";
import { calcFundamentals } from "@/lib/market/fundamentals";
import { generateInsights } from "@/lib/market/ai";

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour cache

function isStale(lastFetched: Date | null) {
  if (!lastFetched) return true;
  return Date.now() - new Date(lastFetched).getTime() > CACHE_TTL_MS;
}

export async function searchStocksAction(query: string) {
  if (!query.trim()) return [];
  try {
    return await searchStocks(query);
  } catch {
    return [];
  }
}

export async function getStockResearch(rawSymbol: string) {
  const symbol = toNSE(rawSymbol);
  await connectDB();

  // Try cache first
  const cached = await StockResearch.findOne({ symbol }).lean();
  if (cached && !isStale(cached.lastFetched as Date | null)) {
    return JSON.parse(JSON.stringify(cached));
  }

  // Fetch fresh data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [quoteRaw, summary, historicalRaw] = await Promise.all([
    fetchQuote(symbol),
    fetchSummary(symbol).catch(() => null),
    fetchHistorical(symbol, 5).catch(() => []),
  ]);

  const historical: OHLCV[] = (historicalRaw ?? []).map((d: { date: Date; open?: number; high?: number; low?: number; close?: number; volume?: number }) => ({
    date:   d.date,
    open:   d.open   ?? 0,
    high:   d.high   ?? 0,
    low:    d.low    ?? 0,
    close:  d.close  ?? 0,
    volume: d.volume ?? 0,
  })).filter((d: OHLCV) => d.close > 0);

  const technical    = calcAllIndicators(historical);
  const signalStats  = calcSignalStats(historical);
  const patternStats = calcPatternStats(historical);
  const fundamental  = summary ? calcFundamentals(summary) : {};

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const quote: any = quoteRaw;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sum: any = summary;
  const profile = sum?.assetProfile  ?? {};
  const sd      = sum?.summaryDetail  ?? {};
  const ks      = sum?.defaultKeyStatistics ?? {};

  const overview = {
    name:            quote.longName ?? quote.shortName ?? symbol,
    symbol,
    exchange:        quote.fullExchangeName ?? "NSE",
    sector:          profile.sector ?? "",
    industry:        profile.industry ?? "",
    description:     profile.longBusinessSummary ?? "",
    currentPrice:    quote.regularMarketPrice,
    previousClose:   quote.regularMarketPreviousClose,
    open:            quote.regularMarketOpen,
    dayHigh:         quote.regularMarketDayHigh,
    dayLow:          quote.regularMarketDayLow,
    volume:          quote.regularMarketVolume,
    avgVolume:       quote.averageDailyVolume3Month,
    marketCap:       quote.marketCap,
    weekHigh52:      quote.fiftyTwoWeekHigh,
    weekLow52:       quote.fiftyTwoWeekLow,
    allTimeHigh:     (historical.length ? Math.max(...historical.map((d) => d.high)) : null),
    beta:            sd.beta ?? ks.beta,
    faceValue:       ks.bookValue,
    peRatio:         quote.trailingPE,
    eps:             quote.epsTrailingTwelveMonths,
    dividendYield:   sd.dividendYield,
    priceChange:     quote.regularMarketChange,
    priceChangePct:  quote.regularMarketChangePercent,
    employees:       profile.fullTimeEmployees,
    website:         profile.website,
  };

  // Store in MongoDB
  const data = {
    symbol,
    exchange: symbol.endsWith(".BO") ? "BO" : "NS",
    name:     overview.name,
    sector:   overview.sector,
    industry: overview.industry,
    lastFetched: new Date(),
    overview,
    technical:  { ...technical, signalStats, patternStats },
    fundamental,
    historical: historical.slice(-365), // Store last 1 year
  };

  await StockResearch.findOneAndUpdate(
    { symbol },
    data,
    { upsert: true, new: true }
  );

  return JSON.parse(JSON.stringify(data));
}

export async function generateAIInsights(symbol: string) {
  await connectDB();
  const doc = await StockResearch.findOne({ symbol }).lean();
  if (!doc) throw new Error("Stock data not found. Fetch it first.");

  const insightData = {
    overview:    doc.overview,
    technical:   { trend: (doc.technical as Record<string, unknown>)?.trend, rsi: (doc.technical as Record<string, unknown>)?.rsi, macd: (doc.technical as Record<string, unknown>)?.macd, signalSummary: (doc.technical as Record<string, unknown>)?.macdSignal },
    fundamental: doc.fundamental,
  };

  const text = await generateInsights(
    (doc.overview as Record<string, unknown>)?.name as string ?? symbol,
    symbol,
    insightData
  );

  await StockResearch.findOneAndUpdate(
    { symbol },
    { $push: { aiInsights: { text, model: process.env.OPENROUTER_MODEL ?? "gemini", generatedAt: new Date() } } }
  );

  return text;
}

export async function getComparisonData(symbols: string[]) {
  await connectDB();
  const results = await Promise.all(
    symbols.map((s) => getStockResearch(s).catch(() => null))
  );
  return results.filter(Boolean);
}
