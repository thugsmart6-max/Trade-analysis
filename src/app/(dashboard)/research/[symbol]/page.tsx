export const dynamic = "force-dynamic";

import Link from "next/link";
import { getStockResearch } from "@/actions/research";
import { ResearchTerminal } from "@/components/research/ResearchTerminal";
import { AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react";

interface Props {
  params: Promise<{ symbol: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { symbol } = await params;
  return { title: `${symbol.toUpperCase()} Research — TradeAnalysis` };
}

export default async function StockResearchPage({ params }: Props) {
  const { symbol } = await params;

  let data = null;
  let errorMsg = "";

  try {
    data = await getStockResearch(symbol);
  } catch (err) {
    console.error("Research fetch error:", err);
    errorMsg = err instanceof Error ? err.message : "Failed to generate stock data";
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8 text-destructive" />
        </div>
        <h2 className="text-xl font-display font-bold mb-2">Could not load {symbol.toUpperCase()}</h2>
        <p className="text-muted-foreground text-sm max-w-md mb-2">
          {errorMsg || "The AI could not generate data for this symbol. Please check your OpenRouter API key in environment variables."}
        </p>
        <p className="text-xs text-muted-foreground/60 mb-6">
          Make sure <code className="bg-muted px-1 rounded">OPENROUTER_API_KEY</code> is set in your environment.
        </p>
        <div className="flex gap-3">
          <Link
            href="/research"
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-accent transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Research
          </Link>
          <Link
            href={`/research/${symbol}`}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-foreground text-background hover:opacity-90 transition-opacity text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <ResearchTerminal data={data} />
    </div>
  );
}
