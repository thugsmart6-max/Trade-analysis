export const dynamic = "force-dynamic";
export const revalidate = 0;

import { Suspense } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { getDashboardStats, getRecentAnalyses } from "@/actions/dashboard";
import { StatsCardGrid } from "@/components/dashboard/StatsCardGrid";
import { RecentAnalyses } from "@/components/dashboard/RecentAnalyses";
import { Skeleton } from "@/components/ui/skeleton";

async function DashboardContent() {
  const [stats, recent] = await Promise.all([
    getDashboardStats(),
    getRecentAnalyses(8),
  ]);

  return (
    <>
      <StatsCardGrid stats={stats} />

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h2 className="text-foreground text-sm font-semibold">Recent Analyses</h2>
            <p className="text-muted-foreground font-mono text-[10px] mt-0.5 uppercase tracking-widest">
              Latest {recent.length} entries
            </p>
          </div>
          <Link
            href="/analysis"
            className="text-muted-foreground hover:text-[#F0B429] font-mono text-[10px] uppercase tracking-widest transition-colors"
          >
            View all →
          </Link>
        </div>
        <RecentAnalyses analyses={recent} />
      </div>
    </>
  );
}

function DashboardSkeleton() {
  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-px bg-border border border-border rounded-xl overflow-hidden mb-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="bg-card p-5 min-h-[110px]">
            <Skeleton className="h-3 w-6 mb-4" />
            <Skeleton className="h-9 w-16 mb-2" />
            <Skeleton className="h-2.5 w-12" />
          </div>
        ))}
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-14" />
        </div>
        <div className="divide-y divide-border">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="px-5 py-3">
              <Skeleton className="h-10 rounded" />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default function DashboardPage() {
  return (
    <div className="p-4 md:p-6 h-full">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div>
          <span className="text-muted-foreground font-mono text-[10px] uppercase tracking-widest block mb-1">Overview</span>
          <h1 className="font-display text-foreground text-2xl font-bold tracking-tight">Dashboard</h1>
        </div>
        <Link href="/analysis/new">
          <button className="flex items-center gap-2 h-9 px-4 bg-[#F0B429] hover:bg-[#d4a025] text-[#080808] text-xs font-bold rounded-lg transition-colors">
            <Plus className="w-3.5 h-3.5" />
            New Analysis
          </button>
        </Link>
      </div>

      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}
