export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { getStockResearch } from "@/actions/research";
import { ResearchTerminal } from "@/components/research/ResearchTerminal";

interface Props {
  params: Promise<{ symbol: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { symbol } = await params;
  return { title: `${symbol.toUpperCase()} Research — TradeAnalysis` };
}

export default async function StockResearchPage({ params }: Props) {
  const { symbol } = await params;

  let data;
  try {
    data = await getStockResearch(symbol);
  } catch (err) {
    console.error("Research fetch error:", err);
    notFound();
  }

  return (
    <div className="p-4 md:p-6">
      <ResearchTerminal data={data} />
    </div>
  );
}
