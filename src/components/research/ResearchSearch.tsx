"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2 } from "lucide-react";
import { searchStocksAction } from "@/actions/research";

export function ResearchSearch() {
  const router = useRouter();
  const [query, setQuery]     = useState("");
  const [results, setResults] = useState<{ symbol: string; shortname?: string; longname?: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen]       = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function handleChange(v: string) {
    setQuery(v);
    if (debounce.current) clearTimeout(debounce.current);
    if (v.length < 1) { setResults([]); setOpen(false); return; }
    debounce.current = setTimeout(async () => {
      setLoading(true);
      const res = await searchStocksAction(v);
      setResults(res as { symbol: string; shortname?: string; longname?: string }[]);
      setOpen(true);
      setLoading(false);
    }, 350);
  }

  function handleSelect(symbol: string) {
    setOpen(false);
    router.push(`/research/${symbol.replace(/\.(NS|BO)$/, "")}`);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) router.push(`/research/${query.trim().toUpperCase()}`);
  }

  return (
    <div ref={ref} className="relative">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          {loading && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#F0B429] animate-spin" />}
          <input
            value={query}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={() => results.length && setOpen(true)}
            placeholder="Search NSE symbol — RELIANCE, TCS, INFY..."
            className="w-full h-12 pl-11 pr-12 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground font-mono text-sm focus:outline-none focus:border-[#F0B429]/60 transition-colors"
          />
        </div>
      </form>

      {open && results.length > 0 && (
        <div className="absolute z-50 top-full mt-2 w-full bg-card border border-border rounded-xl overflow-hidden shadow-xl">
          {results.slice(0, 8).map((r) => (
            <button
              key={r.symbol}
              onClick={() => handleSelect(r.symbol)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent/60 transition-colors text-left border-b border-border last:border-0"
            >
              <div className="w-7 h-7 rounded-md bg-[#F0B429]/10 border border-[#F0B429]/20 flex items-center justify-center shrink-0">
                <span className="text-[#F0B429] text-[9px] font-black">{r.symbol.slice(0, 2)}</span>
              </div>
              <div>
                <p className="text-foreground text-sm font-mono font-medium">{r.symbol}</p>
                <p className="text-muted-foreground text-[10px]">{r.longname ?? r.shortname ?? ""}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
