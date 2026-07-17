import mongoose, { Schema, Document, Model } from "mongoose";

export type Trend = "bullish" | "bearish" | "consolidation";
export type Status = "draft" | "published";
export type Timeframe = "5m" | "30m" | "1h" | "1d";

export interface IIndicatorSet {
  sma20?: number;
  sma50?: number;
  sma100?: number;
  sma200?: number;
  ema20?: number;
  ema50?: number;
  rsi?: number;
}

export interface IPriceInfo {
  currentPrice: number;
  prevOpen?: number;
  prevClose?: number;
  prevHigh?: number;
  prevLow?: number;
  allTimeHigh?: number;
  yearHigh?: number;
  yearLow?: number;
}

export interface ITechnicalPattern {
  trend: Trend;
  patternType: string;
  confidenceLevel: "low" | "medium" | "high";
  notes?: string;
}

export interface ITradeRecommendation {
  buyZone: number;
  target1: number;
  target2?: number;
  target3?: number;
  stopLoss: number;
  riskRewardRatio?: number;
}

export interface IAnalysis extends Document {
  companyName: string;
  nseSymbol: string;
  sector: string;
  analysisDate: Date;
  analysisTime: string;
  status: Status;
  priceInfo: IPriceInfo;
  technicalPattern: ITechnicalPattern;
  indicators: {
    "5m"?: IIndicatorSet;
    "30m"?: IIndicatorSet;
    "1h"?: IIndicatorSet;
    "1d"?: IIndicatorSet;
  };
  tradeRecommendation: ITradeRecommendation;
  analysisReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const IndicatorSetSchema = new Schema<IIndicatorSet>(
  {
    sma20: Number,
    sma50: Number,
    sma100: Number,
    sma200: Number,
    ema20: Number,
    ema50: Number,
    rsi: Number,
  },
  { _id: false }
);

const AnalysisSchema = new Schema<IAnalysis>(
  {
    companyName: { type: String, default: "" },
    nseSymbol: { type: String, required: true, uppercase: true },
    sector: { type: String, required: true },
    analysisDate: { type: Date, required: true },
    analysisTime: { type: String, required: true },
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    priceInfo: {
      currentPrice: { type: Number, required: true },
      prevOpen: Number,
      prevClose: Number,
      prevHigh: Number,
      prevLow: Number,
      allTimeHigh: Number,
      yearHigh: Number,
      yearLow: Number,
    },
    technicalPattern: {
      trend: {
        type: String,
        enum: ["bullish", "bearish", "consolidation"],
        required: true,
      },
      patternType: { type: String, required: true },
      confidenceLevel: {
        type: String,
        enum: ["low", "medium", "high"],
        required: true,
      },
      notes: String,
    },
    indicators: {
      "5m": IndicatorSetSchema,
      "30m": IndicatorSetSchema,
      "1h": IndicatorSetSchema,
      "1d": IndicatorSetSchema,
    },
    tradeRecommendation: {
      buyZone: { type: Number, required: true },
      target1: { type: Number, required: true },
      target2: Number,
      target3: Number,
      stopLoss: { type: Number, required: true },
      riskRewardRatio: Number,
    },
    analysisReason: String,
  },
  { timestamps: true }
);

AnalysisSchema.index({ nseSymbol: 1 });
AnalysisSchema.index({ sector: 1 });
AnalysisSchema.index({ analysisDate: -1 });
AnalysisSchema.index({ status: 1 });
AnalysisSchema.index({ "technicalPattern.trend": 1 });
AnalysisSchema.index({ companyName: "text", nseSymbol: "text", sector: "text" });

const Analysis: Model<IAnalysis> =
  mongoose.models.Analysis ||
  mongoose.model<IAnalysis>("Analysis", AnalysisSchema);

export default Analysis;
