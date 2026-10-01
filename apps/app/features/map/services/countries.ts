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
