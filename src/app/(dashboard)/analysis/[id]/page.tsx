export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { getAnalysisById } from "@/actions/analysis";
import { AnalysisDetailView } from "@/components/analysis/detail/AnalysisDetailView";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const analysis = await getAnalysisById(id);
  if (!analysis) return { title: "Not Found — TradeAnalysis" };
  return { title: `${analysis.companyName} (${analysis.nseSymbol}) — TradeAnalysis` };
}

export default async function AnalysisDetailPage({ params }: Props) {
  const { id } = await params;
  const analysis = await getAnalysisById(id);
  if (!analysis) notFound();

  return (
    <div className="p-4 md:p-6">
      <AnalysisDetailView analysis={analysis} />
    </div>
  );
}
