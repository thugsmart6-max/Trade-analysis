// eslint-disable-next-line @typescript-eslint/no-explicit-any
import yahooFinance from "yahoo-finance2";


export function toNSE(raw: string) {
  const s = raw.trim().toUpperCase();
  if (s.endsWith(".NS") || s.endsWith(".BO")) return s;
  return `${s}.NS`;
}

export async function fetchQuote(symbol: string) {
  return yahooFinance.quote(symbol);
}

export async function fetchSummary(symbol: string) {
  return yahooFinance.quoteSummary(symbol, {
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
  return yahooFinance.historical(symbol, {
    period1: period1.toISOString().split("T")[0],
    interval: "1d",
  });
}

export async function searchStocks(query: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: any = await yahooFinance.search(query, { newsCount: 0 });
  return ((result.quotes ?? []) as { symbol: string; shortname?: string; longname?: string }[]).filter(
    (q) => q.symbol && (q.symbol.endsWith(".NS") || q.symbol.endsWith(".BO"))
  );
}
