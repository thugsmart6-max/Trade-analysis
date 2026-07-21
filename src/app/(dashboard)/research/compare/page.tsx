export const dynamic = "force-dynamic";

import { getComparisonData } from "@/actions/research";
import { ComparisonModule } from "@/components/research/ComparisonModule";

interface Props {
  searchParams: Promise<{ symbols?: string }>;
}

export default async function ComparePage({ searchParams }: Props) {
  const { symbols } = await searchParams;
  const symbolList = (symbols ?? "").split(",").map((s) => s.trim()).filter(Boolean).slice(0, 4);

  const data = symbolList.length ? await getComparisonData(symbolList) : [];

  return (
    <div className="p-4 md:p-6">
      <ComparisonModule data={data} initialSymbols={symbolList} />
    </div>
  );
}
