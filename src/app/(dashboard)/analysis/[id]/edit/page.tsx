import { notFound } from "next/navigation";
import { getAnalysisById } from "@/actions/analysis";
import { WizardContainer } from "@/components/analysis/wizard/WizardContainer";
import { AnalysisFormData } from "@/types/analysis";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const analysis = await getAnalysisById(id);
  if (!analysis) return { title: "Not Found" };
  return { title: `Edit ${analysis.nseSymbol} — TradeAnalysis` };
}

export default async function EditAnalysisPage({ params }: Props) {
  const { id } = await params;
  const analysis = await getAnalysisById(id);
  if (!analysis) notFound();

  const initialData: Partial<AnalysisFormData> = {
    companyName:  analysis.companyName,
    nseSymbol:    analysis.nseSymbol,
    sector:       analysis.sector,
    analysisDate: analysis.analysisDate.split("T")[0],
    analysisTime: analysis.analysisTime,
    priceInfo:    analysis.priceInfo as AnalysisFormData["priceInfo"],
    technicalPattern: analysis.technicalPattern as AnalysisFormData["technicalPattern"],
    indicators:   (analysis.indicators ?? {}) as AnalysisFormData["indicators"],
    tradeRecommendation: analysis.tradeRecommendation as AnalysisFormData["tradeRecommendation"],
    analysisReason: analysis.analysisReason ?? "",
    status: analysis.status,
  };

  return (
    <div className="p-4 md:p-6">
      <WizardContainer initialData={initialData} initialId={id} />
    </div>
  );
}
