"use server";

import { connectDB } from "@/lib/db/connect";
import StockResearch from "@/lib/db/models/StockResearch";
import { generateStockDataWithAI } from "@/lib/market/ai-research";
import { generateInsights } from "@/lib/market/ai";

const CACHE_TTL_MS = 12 * 60 * 60 * 1000; // 12 hour cache for AI data

function isStale(lastFetched: Date | null) {
  if (!lastFetched) return true;
  return Date.now() - new Date(lastFetched).getTime() > CACHE_TTL_MS;
}

export async function searchStocksAction(query: string) {
  if (!query.trim()) return [];
  // Use static NSE popular stocks list + AI for search
  const NSE_STOCKS = [
    { symbol: "RELIANCE.NS",   longname: "Reliance Industries Ltd",       shortname: "RELIANCE"  },
    { symbol: "TCS.NS",        longname: "Tata Consultancy Services Ltd", shortname: "TCS"       },
    { symbol: "INFY.NS",       longname: "Infosys Ltd",                   shortname: "INFY"      },
    { symbol: "HDFCBANK.NS",   longname: "HDFC Bank Ltd",                 shortname: "HDFCBANK"  },
    { symbol: "ICICIBANK.NS",  longname: "ICICI Bank Ltd",                shortname: "ICICIBANK" },
    { symbol: "SBIN.NS",       longname: "State Bank of India",           shortname: "SBIN"      },
    { symbol: "WIPRO.NS",      longname: "Wipro Ltd",                     shortname: "WIPRO"     },
    { symbol: "BAJFINANCE.NS", longname: "Bajaj Finance Ltd",             shortname: "BAJFINANCE"},
    { symbol: "ADANIENT.NS",   longname: "Adani Enterprises Ltd",         shortname: "ADANIENT"  },
    { symbol: "MARUTI.NS",     longname: "Maruti Suzuki India Ltd",       shortname: "MARUTI"    },
    { symbol: "TATAMOTORS.NS", longname: "Tata Motors Ltd",               shortname: "TATAMOTORS"},
    { symbol: "TATASTEEL.NS",  longname: "Tata Steel Ltd",                shortname: "TATASTEEL" },
    { symbol: "HCLTECH.NS",    longname: "HCL Technologies Ltd",          shortname: "HCLTECH"   },
    { symbol: "SUNPHARMA.NS",  longname: "Sun Pharmaceutical Industries", shortname: "SUNPHARMA" },
    { symbol: "AXISBANK.NS",   longname: "Axis Bank Ltd",                 shortname: "AXISBANK"  },
    { symbol: "KOTAKBANK.NS",  longname: "Kotak Mahindra Bank Ltd",       shortname: "KOTAKBANK" },
    { symbol: "LTIM.NS",       longname: "LTIMindtree Ltd",               shortname: "LTIM"      },
    { symbol: "BAJAJFINSV.NS", longname: "Bajaj Finserv Ltd",             shortname: "BAJAJFINSV"},
    { symbol: "TITAN.NS",      longname: "Titan Company Ltd",             shortname: "TITAN"     },
    { symbol: "NESTLEIND.NS",  longname: "Nestle India Ltd",              shortname: "NESTLEIND" },
    { symbol: "ULTRACEMCO.NS", longname: "UltraTech Cement Ltd",          shortname: "ULTRACEMCO"},
    { symbol: "ASIANPAINT.NS", longname: "Asian Paints Ltd",              shortname: "ASIANPAINT"},
    { symbol: "POWERGRID.NS",  longname: "Power Grid Corporation",        shortname: "POWERGRID" },
    { symbol: "NTPC.NS",       longname: "NTPC Ltd",                      shortname: "NTPC"      },
    { symbol: "ONGC.NS",       longname: "Oil & Natural Gas Corporation", shortname: "ONGC"      },
    { symbol: "COALINDIA.NS",  longname: "Coal India Ltd",                shortname: "COALINDIA" },
    { symbol: "HINDUNILVR.NS", longname: "Hindustan Unilever Ltd",        shortname: "HINDUNILVR"},
    { symbol: "ITC.NS",        longname: "ITC Ltd",                       shortname: "ITC"       },
    { symbol: "JSWSTEEL.NS",   longname: "JSW Steel Ltd",                 shortname: "JSWSTEEL"  },
    { symbol: "DRREDDY.NS",    longname: "Dr Reddy's Laboratories Ltd",   shortname: "DRREDDY"   },
    { symbol: "DIVISLAB.NS",   longname: "Divi's Laboratories Ltd",       shortname: "DIVISLAB"  },
    { symbol: "CIPLA.NS",      longname: "Cipla Ltd",                     shortname: "CIPLA"     },
    { symbol: "EICHERMOT.NS",  longname: "Eicher Motors Ltd",             shortname: "EICHERMOT" },
    { symbol: "HEROMOTOCO.NS", longname: "Hero MotoCorp Ltd",             shortname: "HEROMOTOCO"},
    { symbol: "TECHM.NS",      longname: "Tech Mahindra Ltd",             shortname: "TECHM"     },
    { symbol: "BRITANNIA.NS",  longname: "Britannia Industries Ltd",      shortname: "BRITANNIA" },
    { symbol: "TATACONSUM.NS", longname: "Tata Consumer Products Ltd",    shortname: "TATACONSUM"},
    { symbol: "GRASIM.NS",     longname: "Grasim Industries Ltd",         shortname: "GRASIM"    },
    { symbol: "BPCL.NS",       longname: "Bharat Petroleum Corporation",  shortname: "BPCL"      },
    { symbol: "IOC.NS",        longname: "Indian Oil Corporation Ltd",    shortname: "IOC"       },
  ];

  const q = query.toLowerCase();
  return NSE_STOCKS.filter(
    (s) =>
      s.symbol.toLowerCase().includes(q) ||
      s.longname.toLowerCase().includes(q) ||
      s.shortname.toLowerCase().includes(q)
  ).slice(0, 8);
}

export async function getStockResearch(rawSymbol: string) {
  const cleanSymbol = rawSymbol.trim().toUpperCase().replace(/\.(NS|BO)$/i, "");
  const symbol = `${cleanSymbol}.NS`;

  await connectDB();

  // Check cache first
  const cached = await StockResearch.findOne({ symbol }).lean();
  if (cached && !isStale(cached.lastFetched as Date | null)) {
    return JSON.parse(JSON.stringify(cached));
  }

  // Generate with AI
  const aiData = await generateStockDataWithAI(cleanSymbol);

  // Store in MongoDB
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
      date:   new Date(h.date),
      open:   h.close,
      high:   h.close * 1.01,
      low:    h.close * 0.99,
      close:  h.close,
      volume: h.volume,
    })),
    aiInsights: aiData.aiInsights,
  };

  await StockResearch.findOneAndUpdate(
    { symbol },
    doc,
    { upsert: true, new: true }
  );

  return JSON.parse(JSON.stringify({
    ...doc,
    historical: aiData.historical,
  }));
}

export async function generateAIInsights(symbol: string) {
  await connectDB();
  const doc = await StockResearch.findOne({ symbol }).lean();
  if (!doc) throw new Error("Stock data not found. Fetch it first.");

  const insightData = {
    overview:    doc.overview,
    technical:   {
      trend:       (doc.technical as Record<string, unknown>)?.trend,
      rsi:         (doc.technical as Record<string, unknown>)?.rsi,
      macd:        (doc.technical as Record<string, unknown>)?.macd,
      macdSignal:  (doc.technical as Record<string, unknown>)?.macdSignal,
    },
    fundamental: doc.fundamental,
  };

  const text = await generateInsights(
    (doc.overview as Record<string, unknown>)?.name as string ?? symbol,
    symbol,
    insightData
  );

  await StockResearch.findOneAndUpdate(
    { symbol },
    { $push: { aiInsights: { text, model: process.env.OPENROUTER_MODEL ?? "ai", generatedAt: new Date() } } }
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
