// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function calcFundamentals(summary: any) {
  const fd  = summary?.financialData      ?? {};
  const ks  = summary?.defaultKeyStatistics ?? {};
  const sd  = summary?.summaryDetail      ?? {};
  const is  = summary?.incomeStatementHistory?.incomeStatementHistory?.[0] ?? {};
  const bs  = summary?.balanceSheetHistory?.balanceSheetHistory?.[0]       ?? {};
  const cf  = summary?.cashflowStatementHistory?.cashflowStatementHistory?.[0] ?? {};

  // Helper for safe division
  const div = (a: number | null, b: number | null) =>
    a != null && b != null && b !== 0 ? parseFloat((a / b).toFixed(4)) : null;

  const n = (v: unknown) => (typeof v === "number" ? v : null);

  // --- Raw financials ---
  const revenue          = n(is.totalRevenue);
  const grossProfit      = n(is.grossProfit);
  const operatingIncome  = n(is.operatingIncome ?? fd.operatingCashflow);
  const netIncome        = n(is.netIncome);
  const ebit             = n(is.ebit);
  const interestExpense  = n(is.interestExpense);
  const totalAssets      = n(bs.totalAssets);
  const totalLiabilities = n(bs.totalLiab);
  const totalEquity      = n(bs.totalStockholderEquity);
  const currentAssets    = n(bs.totalCurrentAssets);
  const currentLiab      = n(bs.totalCurrentLiabilities);
  const inventory        = n(bs.inventory);
  const cashAndEquiv     = n(bs.cash);
  const totalDebt        = n(bs.longTermDebt);
  const operatingCashflow = n(cf.totalCashFromOperatingActivities);
  const capex            = n(cf.capitalExpenditures);
  const sharesOutstanding = n(ks.sharesOutstanding ?? sd.sharesOutstanding);
  const marketCap        = n(sd.marketCap ?? ks.marketCap);
  const bookValue        = n(ks.bookValue);
  const earningsPerShare = n(ks.trailingEps);
  const dividendsPerShare = n(sd.dividendRate);
  const dividendYield    = n(sd.dividendYield ?? ks.dividendYield);
  const beta             = n(sd.beta ?? ks.beta);
  const ebitda           = n(ks.ebitda);

  // --- Calculated ratios ---
  const eps             = earningsPerShare ?? div(netIncome, sharesOutstanding);
  const peRatio         = n(ks.trailingPE) ?? (n(fd.currentPrice) != null && eps ? div(n(fd.currentPrice), eps) : null);
  const pbRatio         = n(ks.priceToBook);
  const pegRatio        = n(ks.pegRatio);
  const roe             = div(netIncome, totalEquity);
  const roce            = ebit != null && (totalAssets ?? 0) - (currentLiab ?? 0) !== 0
    ? div(ebit, (totalAssets ?? 0) - (currentLiab ?? 0)) : null;
  const debtToEquity    = n(fd.debtToEquity) ?? div(totalDebt, totalEquity);
  const currentRatio    = n(fd.currentRatio) ?? div(currentAssets, currentLiab);
  const quickRatio      = n(fd.quickRatio) ??
    (currentAssets != null && inventory != null && currentLiab != null
      ? div(currentAssets - inventory, currentLiab) : null);
  const interestCoverage = div(ebit, interestExpense ? Math.abs(interestExpense) : null);
  const dividendPayout  = div(dividendsPerShare, eps);
  const grossMargin     = n(fd.grossMargins) ?? div(grossProfit, revenue);
  const operatingMargin = n(fd.operatingMargins) ?? div(operatingIncome, revenue);
  const netMargin       = n(fd.profitMargins) ?? div(netIncome, revenue);
  const assetTurnover   = div(revenue, totalAssets);
  const workingCapital  = currentAssets != null && currentLiab != null ? currentAssets - currentLiab : null;
  const freeCashFlow    = operatingCashflow != null && capex != null
    ? operatingCashflow - Math.abs(capex) : null;
  const evEbitda        = n(ks.enterpriseToEbitda);
  const enterpriseValue = n(ks.enterpriseValue);
  const revenueGrowth   = n(fd.revenueGrowth);
  const earningsGrowth  = n(fd.earningsGrowth);

  // Holding data (unavailable via Yahoo, return null)
  const promoterHolding     = null;
  const institutionalHolding = n(ks.heldPercentInstitutions);
  const publicHolding       = null;

  return {
    // Valuation
    eps, peRatio, pbRatio, pegRatio,
    marketCap, enterpriseValue, evEbitda,
    // Profitability
    grossMargin, operatingMargin, netMargin,
    roe, roce,
    // Solvency
    debtToEquity, currentRatio, quickRatio, interestCoverage,
    // Dividends
    dividendYield, dividendPayout,
    // Growth
    revenueGrowth, earningsGrowth,
    // Cash
    freeCashFlow, workingCapital,
    // Other
    assetTurnover, beta,
    // Holdings
    promoterHolding, institutionalHolding, publicHolding,
    // Raw for reference
    _raw: {
      revenue, grossProfit, operatingIncome, netIncome, ebit,
      totalAssets, totalEquity, totalDebt, currentAssets, currentLiab,
      operatingCashflow, capex, ebitda, sharesOutstanding,
    },
  };
}
