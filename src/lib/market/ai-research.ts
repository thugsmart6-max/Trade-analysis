import OpenAI from "openai";

// Lazy-initialize so the constructor is never called at module-evaluation time
// (Vercel build collects page data without runtime env vars set)
function getClient() {
  return new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey:  process.env.OPENROUTER_API_KEY ?? "placeholder",
  });
}

const MODEL = process.env.OPENROUTER_MODEL ?? "google/gemini-2.5-flash";

export interface AIStockData {
  name:     string;
  symbol:   string;
  sector:   string;
  industry: string;
  dataSource: "ai";
  dataNote:  string;
  overview: {
    name: string;
    symbol: string;
    exchange: string;
    sector: string;
    industry: string;
    description: string;
    currentPrice: number | null;
    previousClose: number | null;
    weekHigh52: number | null;
    weekLow52: number | null;
    allTimeHigh: number | null;
    marketCap: number | null;
    volume: number | null;
    avgVolume: number | null;
    beta: number | null;
    peRatio: number | null;
    eps: number | null;
    dividendYield: number | null;
    faceValue: number | null;
    employees: number | null;
    website: string;
    priceChange: number | null;
    priceChangePct: number | null;
    dayHigh: number | null;
    dayLow: number | null;
    open: number | null;
  };
  fundamental: {
    eps: number | null;
    peRatio: number | null;
    pbRatio: number | null;
    pegRatio: number | null;
    marketCap: number | null;
    enterpriseValue: number | null;
    evEbitda: number | null;
    grossMargin: number | null;
    operatingMargin: number | null;
    netMargin: number | null;
    roe: number | null;
    roce: number | null;
    debtToEquity: number | null;
    currentRatio: number | null;
    quickRatio: number | null;
    interestCoverage: number | null;
    dividendYield: number | null;
    dividendPayout: number | null;
    revenueGrowth: number | null;
    earningsGrowth: number | null;
    freeCashFlow: number | null;
    workingCapital: number | null;
    assetTurnover: number | null;
    beta: number | null;
    institutionalHolding: number | null;
    promoterHolding: number | null;
    publicHolding: number | null;
    _raw: {
      revenue: number | null;
      grossProfit: number | null;
      operatingIncome: number | null;
      netIncome: number | null;
      ebit: number | null;
      totalAssets: number | null;
      totalEquity: number | null;
      totalDebt: number | null;
      currentAssets: number | null;
      currentLiab: number | null;
      operatingCashflow: number | null;
      capex: number | null;
      ebitda: number | null;
      sharesOutstanding: number | null;
    };
  };
  technical: {
    trend: string;
    crossSignal: string;
    rsi: number | null;
    rsiSignal: string;
    macdSignal: string;
    bbSignal: string;
    candlePatterns: string[];
    currentPrice: number | null;
    sma: { sma20: number | null; sma50: number | null; sma100: number | null; sma200: number | null };
    ema: { ema9: number | null; ema21: number | null; ema50: number | null; ema200: number | null };
    macd: { MACD: number | null; signal: number | null; histogram: number | null } | null;
    bollingerBands: { upper: number | null; middle: number | null; lower: number | null } | null;
    adx: { adx: number | null; pdi: number | null; mdi: number | null } | null;
    atr: number | null;
    vwap: number | null;
    stochastic: { k: number | null; d: number | null } | null;
    cci: number | null;
    obv: number | null;
    fibonacci: { level_0: number; level_236: number; level_382: number; level_5: number; level_618: number; level_786: number; level_1: number } | null;
    supportResistance: { support: number | null; resistance: number | null };
    signalStats: unknown;
    patternStats: unknown[];
  };
  historical: Array<{ date: string; close: number; volume: number }>;
  aiInsights: Array<{ text: string; model: string; generatedAt: string }>;
}

export async function generateStockDataWithAI(symbol: string): Promise<AIStockData> {
  const cleanSymbol = symbol.replace(/\.(NS|BO)$/i, "").toUpperCase();

  const prompt = `You are a financial data API for Indian NSE-listed stocks. Generate comprehensive, factual financial data for the stock: ${cleanSymbol} (NSE India).

IMPORTANT RULES:
- Return ONLY valid JSON, no markdown, no explanation
- Use your best knowledge of this stock's financials (use approximate/estimated values from your training data)
- For prices, use approximate values - clearly noted as estimated
- Never use words Buy/Sell/Hold/Recommend in any text field
- All margin/ratio fields are decimal (e.g., 0.15 for 15%)
- Revenue/profit figures in INR crores converted to absolute INR (multiply crores by 10,000,000)
- If stock is unknown, still generate plausible data for an Indian mid-cap company

Return this exact JSON structure:
{
  "name": "Full Company Name",
  "sector": "Sector Name",
  "industry": "Industry Name",
  "overview": {
    "description": "Brief factual company description (2-3 sentences, no recommendations)",
    "currentPrice": <estimated price in INR>,
    "previousClose": <estimated>,
    "weekHigh52": <estimated>,
    "weekLow52": <estimated>,
    "allTimeHigh": <estimated>,
    "marketCap": <in INR absolute>,
    "volume": <estimated daily volume>,
    "avgVolume": <estimated avg volume>,
    "beta": <0.5-2.0>,
    "peRatio": <estimated>,
    "eps": <estimated in INR>,
    "dividendYield": <decimal, e.g. 0.015>,
    "faceValue": <usually 1, 2, or 10>,
    "employees": <approximate>,
    "website": "https://www.companywebsite.com",
    "exchange": "NSE",
    "priceChange": <estimated daily change>,
    "priceChangePct": <decimal>,
    "dayHigh": <estimated>,
    "dayLow": <estimated>,
    "open": <estimated>
  },
  "fundamental": {
    "eps": <INR>,
    "peRatio": <number>,
    "pbRatio": <number>,
    "pegRatio": <number>,
    "grossMargin": <decimal>,
    "operatingMargin": <decimal>,
    "netMargin": <decimal>,
    "roe": <decimal>,
    "roce": <decimal>,
    "debtToEquity": <number>,
    "currentRatio": <number>,
    "quickRatio": <number>,
    "interestCoverage": <number>,
    "dividendYield": <decimal>,
    "dividendPayout": <decimal>,
    "revenueGrowth": <decimal>,
    "earningsGrowth": <decimal>,
    "freeCashFlow": <INR absolute>,
    "workingCapital": <INR absolute>,
    "assetTurnover": <number>,
    "beta": <number>,
    "institutionalHolding": <decimal, e.g. 0.45>,
    "promoterHolding": <decimal>,
    "publicHolding": <decimal>,
    "enterpriseValue": <INR absolute>,
    "evEbitda": <number>,
    "marketCap": <INR absolute>,
    "_raw": {
      "revenue": <INR absolute>,
      "grossProfit": <INR absolute>,
      "operatingIncome": <INR absolute>,
      "netIncome": <INR absolute>,
      "ebit": <INR absolute>,
      "totalAssets": <INR absolute>,
      "totalEquity": <INR absolute>,
      "totalDebt": <INR absolute>,
      "currentAssets": <INR absolute>,
      "currentLiab": <INR absolute>,
      "operatingCashflow": <INR absolute>,
      "capex": <INR absolute>,
      "ebitda": <INR absolute>,
      "sharesOutstanding": <number>
    }
  },
  "technical": {
    "trend": "Uptrend or Downtrend or Sideways",
    "crossSignal": "Golden Cross or Death Cross or None",
    "rsi": <14-period RSI estimate 0-100>,
    "rsiSignal": "Overbought or Oversold or Neutral",
    "macdSignal": "Bullish or Bearish",
    "bbSignal": "Above Upper Band or Below Lower Band or Mid",
    "candlePatterns": ["pattern1"] or [],
    "currentPrice": <same as overview.currentPrice>,
    "sma": { "sma20": <price>, "sma50": <price>, "sma100": <price>, "sma200": <price> },
    "ema": { "ema9": <price>, "ema21": <price>, "ema50": <price>, "ema200": <price> },
    "macd": { "MACD": <number>, "signal": <number>, "histogram": <number> },
    "bollingerBands": { "upper": <price>, "middle": <price>, "lower": <price> },
    "adx": { "adx": <0-100>, "pdi": <0-100>, "mdi": <0-100> },
    "atr": <price>,
    "vwap": <price>,
    "stochastic": { "k": <0-100>, "d": <0-100> },
    "cci": <number>,
    "obv": <large number>,
    "fibonacci": {
      "level_0": <weekHigh52>,
      "level_236": <calculated>,
      "level_382": <calculated>,
      "level_5": <midpoint>,
      "level_618": <calculated>,
      "level_786": <calculated>,
      "level_1": <weekLow52>
    },
    "supportResistance": { "support": <price>, "resistance": <price> },
    "signalStats": null,
    "patternStats": []
  },
  "aiInsight": "Factual, neutral 200-word research note. Mention key metrics, historical context, and sector position. Never use Buy/Sell/Hold/Recommend/Avoid.",
  "historical": []
}`;

  const response = await getClient().chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: "system",
        content: "You are a financial data API. Always respond with pure JSON only — no markdown, no code fences, no explanation. Start your response directly with '{' and end with '}'.",
      },
      { role: "user", content: prompt },
    ],
    max_tokens: 3000,
    temperature: 0.2,
  });

  const rawContent = response.choices[0]?.message?.content ?? "{}";
  // Strip markdown code fences if the model added them despite instructions
  const raw = rawContent
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  const parsed = JSON.parse(raw);

  const price = parsed.overview?.currentPrice ?? 100;
  const high  = parsed.overview?.weekHigh52 ?? price * 1.3;
  const low   = parsed.overview?.weekLow52  ?? price * 0.7;

  // Generate synthetic 1-year historical data around the current price
  const historical = generateSyntheticHistory(price, high, low, 365);

  const insight = parsed.aiInsight ?? "";

  return {
    name:       parsed.name     ?? cleanSymbol,
    symbol:     `${cleanSymbol}.NS`,
    sector:     parsed.sector   ?? "Unknown",
    industry:   parsed.industry ?? "Unknown",
    dataSource: "ai",
    dataNote:   `AI-estimated data based on training knowledge. Prices and ratios are approximate. Not real-time market data. Generated by ${MODEL}.`,
    overview: {
      name:           parsed.name         ?? cleanSymbol,
      symbol:         `${cleanSymbol}.NS`,
      exchange:       "NSE",
      sector:         parsed.sector       ?? "",
      industry:       parsed.industry     ?? "",
      description:    parsed.overview?.description ?? "",
      currentPrice:   parsed.overview?.currentPrice    ?? null,
      previousClose:  parsed.overview?.previousClose   ?? null,
      weekHigh52:     parsed.overview?.weekHigh52      ?? null,
      weekLow52:      parsed.overview?.weekLow52       ?? null,
      allTimeHigh:    parsed.overview?.allTimeHigh     ?? null,
      marketCap:      parsed.overview?.marketCap       ?? null,
      volume:         parsed.overview?.volume          ?? null,
      avgVolume:      parsed.overview?.avgVolume       ?? null,
      beta:           parsed.overview?.beta            ?? null,
      peRatio:        parsed.overview?.peRatio         ?? null,
      eps:            parsed.overview?.eps             ?? null,
      dividendYield:  parsed.overview?.dividendYield   ?? null,
      faceValue:      parsed.overview?.faceValue       ?? null,
      employees:      parsed.overview?.employees       ?? null,
      website:        parsed.overview?.website         ?? "",
      priceChange:    parsed.overview?.priceChange     ?? null,
      priceChangePct: parsed.overview?.priceChangePct  ?? null,
      dayHigh:        parsed.overview?.dayHigh         ?? null,
      dayLow:         parsed.overview?.dayLow          ?? null,
      open:           parsed.overview?.open            ?? null,
    },
    fundamental: {
      eps:                  parsed.fundamental?.eps                  ?? null,
      peRatio:              parsed.fundamental?.peRatio              ?? null,
      pbRatio:              parsed.fundamental?.pbRatio              ?? null,
      pegRatio:             parsed.fundamental?.pegRatio             ?? null,
      marketCap:            parsed.fundamental?.marketCap            ?? null,
      enterpriseValue:      parsed.fundamental?.enterpriseValue      ?? null,
      evEbitda:             parsed.fundamental?.evEbitda             ?? null,
      grossMargin:          parsed.fundamental?.grossMargin          ?? null,
      operatingMargin:      parsed.fundamental?.operatingMargin      ?? null,
      netMargin:            parsed.fundamental?.netMargin            ?? null,
      roe:                  parsed.fundamental?.roe                  ?? null,
      roce:                 parsed.fundamental?.roce                 ?? null,
      debtToEquity:         parsed.fundamental?.debtToEquity         ?? null,
      currentRatio:         parsed.fundamental?.currentRatio         ?? null,
      quickRatio:           parsed.fundamental?.quickRatio           ?? null,
      interestCoverage:     parsed.fundamental?.interestCoverage     ?? null,
      dividendYield:        parsed.fundamental?.dividendYield        ?? null,
      dividendPayout:       parsed.fundamental?.dividendPayout       ?? null,
      revenueGrowth:        parsed.fundamental?.revenueGrowth        ?? null,
      earningsGrowth:       parsed.fundamental?.earningsGrowth       ?? null,
      freeCashFlow:         parsed.fundamental?.freeCashFlow         ?? null,
      workingCapital:       parsed.fundamental?.workingCapital       ?? null,
      assetTurnover:        parsed.fundamental?.assetTurnover        ?? null,
      beta:                 parsed.fundamental?.beta                 ?? null,
      institutionalHolding: parsed.fundamental?.institutionalHolding ?? null,
      promoterHolding:      parsed.fundamental?.promoterHolding      ?? null,
      publicHolding:        parsed.fundamental?.publicHolding        ?? null,
      _raw:                 parsed.fundamental?._raw                 ?? {
        revenue: null, grossProfit: null, operatingIncome: null,
        netIncome: null, ebit: null, totalAssets: null, totalEquity: null,
        totalDebt: null, currentAssets: null, currentLiab: null,
        operatingCashflow: null, capex: null, ebitda: null, sharesOutstanding: null,
      },
    },
    technical: {
      trend:             parsed.technical?.trend            ?? "Sideways",
      crossSignal:       parsed.technical?.crossSignal      ?? "None",
      rsi:               parsed.technical?.rsi              ?? null,
      rsiSignal:         parsed.technical?.rsiSignal        ?? "Neutral",
      macdSignal:        parsed.technical?.macdSignal       ?? "Neutral",
      bbSignal:          parsed.technical?.bbSignal         ?? "Mid",
      candlePatterns:    parsed.technical?.candlePatterns   ?? [],
      currentPrice:      parsed.technical?.currentPrice     ?? null,
      sma:               parsed.technical?.sma              ?? { sma20: null, sma50: null, sma100: null, sma200: null },
      ema:               parsed.technical?.ema              ?? { ema9: null, ema21: null, ema50: null, ema200: null },
      macd:              parsed.technical?.macd             ?? null,
      bollingerBands:    parsed.technical?.bollingerBands   ?? null,
      adx:               parsed.technical?.adx              ?? null,
      atr:               parsed.technical?.atr              ?? null,
      vwap:              parsed.technical?.vwap             ?? null,
      stochastic:        parsed.technical?.stochastic       ?? null,
      cci:               parsed.technical?.cci              ?? null,
      obv:               parsed.technical?.obv              ?? null,
      fibonacci:         parsed.technical?.fibonacci        ?? null,
      supportResistance: parsed.technical?.supportResistance ?? { support: null, resistance: null },
      signalStats:       null,
      patternStats:      [],
    },
    historical,
    aiInsights: insight ? [{ text: insight, model: MODEL, generatedAt: new Date().toISOString() }] : [],
  };
}

function generateSyntheticHistory(
  currentPrice: number,
  high52: number,
  low52: number,
  days: number,
): Array<{ date: string; close: number; volume: number }> {
  const result = [];
  const today  = new Date();
  let price    = low52 + (high52 - low52) * 0.4; // start near low
  const target = currentPrice;
  const dailyDrift = (target - price) / days;
  const volatility = (high52 - low52) * 0.015;

  for (let i = days; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    if (date.getDay() === 0 || date.getDay() === 6) continue; // skip weekends
    const noise = (Math.random() - 0.48) * volatility;
    price = Math.max(low52 * 0.9, Math.min(high52 * 1.1, price + dailyDrift + noise));
    result.push({
      date:   date.toISOString().split("T")[0],
      close:  parseFloat(price.toFixed(2)),
      volume: Math.floor(500000 + Math.random() * 2000000),
    });
  }
  return result;
}
