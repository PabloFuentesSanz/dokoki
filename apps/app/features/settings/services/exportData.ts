import type { DetectedTrip, UnlockState } from '@atlas/domain';
import type { Base } from './bases';

export interface AtlasExport {
  app: 'Atlas';
  version: 1;
  exportedAt: string;
  bases: { city: string; country: string; from: number | null; until: number | null }[];
  countries: { code: string; name: string; firstVisit: string | null; photos: number }[];
  regions: string[];
  cities: string[];
  trips: {
    name: string;
    from: string;
    until: string;
    countries: string[];
    cities: string[];
    photos: number;
    confirmed: boolean;
  }[];
}

const day = (ms: number): string => new Date(ms).toISOString().slice(0, 10);

/**
 * "Tus datos" (M10.7): viajes, lugares y bases en un JSON legible. Solo nombres e ids de lugar:
 * ni coordenadas de fotos ni de bases, ni las fotos (ya están en tu móvil).
 */
export function buildExport(input: {
  bases: readonly Base[];
  trips: readonly DetectedTrip[];
  state: UnlockState;
  names: { country: (code: string) => string; city: (id: string) => string };
  now: number;
}): AtlasExport {
  const { bases, trips, state, names, now } = input;
  return {
    app: 'Atlas',
    version: 1,
    exportedAt: new Date(now).toISOString(),
    bases: bases.map((b) => ({
      city: b.name,
      country: b.countryCode,
      from: b.fromYear,
      until: b.untilYear,
    })),
    countries: Object.values(state.countries)
      .sort((a, b) => (a.firstVisitedAt ?? 0) - (b.firstVisitedAt ?? 0))
      .map((c) => ({
        code: c.id,
        name: names.country(c.id),
        firstVisit: c.firstVisitedAt === null ? null : day(c.firstVisitedAt),
        photos: c.photoCount,
      })),
    regions: Object.keys(state.regions).sort(),
    cities: Object.keys(state.cities)
      .map((id) => names.city(id))
      .sort((a, b) => a.localeCompare(b, 'es')),
    trips: [...trips]
      .sort((a, b) => a.startAt - b.startAt)
      .map((t) => ({
        name: t.name,
        from: day(t.startAt),
        until: day(t.endAt),
        countries: t.countryCodes,
        cities: t.cities.map((c) => c.cityName),
        photos: t.photoIds.length,
        confirmed: t.locked,
      })),
  };
}
