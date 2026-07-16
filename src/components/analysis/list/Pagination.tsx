"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTransition } from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
}

export function Pagination({ currentPage, totalPages, totalCount }: PaginationProps) {
  const router = useRouter();
  const params = useSearchParams();
  const [, startTransition] = useTransition();

  function goTo(page: number) {
    const p = new URLSearchParams(params.toString());
    if (page <= 1) p.delete("page"); else p.set("page", String(page));
    startTransition(() => router.push(`/analysis?${p.toString()}`));
  }

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-4 py-3.5 border-t border-border">
      <span className="text-muted-foreground font-mono text-[10px] uppercase tracking-widest">
        {totalCount} results
      </span>

      <div className="flex items-center gap-1">
        <button
          onClick={() => goTo(currentPage - 1)}
          disabled={currentPage <= 1}
          className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-muted-foreground hover:bg-accent disabled:opacity-30 transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            onClick={() => goTo(p)}
            className={`w-7 h-7 flex items-center justify-center rounded-md font-mono text-xs transition-colors ${
              p === currentPage
                ? "bg-[#F0B429] text-[#080808] font-bold"
                : "text-muted-foreground hover:text-muted-foreground hover:bg-accent"
            }`}
          >
            {p}
          </button>
        ))}

        <button
          onClick={() => goTo(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-muted-foreground hover:bg-accent disabled:opacity-30 transition-colors"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
