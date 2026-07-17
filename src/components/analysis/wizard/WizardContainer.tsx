"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAnalysisWizard } from "@/hooks/useAnalysisWizard";
import { useAutoSave, loadDraftFromStorage, clearDraftStorage } from "@/hooks/useAutoSave";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { createAnalysis, updateAnalysis } from "@/actions/analysis";
import { AnalysisFormData } from "@/types/analysis";
import { Step1StockDetails } from "./Step1StockDetails";
import { Step2PriceInfo } from "./Step2PriceInfo";
import { Step3TechnicalPattern } from "./Step3TechnicalPattern";
import { Step4Indicators } from "./Step4Indicators";
import { Step5TradeRecommendation } from "./Step5TradeRecommendation";
import { Step6AnalysisReason } from "./Step6AnalysisReason";
import { WizardProgress } from "./WizardProgress";
import { Save } from "lucide-react";

const STEPS = [
  { title: "Stock Details",  description: "Basic stock information" },
  { title: "Price Info",     description: "Current and historical prices" },
  { title: "Pattern",        description: "Chart pattern analysis" },
  { title: "Indicators",     description: "Technical indicators by timeframe" },
  { title: "Trade Setup",    description: "Entry, targets & stop loss" },
  { title: "Reasoning",      description: "Written analysis notes" },
];

const slideVariants = {
  enter: (d: number) => ({ x: d > 0 ? 40 : -40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:  (d: number) => ({ x: d < 0 ? 40 : -40, opacity: 0 }),
};

interface WizardContainerProps {
  initialData?: Partial<AnalysisFormData>;
  initialId?: string;
}

export function WizardContainer({ initialData, initialId }: WizardContainerProps = {}) {
  const router = useRouter();
  const wizard = useAnalysisWizard(initialData, initialId);

  const { manualSave } = useAutoSave({
    formData: wizard.formData,
    analysisId: wizard.analysisId,
    onSaved: wizard.setAnalysisId,
  });

  useEffect(() => {
    const draft = loadDraftFromStorage();
    if (draft?.formData) {
      toast("Draft restored", {
        description: "Your previous draft has been loaded.",
        action: { label: "Discard", onClick: () => { clearDraftStorage(); wizard.reset(); } },
      });
      wizard.updateData(draft.formData);
      if (draft.analysisId) wizard.setAnalysisId(draft.analysisId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useKeyboardShortcuts([{ key: "s", ctrlKey: true, handler: manualSave, description: "Save draft" }]);

  function handleStepData(data: Partial<AnalysisFormData>) {
    wizard.updateData(data);
    if (wizard.currentStep < 5) {
      wizard.nextStep();
    } else {
      handleSubmitFinal(data);
    }
  }

  async function handleSubmitFinal(lastStepData?: Partial<AnalysisFormData>) {
    const finalData = lastStepData ? { ...wizard.formData, ...lastStepData } : wizard.formData;
    wizard.setSaving(true);
    try {
      let id: string;
      if (wizard.analysisId) {
        await updateAnalysis(wizard.analysisId, finalData, "draft");
        id = wizard.analysisId;
      } else {
        const result = await createAnalysis(finalData, "draft");
        id = result.id;
        wizard.setAnalysisId(id);
      }
      clearDraftStorage();
      router.push(initialId ? `/analysis/${id}` : `/analysis/${id}/preview`);
    } catch {
      toast.error("Failed to save analysis. Please try again.");
    } finally {
      wizard.setSaving(false);
    }
  }

  const props = { data: wizard.formData, onBack: wizard.prevStep };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 md:mb-8">
        <div>
          <span className="text-muted-foreground font-mono text-[10px] uppercase tracking-widest block mb-1">
            Step {wizard.currentStep + 1} / {STEPS.length}
          </span>
          <h1 className="font-display text-foreground text-2xl font-bold tracking-tight">New Analysis</h1>
        </div>
        <button
          type="button"
          onClick={manualSave}
          className="h-9 px-4 flex items-center gap-2 text-muted-foreground hover:text-[#F0B429] bg-accent border border-border hover:border-[#F0B429]/30 rounded-lg font-mono text-xs transition-colors"
        >
          <Save className="w-3.5 h-3.5" />
          Save Draft
        </button>
      </div>

      {/* Progress */}
      <WizardProgress
        steps={STEPS.map((s) => s.title)}
        currentStep={wizard.currentStep}
        onStepClick={wizard.goToStep}
      />

      {/* Step card */}
      <div className="bg-card border border-border rounded-xl overflow-hidden mt-6">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 className="font-display text-foreground text-base font-semibold">{STEPS[wizard.currentStep].title}</h2>
            <p className="text-muted-foreground font-mono text-[10px] mt-0.5 uppercase tracking-widest">
              {STEPS[wizard.currentStep].description}
            </p>
          </div>
          <span className="text-[#2a2622] font-mono text-xs">{String(wizard.currentStep + 1).padStart(2, "0")}</span>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait" custom={1}>
            <motion.div
              key={wizard.currentStep}
              custom={1}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              {wizard.currentStep === 0 && <Step1StockDetails {...props} onNext={handleStepData} />}
              {wizard.currentStep === 1 && <Step2PriceInfo {...props} onNext={handleStepData} />}
              {wizard.currentStep === 2 && <Step3TechnicalPattern {...props} onNext={handleStepData} />}
              {wizard.currentStep === 3 && <Step4Indicators {...props} onNext={handleStepData} />}
              {wizard.currentStep === 4 && <Step5TradeRecommendation {...props} onNext={handleStepData} />}
              {wizard.currentStep === 5 && (
                <Step6AnalysisReason {...props} onNext={handleStepData} isSubmitting={wizard.isSaving} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
