"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { SECTORS } from "@/types/analysis";
import { X } from "lucide-react";

interface AnalysisFiltersProps {
  patternTypes: string[];
}

const TRENDS   = ["bullish","bearish","consolidation"];
const STATUSES = ["published","draft"];

export function AnalysisFilters({ patternTypes }: AnalysisFiltersProps) {
  const router = useRouter();
  const params = useSearchParams();
  const [, startTransition] = useTransition();

  const trend   = params.get("trend")   ?? "";
  const status  = params.get("status")  ?? "";
  const sector  = params.get("sector")  ?? "";
  const pattern = params.get("pattern") ?? "";

  function update(key: string, value: string) {
    const p = new URLSearchParams(params.toString());
    if (value && value !== "all") p.set(key, value); else p.delete(key);
    p.delete("page");
    startTransition(() => router.push(`/analysis?${p.toString()}`));
  }

  const hasFilters = trend || status || sector || pattern;

  function clearAll() {
    const p = new URLSearchParams(params.toString());
    ["trend","status","sector","pattern","page"].forEach(k => p.delete(k));
    startTransition(() => router.push(`/analysis?${p.toString()}`));
  }

  const filterClass = "h-8 bg-accent border-border text-muted-foreground font-mono text-[10px] rounded-md hover:border-[#F0B429]/30 min-w-24";

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-[#2a2622] font-mono text-[10px] uppercase tracking-widest shrink-0">Filter</span>

      <Select value={trend || "all"} onValueChange={(v) => update("trend", v ?? "all")}>
        <SelectTrigger className={filterClass}><SelectValue placeholder="Trend" /></SelectTrigger>
        <SelectContent className="bg-accent border-border">
          <SelectItem value="all" className="font-mono text-xs text-muted-foreground">All trends</SelectItem>
          {TRENDS.map((t) => (
            <SelectItem key={t} value={t} className="font-mono text-xs text-muted-foreground capitalize">{t}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={status || "all"} onValueChange={(v) => update("status", v ?? "all")}>
        <SelectTrigger className={filterClass}><SelectValue placeholder="Status" /></SelectTrigger>
        <SelectContent className="bg-accent border-border">
          <SelectItem value="all" className="font-mono text-xs text-muted-foreground">All status</SelectItem>
          {STATUSES.map((s) => (
            <SelectItem key={s} value={s} className="font-mono text-xs text-muted-foreground capitalize">{s}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={sector || "all"} onValueChange={(v) => update("sector", v ?? "all")}>
        <SelectTrigger className={filterClass}><SelectValue placeholder="Sector" /></SelectTrigger>
        <SelectContent className="bg-accent border-border">
          <SelectItem value="all" className="font-mono text-xs text-muted-foreground">All sectors</SelectItem>
          {SECTORS.map((s) => (
            <SelectItem key={s} value={s} className="font-mono text-xs text-muted-foreground">{s}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {patternTypes.length > 0 && (
        <Select value={pattern || "all"} onValueChange={(v) => update("pattern", v ?? "all")}>
          <SelectTrigger className={filterClass}><SelectValue placeholder="Pattern" /></SelectTrigger>
          <SelectContent className="bg-accent border-border">
            <SelectItem value="all" className="font-mono text-xs text-muted-foreground">All patterns</SelectItem>
            {patternTypes.map((p) => (
              <SelectItem key={p} value={p} className="font-mono text-xs text-muted-foreground">{p}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {hasFilters && (
        <button
          onClick={clearAll}
          className="flex items-center gap-1 h-8 px-2.5 text-[#FF4D6A] border border-[#FF4D6A]/20 bg-[#FF4D6A]/05 rounded-md font-mono text-[10px] uppercase tracking-wider hover:bg-[#FF4D6A]/10 transition-colors"
        >
          <X className="w-2.5 h-2.5" /> Clear
        </button>
      )}
    </div>
  );
}
