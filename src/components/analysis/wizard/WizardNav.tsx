"use client";

import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

interface WizardNavProps {
  showBack?: boolean;
  onBack?: () => void;
  isLastStep?: boolean;
  isSubmitting?: boolean;
  nextLabel?: string;
}

export function WizardNav({
  showBack = true,
  onBack,
  isLastStep = false,
  isSubmitting = false,
  nextLabel,
}: WizardNavProps) {
  return (
    <div className="flex items-center justify-between pt-4 border-t border-border">
      {showBack ? (
        <button
          type="button"
          onClick={onBack}
          className="h-9 px-4 flex items-center gap-1.5 text-muted-foreground hover:text-muted-foreground bg-accent border border-border rounded-lg font-mono text-xs transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Back
        </button>
      ) : (
        <div />
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="h-9 px-6 flex items-center gap-2 bg-[#F0B429] hover:bg-[#d4a025] text-[#080808] font-bold text-sm rounded-lg transition-colors disabled:opacity-50 min-w-32 justify-center"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            {nextLabel ?? (isLastStep ? "Preview" : "Next")}
            {!isLastStep && <ChevronRight className="w-3.5 h-3.5" />}
          </>
        )}
      </button>
    </div>
  );
}
