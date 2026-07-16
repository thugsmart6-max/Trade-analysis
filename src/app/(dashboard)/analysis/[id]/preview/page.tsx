import { notFound } from "next/navigation";
import { getAnalysisById } from "@/actions/analysis";
import { PrintableReport } from "@/components/analysis/preview/PrintableReport";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const analysis = await getAnalysisById(id);
  if (!analysis) return { title: "Not Found" };
  return {
    title: `Preview: ${analysis.companyName} (${analysis.nseSymbol}) — TradeAnalysis`,
  };
}

export default async function PreviewPage({ params }: Props) {
  const { id } = await params;
  const analysis = await getAnalysisById(id);
  if (!analysis) notFound();

  return (
    <div className="min-h-full bg-slate-50 dark:bg-slate-950">
      <PrintableReport analysis={analysis} />
    </div>
  );
}
