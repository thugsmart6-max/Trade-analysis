"use client";

import { useReducer, useCallback } from "react";
import { AnalysisFormData } from "@/types/analysis";

const EMPTY_INDICATORS = {
  sma20: "" as const,
  sma50: "" as const,
  sma100: "" as const,
  sma200: "" as const,
  ema20: "" as const,
  ema50: "" as const,
  rsi: "" as const,
};

export const DEFAULT_FORM_DATA: AnalysisFormData = {
  companyName: "",
  nseSymbol: "",
  sector: "",
  analysisDate: new Date().toISOString().split("T")[0],
  analysisTime: new Date().toTimeString().slice(0, 5),
  priceInfo: {
    currentPrice: "",
    prevOpen: "",
    prevClose: "",
    prevHigh: "",
    prevLow: "",
    allTimeHigh: "",
    yearHigh: "",
    yearLow: "",
  },
  technicalPattern: {
    trend: "bullish",
    patternType: "",
    confidenceLevel: "medium",
    notes: "",
  },
  indicators: {
    "5m": { ...EMPTY_INDICATORS },
    "30m": { ...EMPTY_INDICATORS },
    "1h": { ...EMPTY_INDICATORS },
    "1d": { ...EMPTY_INDICATORS },
  },
  tradeRecommendation: {
    buyZone: "",
    target1: "",
    target2: "",
    target3: "",
    stopLoss: "",
    riskRewardRatio: "",
  },
  analysisReason: "",
  status: "draft",
};

interface WizardState {
  currentStep: number;
  formData: AnalysisFormData;
  analysisId: string | null;
  isSaving: boolean;
  isPublishing: boolean;
}

type WizardAction =
  | { type: "NEXT_STEP" }
  | { type: "PREV_STEP" }
  | { type: "GO_TO_STEP"; step: number }
  | { type: "UPDATE_DATA"; payload: Partial<AnalysisFormData> }
  | { type: "SET_ANALYSIS_ID"; id: string }
  | { type: "SET_SAVING"; value: boolean }
  | { type: "SET_PUBLISHING"; value: boolean }
  | { type: "RESET" };

function reducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case "NEXT_STEP":
      return { ...state, currentStep: Math.min(state.currentStep + 1, 5) };
    case "PREV_STEP":
      return { ...state, currentStep: Math.max(state.currentStep - 1, 0) };
    case "GO_TO_STEP":
      return { ...state, currentStep: action.step };
    case "UPDATE_DATA":
      return {
        ...state,
        formData: { ...state.formData, ...action.payload },
      };
    case "SET_ANALYSIS_ID":
      return { ...state, analysisId: action.id };
    case "SET_SAVING":
      return { ...state, isSaving: action.value };
    case "SET_PUBLISHING":
      return { ...state, isPublishing: action.value };
    case "RESET":
      return {
        currentStep: 0,
        formData: DEFAULT_FORM_DATA,
        analysisId: null,
        isSaving: false,
        isPublishing: false,
      };
    default:
      return state;
  }
}

export function useAnalysisWizard(initialData?: Partial<AnalysisFormData>, initialId?: string) {
  const [state, dispatch] = useReducer(reducer, {
    currentStep: 0,
    formData: initialData ? { ...DEFAULT_FORM_DATA, ...initialData } : DEFAULT_FORM_DATA,
    analysisId: initialId || null,
    isSaving: false,
    isPublishing: false,
  });

  const nextStep = useCallback(() => dispatch({ type: "NEXT_STEP" }), []);
  const prevStep = useCallback(() => dispatch({ type: "PREV_STEP" }), []);
  const goToStep = useCallback(
    (step: number) => dispatch({ type: "GO_TO_STEP", step }),
    []
  );
  const updateData = useCallback(
    (payload: Partial<AnalysisFormData>) =>
      dispatch({ type: "UPDATE_DATA", payload }),
    []
  );
  const setAnalysisId = useCallback(
    (id: string) => dispatch({ type: "SET_ANALYSIS_ID", id }),
    []
  );
  const setSaving = useCallback(
    (value: boolean) => dispatch({ type: "SET_SAVING", value }),
    []
  );
  const setPublishing = useCallback(
    (value: boolean) => dispatch({ type: "SET_PUBLISHING", value }),
    []
  );
  const reset = useCallback(() => dispatch({ type: "RESET" }), []);

  return {
    ...state,
    nextStep,
    prevStep,
    goToStep,
    updateData,
    setAnalysisId,
    setSaving,
    setPublishing,
    reset,
  };
}
