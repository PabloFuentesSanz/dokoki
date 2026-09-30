/**
 * Países en el dispositivo (HU-06): límites de Natural Earth empaquetados en la app, sin red.
 * TODO(HU-06): regiones y ciudades (admin-1/admin-2) con un índice en expo-sqlite.
 */
import { createAreaIndex, type PlaceResolver, type UnlockCatalog } from '@atlas/domain';
import type { Feature, FeatureCollection, MultiPolygon, Polygon } from 'geojson';
import rawCountries from '../data/countries.json';

export interface CountryProperties {
  id: string;
  level: 'country';
  name: string;
  continent: string;
}

type CountryFeature = Feature<Polygon | MultiPolygon, CountryProperties>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function toGeometry(value: unknown): Polygon | MultiPolygon {
  if (!isRecord(value) || !Array.isArray(value.coordinates)) throw new Error('Geometría no válida');
  if (value.type === 'Polygon') return { type: 'Polygon', coordinates: value.coordinates };
  if (value.type === 'MultiPolygon')
    return { type: 'MultiPolygon', coordinates: value.coordinates };
  throw new Error(`Geometría no soportada: ${String(value.type)}`);
}

/** Valida el JSON empaquetado y lo convierte en una colección tipada. */
export function toCountryCollection(
  json: unknown,
): FeatureCollection<Polygon | MultiPolygon, CountryProperties> {
  if (!isRecord(json) || !Array.isArray(json.features))
    throw new Error('No es una FeatureCollection');
  const features = json.features.map((feature: unknown): CountryFeature => {
    if (!isRecord(feature) || !isRecord(feature.properties))
      throw new Error('Feature sin propiedades');
    const { id, name, continent } = feature.properties;
    if (typeof id !== 'string' || typeof name !== 'string' || typeof continent !== 'string') {
      throw new Error('Feature sin id, nombre o continente');
    }
    return {
      type: 'Feature',
      geometry: toGeometry(feature.geometry),
      properties: { id, level: 'country', name, continent },
    };
  });
  return { type: 'FeatureCollection', features };
}

export const countryAreas = toCountryCollection(rawCountries);

const index = createAreaIndex(countryAreas);
const names = new Map(countryAreas.features.map((f) => [f.properties.id, f.properties.name]));

export function countryName(code: string): string {
  return names.get(code) ?? code;
}

/** Resuelve solo el país; región y ciudad llegarán con los límites admin-1 y admin-2. */
export const countryResolver: PlaceResolver = {
  resolve(point) {
    const feature = index.find(point);
    return feature
      ? { countryCode: feature.properties.id, regionId: null, cityId: null, placeId: null }
      : null;
  },
};

const NOT_COUNTRIES = new Set(['Antarctica', 'Seven seas (open ocean)']);

export const countryCatalog: UnlockCatalog = {
  countryCount: countryAreas.features.filter((f) => !NOT_COUNTRIES.has(f.properties.continent))
    .length,
  regionCountByCountry: {},
};
