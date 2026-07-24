/** Today's date as DD-MM-YYYY in local time */
export function formatResearchDateKey(d = new Date()): string {
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

/** Folder-style company key from name/symbol — e.g. TCS, Infosys */
export function toCompanyKey(name: string, symbol: string): string {
  const ticker = symbol.replace(/\.(NS|BO)$/i, "").trim();
  const cleaned = (name ?? "")
    .replace(/\b(Limited|Ltd\.?|Inc\.?|Corp\.?|Corporation|PLC|Private|Pvt\.?)\b/gi, "")
    .replace(/[^a-zA-Z0-9\s&-]/g, " ")
    .trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  const first = parts[0];
  if (first && first.length >= 3 && !/^(the|and)$/i.test(first)) {
    if (first.toUpperCase() === ticker.toUpperCase()) return ticker.toUpperCase();
    // Long formal names (Tata Consultancy Services) → ticker folder
    if (parts.length >= 3) return ticker.toUpperCase();
    return first.charAt(0).toUpperCase() + first.slice(1);
  }
  return ticker.toUpperCase();
}

export function startOfLocalDay(d = new Date()): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function researchPath(name: string, symbol: string, d = new Date()): string {
  return `${toCompanyKey(name, symbol)}/${formatResearchDateKey(d)}`;
}
