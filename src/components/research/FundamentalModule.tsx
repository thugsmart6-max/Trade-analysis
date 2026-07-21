"use client";

import { BarChartSimple } from "./charts/BarChartSimple";

function n(v: unknown, d = 2) { return v != null ? Number(v).toFixed(d) : "—"; }
function pct(v: unknown) { return v != null ? `${(Number(v) * 100).toFixed(2)}%` : "—"; }
function inr(v: unknown) {
  if (v == null) return "—";
  const num = Number(v);
  if (Math.abs(num) >= 1e7) return `₹${(num / 1e7).toFixed(2)} Cr`;
  return `₹${num.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
}

function Row({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <div>
        <span className="text-muted-foreground font-mono text-[10px] uppercase tracking-widest">{label}</span>
        {sub && <span className="text-muted-foreground/50 font-mono text-[9px] ml-1">({sub})</span>}
      </div>
      <span className="text-foreground font-mono text-xs font-bold">{value}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-background border border-border rounded-xl overflow-hidden">
      <div className="px-4 py-2.5 border-b border-border">
        <h3 className="text-foreground font-mono text-[10px] uppercase tracking-widest font-semibold">{title}</h3>
      </div>
      <div className="px-4 py-1">{children}</div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function FundamentalModule({ data }: { data: any }) {
  const f = data?.fundamental ?? {};
  const r = f._raw ?? {};

  const marginData = [
    { label: "Gross",     value: f.grossMargin    != null ? Number(f.grossMargin)    * 100 : 0, color: "#00D4AA" },
    { label: "Operating", value: f.operatingMargin != null ? Number(f.operatingMargin) * 100 : 0, color: "#F0B429" },
    { label: "Net",       value: f.netMargin      != null ? Number(f.netMargin)      * 100 : 0, color: "#FF8C42" },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Valuation */}
        <Section title="Valuation Ratios">
          <Row label="EPS (TTM)"         value={inr(f.eps)} />
          <Row label="PE Ratio"          value={n(f.peRatio)} sub="Price/Earnings" />
          <Row label="PB Ratio"          value={n(f.pbRatio)} sub="Price/Book" />
          <Row label="PEG Ratio"         value={n(f.pegRatio)} />
          <Row label="Enterprise Value"  value={inr(f.enterpriseValue)} />
          <Row label="EV / EBITDA"       value={n(f.evEbitda)} />
        </Section>

        {/* Profitability */}
        <Section title="Profitability">
          <Row label="Gross Margin"     value={pct(f.grossMargin)} />
          <Row label="Operating Margin" value={pct(f.operatingMargin)} />
          <Row label="Net Profit Margin" value={pct(f.netMargin)} />
          <Row label="ROE"              value={pct(f.roe)} sub="Return on Equity" />
          <Row label="ROCE"             value={pct(f.roce)} sub="Return on Cap. Employed" />
          <Row label="Asset Turnover"   value={n(f.assetTurnover)} />
        </Section>
      </div>

      {/* Margin chart */}
      <Section title="Profit Margins">
        <div className="py-3">
          <BarChartSimple data={marginData} height={140} unit="%" />
        </div>
      </Section>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Solvency */}
        <Section title="Solvency & Liquidity">
          <Row label="Debt / Equity"     value={n(f.debtToEquity)} />
          <Row label="Current Ratio"     value={n(f.currentRatio)} />
          <Row label="Quick Ratio"       value={n(f.quickRatio)} />
          <Row label="Interest Coverage" value={n(f.interestCoverage)} />
          <Row label="Working Capital"   value={inr(f.workingCapital)} />
          <Row label="Free Cash Flow"    value={inr(f.freeCashFlow)} />
        </Section>

        {/* Dividends & Growth */}
        <Section title="Dividends & Growth">
          <Row label="Dividend Yield"    value={pct(f.dividendYield)} />
          <Row label="Dividend Payout"   value={pct(f.dividendPayout)} />
          <Row label="Revenue Growth"    value={pct(f.revenueGrowth)} />
          <Row label="Earnings Growth"   value={pct(f.earningsGrowth)} />
          <Row label="Beta"              value={n(f.beta)} />
          <Row label="Inst. Holding"     value={pct(f.institutionalHolding)} />
        </Section>
      </div>

      {/* Raw Financials */}
      <Section title="Financial Statements (Latest Annual)">
        <Row label="Total Revenue"      value={inr(r.revenue)} />
        <Row label="Gross Profit"       value={inr(r.grossProfit)} />
        <Row label="Operating Income"   value={inr(r.operatingIncome)} />
        <Row label="Net Income"         value={inr(r.netIncome)} />
        <Row label="EBIT"               value={inr(r.ebit)} />
        <Row label="Total Assets"       value={inr(r.totalAssets)} />
        <Row label="Total Equity"       value={inr(r.totalEquity)} />
        <Row label="Total Debt"         value={inr(r.totalDebt)} />
        <Row label="Operating Cash Flow" value={inr(r.operatingCashflow)} />
        <Row label="Capital Expenditure" value={inr(r.capex)} />
      </Section>
    </div>
  );
}
