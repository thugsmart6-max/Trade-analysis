import type { OHLCV } from "./indicators";

export interface VolumeProfile {
  todayVolume: number;
  avg20: number | null;
  avg50: number | null;
  avg75: number | null;
  avg100: number | null;
  ratio20: number | null;
  ratio50: number | null;
  increasePct20: number | null;
}

function avgVol(data: OHLCV[], period: number): number | null {
  if (data.length < period) return null;
  const slice = data.slice(-period);
  return slice.reduce((s, d) => s + d.volume, 0) / period;
}

export function calcVolumeProfile(data: OHLCV[]): VolumeProfile {
  if (!data.length) {
    return {
      todayVolume: 0, avg20: null, avg50: null, avg75: null, avg100: null,
      ratio20: null, ratio50: null, increasePct20: null,
    };
  }
  // Exclude today from averages for fair comparison
  const hist = data.length > 1 ? data.slice(0, -1) : data;
  const todayVolume = data[data.length - 1].volume;
  const a20  = avgVol(hist, 20);
  const a50  = avgVol(hist, 50);
  const a75  = avgVol(hist, 75);
  const a100 = avgVol(hist, 100);

  return {
    todayVolume,
    avg20: a20,
    avg50: a50,
    avg75: a75,
    avg100: a100,
    ratio20: a20 ? parseFloat((todayVolume / a20).toFixed(2)) : null,
    ratio50: a50 ? parseFloat((todayVolume / a50).toFixed(2)) : null,
    increasePct20: a20 ? parseFloat((((todayVolume - a20) / a20) * 100).toFixed(1)) : null,
  };
}

export type VolumeFilter =
  | "gte_100"
  | "gte_120"
  | "gte_150"
  | "gte_200";

export function matchesVolumeFilter(profile: VolumeProfile, filter: VolumeFilter, period: 20 | 50 | 75 | 100 = 20): boolean {
  const avg = period === 20 ? profile.avg20
    : period === 50 ? profile.avg50
    : period === 75 ? profile.avg75
    : profile.avg100;
  if (!avg || avg <= 0) return false;
  const ratio = profile.todayVolume / avg;
  switch (filter) {
    case "gte_100": return ratio >= 1.0;
    case "gte_120": return ratio >= 1.2;
    case "gte_150": return ratio >= 1.5;
    case "gte_200": return ratio >= 2.0;
  }
}
