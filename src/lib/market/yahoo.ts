// eslint-disable-next-line @typescript-eslint/no-explicit-any
import YahooFinanceClass from "yahoo-finance2";

// v4 changed to class-based: default export is the constructor
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const yf: any = new (YahooFinanceClass as any)({ suppressNotices: ["yahooSurvey"] });

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
  return yf.quoteSummary(symbol, {
    modules: [
      "assetProfile",
      "price",
      "summaryDetail",
      "defaultKeyStatistics",
      "financialData",
      "incomeStatementHistory",
      "balanceSheetHistory",
      "cashflowStatementHistory",
      "earningsTrend",
    ],
  });
}

export async function fetchHistorical(symbol: string, years = 5) {
  const period1 = new Date();
  period1.setFullYear(period1.getFullYear() - years);
  return yf.historical(symbol, {
    period1: period1.toISOString().split("T")[0],
    interval: "1d",
  }) as Promise<Array<{ date: Date; open: number; high: number; low: number; close: number; volume: number }>>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function searchStocks(query: string): Promise<any[]> {
  const result = await yf.search(query, { newsCount: 0 });
  return ((result?.quotes ?? []) as { symbol: string; shortname?: string; longname?: string }[]).filter(
    (q) => q.symbol && (q.symbol.endsWith(".NS") || q.symbol.endsWith(".BO"))
  );
}
