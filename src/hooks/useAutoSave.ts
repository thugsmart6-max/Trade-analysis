"use client";

import { useEffect, useRef, useCallback } from "react";
import { AnalysisFormData } from "@/types/analysis";
import { createAnalysis, updateAnalysis } from "@/actions/analysis";
import { toast } from "sonner";

const STORAGE_KEY = "analysis-draft";
const AUTO_SAVE_INTERVAL = 30000; // 30 seconds

interface UseAutoSaveOptions {
  formData: AnalysisFormData;
  analysisId: string | null;
  onSaved: (id: string) => void;
  enabled?: boolean;
}

export function useAutoSave({
  formData,
  analysisId,
  onSaved,
  enabled = true,
}: UseAutoSaveOptions) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isSavingRef = useRef(false);

  // Persist to localStorage
  useEffect(() => {
    if (!enabled) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ formData, analysisId, savedAt: Date.now() })
      );
    } catch {
      // ignore storage errors
    }
  }, [formData, analysisId, enabled]);

  const saveDraft = useCallback(async () => {
    if (isSavingRef.current || !enabled) return;
    isSavingRef.current = true;
    try {
      if (analysisId) {
        await updateAnalysis(analysisId, formData, "draft");
      } else {
        // Only auto-save if we have minimum required data
        if (!formData.companyName || !formData.nseSymbol || !formData.sector) {
          return;
        }
        if (!formData.priceInfo.currentPrice || !formData.technicalPattern.patternType) {
          return;
        }
        if (!formData.tradeRecommendation.buyZone || !formData.tradeRecommendation.target1 || !formData.tradeRecommendation.stopLoss) {
          return;
        }
        const result = await createAnalysis(formData, "draft");
        onSaved(result.id);
      }
    } catch {
      // Silently fail auto-save
    } finally {
      isSavingRef.current = false;
    }
  }, [formData, analysisId, onSaved, enabled]);

  // Periodic server save
  useEffect(() => {
    if (!enabled) return;
    intervalRef.current = setInterval(saveDraft, AUTO_SAVE_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [saveDraft, enabled]);

  const manualSave = useCallback(async () => {
    if (isSavingRef.current) return;
    isSavingRef.current = true;
    const toastId = toast.loading("Saving draft...");
    try {
      if (analysisId) {
        await updateAnalysis(analysisId, formData, "draft");
        toast.success("Draft saved", { id: toastId });
      } else {
        if (!formData.companyName || !formData.nseSymbol || !formData.sector) {
          toast.error("Fill in stock details before saving", { id: toastId });
          return;
        }
        if (!formData.priceInfo.currentPrice) {
          toast.error("Fill in price information before saving", { id: toastId });
          return;
        }
        if (!formData.technicalPattern.patternType) {
          toast.error("Fill in technical pattern before saving", { id: toastId });
          return;
        }
        if (!formData.tradeRecommendation.buyZone || !formData.tradeRecommendation.target1 || !formData.tradeRecommendation.stopLoss) {
          toast.error("Fill in trade recommendation before saving", { id: toastId });
          return;
        }
        const result = await createAnalysis(formData, "draft");
        onSaved(result.id);
        toast.success("Draft saved", { id: toastId });
      }
    } catch {
      toast.error("Failed to save draft", { id: toastId });
    } finally {
      isSavingRef.current = false;
    }
  }, [formData, analysisId, onSaved]);

  return { manualSave };
}

export function loadDraftFromStorage(): {
  formData: AnalysisFormData;
  analysisId: string | null;
} | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const age = Date.now() - (parsed.savedAt || 0);
    // Discard drafts older than 24 hours
    if (age > 24 * 60 * 60 * 1000) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return { formData: parsed.formData, analysisId: parsed.analysisId };
  } catch {
    return null;
  }
}

export function clearDraftStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
