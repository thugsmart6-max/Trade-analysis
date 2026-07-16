import { z } from "zod";

export const step1Schema = z.object({
  companyName: z.string().optional().default(""),
  nseSymbol: z
    .string()
    .min(1, "NSE symbol is required")
    .max(20, "NSE symbol too long")
    .toUpperCase(),
  sector: z.string().min(1, "Please select a sector"),
  analysisDate: z.string().min(1, "Analysis date is required"),
  analysisTime: z.string().min(1, "Analysis time is required"),
});

export const step2Schema = z.object({
  priceInfo: z.object({
    currentPrice: z.coerce.number().positive("Current price must be positive"),
    prevOpen: z.coerce.number().positive().optional().or(z.literal("")),
    prevClose: z.coerce.number().positive().optional().or(z.literal("")),
    prevHigh: z.coerce.number().positive().optional().or(z.literal("")),
    prevLow: z.coerce.number().positive().optional().or(z.literal("")),
    allTimeHigh: z.coerce.number().positive().optional().or(z.literal("")),
    yearHigh: z.coerce.number().positive().optional().or(z.literal("")),
    yearLow: z.coerce.number().positive().optional().or(z.literal("")),
  }),
});

export const step3Schema = z.object({
  technicalPattern: z.object({
    trend: z.enum(["bullish", "bearish", "consolidation"]),
    patternType: z.string().min(1, "Please select a pattern type"),
    confidenceLevel: z.enum(["low", "medium", "high"]),
    notes: z.string().optional(),
  }),
});

const indicatorSetSchema = z.object({
  sma20: z.coerce.number().optional().or(z.literal("")),
  sma50: z.coerce.number().optional().or(z.literal("")),
  sma100: z.coerce.number().optional().or(z.literal("")),
  sma200: z.coerce.number().optional().or(z.literal("")),
  ema20: z.coerce.number().optional().or(z.literal("")),
  ema50: z.coerce.number().optional().or(z.literal("")),
  rsi: z.coerce.number().min(0).max(100).optional().or(z.literal("")),
});

export const step4Schema = z.object({
  indicators: z.object({
    "5m": indicatorSetSchema,
    "30m": indicatorSetSchema,
    "1h": indicatorSetSchema,
    "1d": indicatorSetSchema,
  }),
});

export const step5Schema = z.object({
  tradeRecommendation: z.object({
    buyZone: z.coerce.number().positive("Buy zone must be positive"),
    target1: z.coerce.number().positive("Target 1 must be positive"),
    target2: z.coerce.number().positive().optional().or(z.literal("")),
    target3: z.coerce.number().positive().optional().or(z.literal("")),
    stopLoss: z.coerce.number().positive("Stop loss must be positive"),
    riskRewardRatio: z.coerce.number().optional(),
  }),
});

export const step6Schema = z.object({
  analysisReason: z.string().optional(),
});

export const fullAnalysisSchema = step1Schema
  .merge(step2Schema)
  .merge(step3Schema)
  .merge(step4Schema)
  .merge(step5Schema)
  .merge(step6Schema)
  .extend({ status: z.enum(["draft", "published"]).default("draft") });

export type Step1Data = z.infer<typeof step1Schema>;
export type Step2Data = z.infer<typeof step2Schema>;
export type Step3Data = z.infer<typeof step3Schema>;
export type Step4Data = z.infer<typeof step4Schema>;
export type Step5Data = z.infer<typeof step5Schema>;
export type Step6Data = z.infer<typeof step6Schema>;
export type FullAnalysisData = z.infer<typeof fullAnalysisSchema>;
