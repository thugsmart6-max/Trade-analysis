export type Trend = "bullish" | "bearish" | "consolidation";
export type Status = "draft" | "published";
export type ConfidenceLevel = "low" | "medium" | "high";

export interface IndicatorSet {
  sma20?: number | string;
  sma50?: number | string;
  sma100?: number | string;
  sma200?: number | string;
  ema20?: number | string;
  ema50?: number | string;
  rsi?: number | string;
}

export interface PriceInfo {
  currentPrice: number | string;
  prevOpen?: number | string;
  prevClose?: number | string;
  prevHigh?: number | string;
  prevLow?: number | string;
  allTimeHigh?: number | string;
  yearHigh?: number | string;
  yearLow?: number | string;
}

export interface TechnicalPattern {
  trend: Trend;
  patternType: string;
  confidenceLevel: ConfidenceLevel;
  notes?: string;
}

export interface TradeRecommendation {
  buyZone: number | string;
  target1: number | string;
  target2?: number | string;
  target3?: number | string;
  stopLoss: number | string;
  riskRewardRatio?: number | string;
}

export interface AnalysisFormData {
  // Step 1
  companyName: string;
  nseSymbol: string;
  sector: string;
  analysisDate: string;
  analysisTime: string;
  // Step 2
  priceInfo: PriceInfo;
  // Step 3
  technicalPattern: TechnicalPattern;
  // Step 4
  indicators: {
    "5m": IndicatorSet;
    "30m": IndicatorSet;
    "1h": IndicatorSet;
    "1d": IndicatorSet;
  };
  // Step 5
  tradeRecommendation: TradeRecommendation;
  // Step 6
  analysisReason?: string;
  status: Status;
}

export interface AnalysisListItem {
  _id: string;
  companyName: string;
  nseSymbol: string;
  sector: string;
  analysisDate: string;
  status: Status;
  technicalPattern: {
    trend: Trend;
    patternType: string;
    confidenceLevel: ConfidenceLevel;
  };
  priceInfo: {
    currentPrice: number;
  };
  createdAt: string;
}

export interface AnalysisFull extends AnalysisListItem {
  analysisTime: string;
  priceInfo: {
    currentPrice: number;
    prevOpen?: number;
    prevClose?: number;
    prevHigh?: number;
    prevLow?: number;
    allTimeHigh?: number;
    yearHigh?: number;
    yearLow?: number;
  };
  technicalPattern: {
    trend: Trend;
    patternType: string;
    confidenceLevel: ConfidenceLevel;
    notes?: string;
  };
  indicators: {
    "5m"?: IndicatorSet;
    "30m"?: IndicatorSet;
    "1h"?: IndicatorSet;
    "1d"?: IndicatorSet;
  };
  tradeRecommendation: {
    buyZone: number;
    target1: number;
    target2?: number;
    target3?: number;
    stopLoss: number;
    riskRewardRatio?: number;
  };
  analysisReason?: string;
  updatedAt: string;
}

export const SECTORS = [
  "Banking & Finance",
  "Information Technology",
  "Software & IT Services",
  "Pharmaceuticals",
  "Energy",
  "Oil and Gas",
  "Gases and Fuels",
  "Power",
  "FMCG",
  "Alcohol",
  "Automobiles",
  "Metals & Mining",
  "Real Estate",
  "Telecom",
  "Consumer Durables",
  "Chemicals",
  "Infrastructure",
  "Healthcare",
  "Media & Entertainment",
  "Defence",
  "Aviation",
  "Textiles",
  "Agriculture",
  "Others",
] as const;

export const PATTERN_TYPES = [
  "Uptrend",
  "Downtrend",
  "Consolidation",
  "Double Bottom",
  "Double Top",
  "Head & Shoulders",
  "Inverse Head & Shoulders",
  "Cup & Handle",
  "Bull Flag",
  "Bear Flag",
  "Ascending Triangle",
  "Descending Triangle",
  "Symmetrical Triangle",
  "Wedge",
  "Channel Breakout",
  "Support Bounce",
  "Resistance Breakdown",
  "Bullish Engulfing",
  "Bearish Engulfing",
  "Doji",
  "Hammer",
  "Shooting Star",
  "Morning Star",
  "Evening Star",
  "Breakout",
  "Reversal",
  "Consolidation Breakout",
  "Others",
] as const;

export const TIMEFRAME_LABELS: Record<string, string> = {
  "5m": "5 Minutes",
  "30m": "30 Minutes",
  "1h": "1 Hour",
  "1d": "1 Day",
};
