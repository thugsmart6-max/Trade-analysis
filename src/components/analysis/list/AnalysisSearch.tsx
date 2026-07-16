"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Search, SortAsc } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SORT_OPTIONS = [
  { value: "date-desc", label: "Newest first" },
  { value: "date-asc",  label: "Oldest first" },
  { value: "name-asc",  label: "A — Z" },
  { value: "name-desc", label: "Z — A" },
];

export function AnalysisSearch() {
  const router = useRouter();
  const params = useSearchParams();
  const [, startTransition] = useTransition();

  const search = params.get("search") ?? "";
  const sort   = params.get("sort") ?? "date-desc";

  function update(key: string, value: string) {
    const p = new URLSearchParams(params.toString());
    if (value) p.set(key, value); else p.delete(key);
    p.delete("page");
    startTransition(() => router.push(`/analysis?${p.toString()}`));
  }

  function updateSort(v: string | null) {
    update("sort", v ?? "date-desc");
  }

  return (
    <div className="flex items-center gap-2 w-full">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <Input
          placeholder="Search company or symbol..."
          defaultValue={search}
          onChange={(e) => update("search", e.target.value)}
          className="h-9 pl-8 bg-accent border-border text-foreground placeholder:text-[#2a2622] focus:border-[#F0B429]/50 font-mono text-xs rounded-lg"
        />
      </div>
      <Select value={sort} onValueChange={updateSort}>
        <SelectTrigger className="h-9 w-38 bg-accent border-border text-muted-foreground font-mono text-xs rounded-lg gap-2">
          <SortAsc className="w-3 h-3 text-muted-foreground" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-accent border-border">
          {SORT_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value} className="font-mono text-xs text-muted-foreground">
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
