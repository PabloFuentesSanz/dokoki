/** Tus bases (M0.5, HU-04): las eliges tú; puede haber varias, con periodo opcional. */
import type { HomeBase } from '@atlas/domain';

export interface Base {
  id: string;
  cityId: string;
  name: string;
  countryCode: string;
  lat: number;
  lng: number;
  /** Año desde el que es tu base (incluido). */
  fromYear: number | null;
  /** Último año en que fue tu base (incluido). */
  untilYear: number | null;
}

export function toHomeBases(bases: readonly Base[]): HomeBase[] {
  return bases.map((b) => ({
    location: { lat: b.lat, lng: b.lng },
    ...(b.fromYear !== null ? { from: Date.UTC(b.fromYear, 0, 1) } : {}),
    ...(b.untilYear !== null ? { until: Date.UTC(b.untilYear + 1, 0, 1) - 1 } : {}),
  }));
}

/** "desde 2019", "hasta 2018", "2015–2019" o "siempre". */
export function basePeriod(base: Pick<Base, 'fromYear' | 'untilYear'>): string {
  const { fromYear, untilYear } = base;
  if (fromYear !== null && untilYear !== null) return `${fromYear}–${untilYear}`;
  if (fromYear !== null) return `desde ${fromYear}`;
  if (untilYear !== null) return `hasta ${untilYear}`;
  return 'siempre';
}

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;
const yearOrNull = (v: unknown): number | null =>
  typeof v === 'number' && Number.isInteger(v) ? v : null;

/** Lee las bases guardadas, descartando las que no tengan el formato esperado. */
export function parseBases(value: unknown): Base[] {
  if (!Array.isArray(value)) return [];
  const out: Base[] = [];
  for (const item of value) {
    if (!isRecord(item)) continue;
    const { id, cityId, name, countryCode, lat, lng } = item;
    if (typeof id !== 'string' || typeof cityId !== 'string' || typeof name !== 'string') continue;
    if (typeof countryCode !== 'string' || typeof lat !== 'number' || typeof lng !== 'number')
      continue;
    out.push({
      id,
      cityId,
      name,
      countryCode,
      lat,
      lng,
      fromYear: yearOrNull(item.fromYear),
      untilYear: yearOrNull(item.untilYear),
    });
  }
  return out;
}
