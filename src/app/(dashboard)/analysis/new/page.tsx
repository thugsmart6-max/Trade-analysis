import { WizardContainer } from "@/components/analysis/wizard/WizardContainer";

export const metadata = { title: "New Analysis — TradeAnalysis" };

export default function NewAnalysisPage() {
  return (
    <div className="p-4 md:p-6 min-h-full">
      <WizardContainer />
    </div>
  );
}
