export const dynamic = "force-dynamic";

import { ScannerHub } from "@/components/research/ScannerHub";

export const metadata = { title: "Scanners — TradeAnalysis" };

export default function ScannersPage() {
  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto w-full">
      <div className="mb-6">
        <span className="text-muted-foreground font-mono text-[10px] uppercase tracking-widest block mb-1">
          Market Scanners
        </span>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
          Trading Research Filters
        </h1>
        <p className="text-muted-foreground text-xs mt-1.5 max-w-2xl">
          Trend, SMA crossover, and volume scanners across the NSE research universe.
          Results are factual matches only — no investment recommendations.
        </p>
      </div>
      <ScannerHub />
    </div>
  );
}
