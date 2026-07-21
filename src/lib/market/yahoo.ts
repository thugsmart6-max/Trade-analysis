// eslint-disable-next-line @typescript-eslint/no-explicit-any
import YahooFinanceClass from "yahoo-finance2";

// v4: default export is the constructor class, must instantiate
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const yf: any = new (YahooFinanceClass as any)({
  suppressNotices: ["yahooSurvey", "ripHistorical"],
});

export function toNSE(raw: string) {
  const s = raw.trim().toUpperCase();
  if (s.endsWith(".NS") || s.endsWith(".BO")) return s;
  return `${s}.NS`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function fetchQuote(symbol: string): Promise<any> {
  return yf.quote(symbol);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function fetchSummary(symbol: string): Promise<any> {
  // Note: financial statement modules (balanceSheetHistory, etc.) have sparse data
  // since Nov 2024 per Yahoo Finance changes, but are still the valid quoteSummary modules.
  // majorHoldersBreakdown gives institutional holding data.
  return yf.quoteSummary(symbol, {
    modules: [
      "assetProfile",
      "price",
      "summaryDetail",
      "defaultKeyStatistics",
      "financialData",
      "majorHoldersBreakdown",
      "earningsTrend",
    ],
  });
}

export async function fetchHistorical(
  symbol: string,
  years = 5,
): Promise<Array<{ date: Date; open: number; high: number; low: number; close: number; volume: number }>> {
  const period1 = new Date();
  period1.setFullYear(period1.getFullYear() - years);
  const period2 = new Date();
  // v4 maps historical→chart internally; must supply period2 to avoid validation error
  return yf.historical(symbol, {
    period1,
    period2,
    interval: "1d",
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function searchStocks(query: string): Promise<any[]> {
  const result = await yf.search(query, { newsCount: 0 });
  return ((result?.quotes ?? []) as { symbol: string; shortname?: string; longname?: string }[]).filter(
    (q) => q.symbol && (q.symbol.endsWith(".NS") || q.symbol.endsWith(".BO"))
  );
}
