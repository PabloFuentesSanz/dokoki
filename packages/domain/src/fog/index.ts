/**
 * Niebla: qué está desbloqueado y qué no.
 *
 * El MVP desbloquea por niveles administrativos (país › región › ciudad). La niebla por
 * celdas hexagonales (H3) queda para después (spec §11, "Qué entra y qué no").
 */
import type { Feature, FeatureCollection, MultiPolygon, Polygon } from 'geojson';

export type UnlockLevel = 'country' | 'region' | 'city';

/** Lo mínimo de una foto asignada para desbloquear (compatible con PlaceAssignment). */
export interface VisitedPhoto {
  countryCode: string;
  regionId: string;
  cityId: string;
  takenAt: number;
}

/** Marca a mano (HU-12, M1.4c). La fecha es aproximada y opcional. */
export type ManualMark =
  | { level: 'country'; countryCode: string; visitedAt: number | null }
  | { level: 'region'; countryCode: string; regionId: string; visitedAt: number | null }
  | {
      level: 'city';
      countryCode: string;
      regionId: string;
      cityId: string;
      visitedAt: number | null;
    };

export interface UnlockEntry {
  id: string;
  /** Primera visita conocida; null si solo hay marcas a mano sin fecha. */
  firstVisitedAt: number | null;
  photoCount: number;
  /** Lo marcado a mano se distingue de lo detectado por fotos. */
  source: 'photos' | 'manual' | 'both';
}

/** Denominadores para los porcentajes. Sale del dataset de límites empaquetado. */
export interface UnlockCatalog {
  countryCount: number;
  regionCountByCountry: Readonly<Record<string, number>>;
}

export interface UnlockState {
  countries: Record<string, UnlockEntry>;
  regions: Record<string, UnlockEntry>;
  cities: Record<string, UnlockEntry>;
  totals: { countries: number; regions: number; cities: number };
  /** % de países del mundo, con un decimal. */
  worldPercent: number;
  /** % de regiones desbloqueadas por país (entero), solo para países del catálogo. */
  regionPercentByCountry: Record<string, number>;
}

export interface ComputeUnlockOptions {
  catalog: UnlockCatalog;
  manual?: readonly ManualMark[];
  /** Viaje en el tiempo (M1.3): solo lo visitado hasta este instante. */
  until?: number;
}

type EntryMap = Record<string, UnlockEntry>;

function earliest(a: number | null, b: number | null): number | null {
  if (a === null) return b;
  if (b === null) return a;
  return Math.min(a, b);
}

function addPhoto(map: EntryMap, id: string, takenAt: number): void {
  const entry = map[id];
  if (entry) {
    entry.photoCount += 1;
    entry.firstVisitedAt = earliest(entry.firstVisitedAt, takenAt);
  } else {
    map[id] = { id, firstVisitedAt: takenAt, photoCount: 1, source: 'photos' };
  }
}

function addManual(map: EntryMap, id: string, visitedAt: number | null): void {
  const entry = map[id];
  if (entry) {
    entry.firstVisitedAt = earliest(entry.firstVisitedAt, visitedAt);
    if (entry.source === 'photos') entry.source = 'both';
  } else {
    map[id] = { id, firstVisitedAt: visitedAt, photoCount: 0, source: 'manual' };
  }
}

/**
 * Calcula el estado de desbloqueo a partir de las fotos asignadas y las marcas a mano.
 * Una ciudad desbloquea su región y su país. O(fotos + marcas).
 */
export function computeUnlockState(
  photos: readonly VisitedPhoto[],
  options: ComputeUnlockOptions,
): UnlockState {
  const { catalog, until } = options;
  const countries: EntryMap = {};
  const regions: EntryMap = {};
  const cities: EntryMap = {};
  const regionCountry = new Map<string, string>();

  for (const photo of photos) {
    if (until !== undefined && photo.takenAt > until) continue;
    addPhoto(countries, photo.countryCode, photo.takenAt);
    addPhoto(regions, photo.regionId, photo.takenAt);
    addPhoto(cities, photo.cityId, photo.takenAt);
    regionCountry.set(photo.regionId, photo.countryCode);
  }

  for (const mark of options.manual ?? []) {
    if (until !== undefined && mark.visitedAt !== null && mark.visitedAt > until) continue;
    addManual(countries, mark.countryCode, mark.visitedAt);
    if (mark.level !== 'country') {
      addManual(regions, mark.regionId, mark.visitedAt);
      regionCountry.set(mark.regionId, mark.countryCode);
    }
    if (mark.level === 'city') addManual(cities, mark.cityId, mark.visitedAt);
  }

  const regionsByCountry = new Map<string, number>();
  for (const countryCode of regionCountry.values()) {
    regionsByCountry.set(countryCode, (regionsByCountry.get(countryCode) ?? 0) + 1);
  }
  const regionPercentByCountry: Record<string, number> = {};
  for (const [countryCode, unlocked] of regionsByCountry) {
    const total = catalog.regionCountByCountry[countryCode];
    if (total) regionPercentByCountry[countryCode] = Math.round((unlocked / total) * 100);
  }

  const totals = {
    countries: Object.keys(countries).length,
    regions: Object.keys(regions).length,
    cities: Object.keys(cities).length,
  };

  return {
    countries,
    regions,
    cities,
    totals,
    worldPercent: Math.round((totals.countries / catalog.countryCount) * 1000) / 10,
    regionPercentByCountry,
  };
}

/** Propiedades de cada área del dataset de límites. */
export interface AreaProperties {
  id: string;
  level: UnlockLevel;
}

export interface FogFeatureProperties extends AreaProperties {
  unlocked: boolean;
}

export type FogFeatureCollection = FeatureCollection<Polygon | MultiPolygon, FogFeatureProperties>;

export interface BuildFogOptions {
  /** Solo las áreas de este nivel (según el zoom del mapa). */
  level?: UnlockLevel;
}

/**
 * Etiqueta cada área con `unlocked` para que el mapa pinte la niebla sobre las que no lo están.
 * No copia geometrías: reutiliza las del dataset para no duplicar memoria.
 */
export function buildFogLayer(
  state: UnlockState,
  areas: FeatureCollection<Polygon | MultiPolygon, AreaProperties>,
  options: BuildFogOptions = {},
): FogFeatureCollection {
  const byLevel: Record<UnlockLevel, EntryMap> = {
    country: state.countries,
    region: state.regions,
    city: state.cities,
  };

  const features: Feature<Polygon | MultiPolygon, FogFeatureProperties>[] = [];
  for (const area of areas.features) {
    const { id, level } = area.properties;
    if (options.level && options.level !== level) continue;
    features.push({
      type: 'Feature',
      geometry: area.geometry,
      properties: { id, level, unlocked: id in byLevel[level] },
    });
  }
  return { type: 'FeatureCollection', features };
}
