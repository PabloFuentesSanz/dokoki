/** Países en el dispositivo (HU-06): límites de Natural Earth empaquetados en la app, sin red. */
import { createAreaIndex, type PlaceResolver } from '@atlas/domain';
import type { FeatureCollection, MultiPolygon, Polygon } from 'geojson';
import rawCountries from '../data/countries.json';
import { readString, toAreaCollection } from './geodata';

export interface CountryProperties {
  id: string;
  level: 'country';
  name: string;
  continent: string;
}

/** Valida el JSON empaquetado y lo convierte en una colección tipada. */
export function toCountryCollection(
  json: unknown,
): FeatureCollection<Polygon | MultiPolygon, CountryProperties> {
  return toAreaCollection(json, (p) => ({
    id: readString(p, 'id'),
    level: 'country',
    name: readString(p, 'name'),
    continent: readString(p, 'continent'),
  }));
}

export const countryAreas = toCountryCollection(rawCountries);

export const countryIndex = createAreaIndex(countryAreas);
const names = new Map(countryAreas.features.map((f) => [f.properties.id, f.properties.name]));

export function countryName(code: string): string {
  return names.get(code) ?? code;
}

const CONTINENTS: Record<string, string> = {
  Africa: 'África',
  Asia: 'Asia',
  Europe: 'Europa',
  'North America': 'América del Norte',
  'South America': 'América del Sur',
  Oceania: 'Oceanía',
  Antarctica: 'Antártida',
};
const continents = new Map(
  countryAreas.features.map((f) => [f.properties.id, f.properties.continent]),
);

export function continentName(code: string): string {
  const continent = continents.get(code) ?? '';
  return CONTINENTS[continent] ?? continent;
}

/** Resuelve solo el país (el resolvedor completo está en `places.ts`). */
export const countryResolver: PlaceResolver = {
  resolve(point) {
    const feature = countryIndex.find(point);
    return feature
      ? { countryCode: feature.properties.id, regionId: null, cityId: null, placeId: null }
      : null;
  },
};

const NOT_COUNTRIES = new Set(['Antarctica', 'Seven seas (open ocean)']);

/** Países que cuentan para "% del mundo" (sin la Antártida ni el mar abierto). */
export const countryCount = countryAreas.features.filter(
  (f) => !NOT_COUNTRIES.has(f.properties.continent),
).length;

const normalize = (text: string): string =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const searchableCountries = countryAreas.features
  .filter((f) => !NOT_COUNTRIES.has(f.properties.continent))
  .map((f) => ({
    code: f.properties.id,
    name: f.properties.name,
    key: normalize(f.properties.name),
  }));

/** Países cuyo nombre empieza por el texto (o, si no hay, lo contiene), sin tildes. M1.8. */
export function searchCountries(query: string, limit = 5): { code: string; name: string }[] {
  const q = normalize(query);
  if (q.length === 0) return [];
  const starts = searchableCountries.filter((c) => c.key.startsWith(q));
  const pool = starts.length > 0 ? starts : searchableCountries.filter((c) => c.key.includes(q));
  return pool.slice(0, limit).map(({ code, name }) => ({ code, name }));
}

const CONTINENT_ORDER = [
  'Europe',
  'Asia',
  'Africa',
  'North America',
  'South America',
  'Oceania',
] as const;

/** M2.1 · Progreso por continente: países visitados sobre el total de cada continente. */
export function continentProgress(
  visited: Iterable<string>,
): { continent: string; visited: number; total: number }[] {
  const seen = new Set(visited);
  return CONTINENT_ORDER.map((key) => {
    const codes = countryAreas.features
      .filter((f) => f.properties.continent === key)
      .map((f) => f.properties.id);
    return {
      continent: CONTINENTS[key] ?? key,
      visited: codes.filter((code) => seen.has(code)).length,
      total: codes.length,
    };
  });
}
