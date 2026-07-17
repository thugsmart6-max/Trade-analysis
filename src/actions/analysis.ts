"use server";

import { connectDB } from "@/lib/db/connect";
import Analysis from "@/lib/db/models/Analysis";
import { AnalysisListItem, AnalysisFull } from "@/types/analysis";
import { toNumber } from "@/lib/utils";
import { revalidatePath } from "next/cache";

export interface ListAnalysisParams {
  search?: string;
  trend?: string;
  status?: string;
  sector?: string;
  patternType?: string;
  sortBy?: string;
  page?: number;
  limit?: number;
}

export interface ListAnalysisResult {
  analyses: AnalysisListItem[];
  total: number;
  page: number;
  totalPages: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeAnalysis(a: any): AnalysisListItem {
  return {
    _id: a._id.toString(),
    companyName: a.companyName,
    nseSymbol: a.nseSymbol,
    sector: a.sector,
    analysisDate: a.analysisDate instanceof Date ? a.analysisDate.toISOString() : a.analysisDate,
    status: a.status,
    technicalPattern: {
      trend: a.technicalPattern.trend,
      patternType: a.technicalPattern.patternType,
      confidenceLevel: a.technicalPattern.confidenceLevel,
    },
    priceInfo: { currentPrice: a.priceInfo.currentPrice },
    createdAt: a.createdAt instanceof Date ? a.createdAt.toISOString() : a.createdAt,
  };
}

export async function listAnalyses(
  params: ListAnalysisParams = {}
): Promise<ListAnalysisResult> {
  await connectDB();

  const {
    search,
    trend,
    status,
    sector,
    patternType,
    sortBy = "newest",
    page = 1,
    limit = 10,
  } = params;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: any = {};

  if (search) {
    query.$or = [
      { companyName: { $regex: search, $options: "i" } },
      { nseSymbol: { $regex: search, $options: "i" } },
      { sector: { $regex: search, $options: "i" } },
      { "technicalPattern.patternType": { $regex: search, $options: "i" } },
    ];
  }
  if (trend && trend !== "all") query["technicalPattern.trend"] = trend;
  if (status && status !== "all") query.status = status;
  if (sector && sector !== "all") query.sector = sector;
  if (patternType && patternType !== "all")
    query["technicalPattern.patternType"] = patternType;

  const sortMap: Record<string, [string, 1 | -1][]> = {
    newest: [["createdAt", -1]],
    oldest: [["createdAt", 1]],
    name: [["companyName", 1]],
    date: [["analysisDate", -1]],
  };

  const sort = sortMap[sortBy] || sortMap.newest;
  const skip = (page - 1) * limit;

  const [analyses, total] = await Promise.all([
    Analysis.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select(
        "companyName nseSymbol sector analysisDate status technicalPattern priceInfo createdAt"
      )
      .lean(),
    Analysis.countDocuments(query),
  ]);

  return {
    analyses: analyses.map(normalizeAnalysis),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getAnalysisById(id: string): Promise<AnalysisFull | null> {
  await connectDB();

  const a = await Analysis.findById(id).lean();
  if (!a) return null;

  return {
    _id: a._id.toString(),
    companyName: a.companyName,
    nseSymbol: a.nseSymbol,
    sector: a.sector,
    analysisDate: a.analysisDate.toISOString(),
    analysisTime: a.analysisTime,
    status: a.status,
    priceInfo: a.priceInfo,
    technicalPattern: a.technicalPattern,
    indicators: a.indicators || {},
    tradeRecommendation: a.tradeRecommendation,
    analysisReason: a.analysisReason,
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildAnalysisData(data: any, status: "draft" | "published") {
  const nseSymbol = (data.nseSymbol ?? "").toString().toUpperCase();
  const sector = (data.sector ?? "").toString();
  const analysisDate = data.analysisDate ? new Date(data.analysisDate) : new Date();
  const analysisTime = (data.analysisTime ?? "").toString();

  if (!nseSymbol) throw new Error("NSE Symbol is required");
  if (!sector)    throw new Error("Sector is required");

  return {
    companyName: (data.companyName ?? "").toString(),
    nseSymbol,
    sector,
    analysisDate,
    analysisTime,
    status,
    priceInfo: {
      currentPrice: toNumber(data.priceInfo?.currentPrice) ?? 0,
      prevOpen:     toNumber(data.priceInfo?.prevOpen),
      prevClose:    toNumber(data.priceInfo?.prevClose),
      prevHigh:     toNumber(data.priceInfo?.prevHigh),
      prevLow:      toNumber(data.priceInfo?.prevLow),
      allTimeHigh:  toNumber(data.priceInfo?.allTimeHigh),
      yearHigh:     toNumber(data.priceInfo?.yearHigh),
      yearLow:      toNumber(data.priceInfo?.yearLow),
    },
    technicalPattern: {
      trend:           data.technicalPattern?.trend ?? "bullish",
      patternType:     (data.technicalPattern?.patternType ?? "").toString(),
      confidenceLevel: data.technicalPattern?.confidenceLevel ?? "medium",
      notes:           (data.technicalPattern?.notes ?? "").toString(),
    },
    indicators: {
      "5m":  buildIndicators(data.indicators?.["5m"]),
      "30m": buildIndicators(data.indicators?.["30m"]),
      "1h":  buildIndicators(data.indicators?.["1h"]),
      "1d":  buildIndicators(data.indicators?.["1d"]),
    },
    tradeRecommendation: {
      buyZone:        toNumber(data.tradeRecommendation?.buyZone)        ?? 0,
      target1:        toNumber(data.tradeRecommendation?.target1)        ?? 0,
      target2:        toNumber(data.tradeRecommendation?.target2),
      target3:        toNumber(data.tradeRecommendation?.target3),
      stopLoss:       toNumber(data.tradeRecommendation?.stopLoss)       ?? 0,
      riskRewardRatio: toNumber(data.tradeRecommendation?.riskRewardRatio),
    },
    analysisReason: (data.analysisReason ?? "").toString(),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildIndicators(ind: any) {
  if (!ind) return undefined;
  return {
    sma20: toNumber(ind.sma20),
    sma50: toNumber(ind.sma50),
    sma100: toNumber(ind.sma100),
    sma200: toNumber(ind.sma200),
    ema20: toNumber(ind.ema20),
    ema50: toNumber(ind.ema50),
    rsi: toNumber(ind.rsi),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createAnalysis(data: any, status: "draft" | "published" = "draft") {
  await connectDB();
  const doc = await Analysis.create(buildAnalysisData(data, status));
  revalidatePath("/");
  revalidatePath("/analysis");
  return { id: doc._id.toString() };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateAnalysis(id: string, data: any, status: "draft" | "published" = "draft") {
  await connectDB();
  await Analysis.findByIdAndUpdate(id, buildAnalysisData(data, status), { new: true });
  revalidatePath("/");
  revalidatePath("/analysis");
  revalidatePath(`/analysis/${id}`);
  return { id };
}

export async function publishAnalysis(id: string) {
  await connectDB();
  await Analysis.findByIdAndUpdate(id, { status: "published" });
  revalidatePath("/");
  revalidatePath("/analysis");
  revalidatePath(`/analysis/${id}`);
}

export async function deleteAnalysis(id: string) {
  await connectDB();
  await Analysis.findByIdAndDelete(id);
  revalidatePath("/");
  revalidatePath("/analysis");
}

export async function getDistinctSectors(): Promise<string[]> {
  await connectDB();
  return Analysis.distinct("sector");
}

export async function getDistinctPatterns(): Promise<string[]> {
  await connectDB();
  return Analysis.distinct("technicalPattern.patternType");
}
