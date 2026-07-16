"use server";

import { connectDB } from "@/lib/db/connect";
import Analysis from "@/lib/db/models/Analysis";
import { AnalysisListItem } from "@/types/analysis";

export interface DashboardStats {
  total: number;
  todayCount: number;
  bullishCount: number;
  bearishCount: number;
  consolidationCount: number;
  draftCount: number;
  publishedCount: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  await connectDB();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [total, todayCount, bullishCount, bearishCount, consolidationCount, draftCount, publishedCount] =
    await Promise.all([
      Analysis.countDocuments(),
      Analysis.countDocuments({ analysisDate: { $gte: today, $lt: tomorrow } }),
      Analysis.countDocuments({ "technicalPattern.trend": "bullish" }),
      Analysis.countDocuments({ "technicalPattern.trend": "bearish" }),
      Analysis.countDocuments({ "technicalPattern.trend": "consolidation" }),
      Analysis.countDocuments({ status: "draft" }),
      Analysis.countDocuments({ status: "published" }),
    ]);

  return {
    total,
    todayCount,
    bullishCount,
    bearishCount,
    consolidationCount,
    draftCount,
    publishedCount,
  };
}

export async function getRecentAnalyses(limit = 5): Promise<AnalysisListItem[]> {
  await connectDB();

  const analyses = await Analysis.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .select("companyName nseSymbol sector analysisDate status technicalPattern priceInfo createdAt")
    .lean();

  return analyses.map((a) => ({
    _id: a._id.toString(),
    companyName: a.companyName,
    nseSymbol: a.nseSymbol,
    sector: a.sector,
    analysisDate: a.analysisDate.toISOString(),
    status: a.status,
    technicalPattern: {
      trend: a.technicalPattern.trend,
      patternType: a.technicalPattern.patternType,
      confidenceLevel: a.technicalPattern.confidenceLevel,
    },
    priceInfo: {
      currentPrice: a.priceInfo.currentPrice,
    },
    createdAt: a.createdAt.toISOString(),
  }));
}
