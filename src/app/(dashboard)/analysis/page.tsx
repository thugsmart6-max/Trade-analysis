export const dynamic = "force-dynamic";
export const revalidate = 0;

import { Suspense } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { listAnalyses, getDistinctSectors, getDistinctPatterns } from "@/actions/analysis";
import { AnalysisTable } from "@/components/analysis/list/AnalysisTable";
import { AnalysisSearch } from "@/components/analysis/list/AnalysisSearch";
import { AnalysisFilters } from "@/components/analysis/list/AnalysisFilters";
import { Pagination } from "@/components/analysis/list/Pagination";

interface PageProps {
  searchParams: Promise<{
    search?: string;
    trend?: string;
    status?: string;
    sector?: string;
    pattern?: string;
    sort?: string;
    page?: string;
  }>;
}

async function AnalysisListContent({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = parseInt(params.page ?? "1");

  // Map sort param to sortBy for action
  let sortBy = "date-desc";
  if (params.sort) sortBy = params.sort;

  const [result, , patterns] = await Promise.all([
    listAnalyses({
      search: params.search,
      trend: params.trend,
      status: params.status,
      sector: params.sector,
      patternType: params.pattern,
      sortBy,
      page,
      limit: 12,
    }),
    getDistinctSectors(),
    getDistinctPatterns(),
  ]);

  return (
    <>
      <div className="bg-card border border-border rounded-xl overflow-hidden mb-4">
        <div className="p-3 md:p-4 border-b border-border">
          <AnalysisSearch />
        </div>
        <div className="px-3 md:px-4 py-2.5 overflow-x-auto">
          <AnalysisFilters patternTypes={patterns} />
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <span className="text-muted-foreground font-mono text-[10px] uppercase tracking-widest">
            {result.total} {result.total === 1 ? "result" : "results"}
          </span>
        </div>
        <AnalysisTable analyses={result.analyses} />
        <Pagination
          currentPage={result.page}
          totalPages={result.totalPages}
          totalCount={result.total}
        />
      </div>
    </>
  );
}

function ListSkeleton() {
  return (
    <>
      <div className="bg-card border border-border rounded-xl overflow-hidden mb-4">
        <div className="flex gap-3 p-4 border-b border-border">
          <Skeleton className="h-9 flex-1 bg-accent" />
          <Skeleton className="h-9 w-36 bg-accent" />
        </div>
        <div className="flex gap-2 px-4 py-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-24 bg-accent" />
          ))}
        </div>
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <Skeleton className="h-3 w-20 bg-accent" />
        </div>
        <div className="divide-y divide-border">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="px-4 py-3">
              <Skeleton className="h-10 bg-accent rounded" />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default function AnalysisListPage({ searchParams }: PageProps) {
  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div>
          <span className="text-muted-foreground font-mono text-[10px] uppercase tracking-widest block mb-1">
            Research Database
          </span>
          <h1 className="font-display text-foreground text-2xl font-bold tracking-tight">All Analyses</h1>
        </div>
        <Link href="/analysis/new">
          <button className="flex items-center gap-2 h-9 px-4 bg-[#F0B429] hover:bg-[#d4a025] text-[#080808] text-xs font-bold rounded-lg transition-colors">
            <Plus className="w-3.5 h-3.5" />
            New Analysis
          </button>
        </Link>
      </div>

      <Suspense fallback={<ListSkeleton />}>
        <AnalysisListContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
