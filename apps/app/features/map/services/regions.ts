/** Regiones (prefecturas, provincias, estados) de Natural Earth admin-1, en el dispositivo. */
import { createAreaIndex, type AreaIndex } from '@atlas/domain';
import type { FeatureCollection, MultiPolygon, Polygon } from 'geojson';
import rawRegions from '../data/regions.json';
import { readString, toAreaCollection } from './geodata';

export interface RegionProperties {
  id: string;
  level: 'region';
  country: string;
  name: string;
}

export const regionAreas: FeatureCollection<Polygon | MultiPolygon, RegionProperties> =
  toAreaCollection(rawRegions, (p) => ({
    id: readString(p, 'id'),
    level: 'region',
    country: readString(p, 'country'),
    name: readString(p, 'name'),
  }));

const byCountry = new Map<string, RegionProperties[]>();
const names = new Map<string, string>();
for (const feature of regionAreas.features) {
  const list = byCountry.get(feature.properties.country) ?? [];
  list.push(feature.properties);
  byCountry.set(feature.properties.country, list);
  names.set(feature.properties.id, feature.properties.name);
}

export function regionName(id: string): string {
  return names.get(id) ?? id;
}

export function regionsOf(countryCode: string): readonly RegionProperties[] {
  return byCountry.get(countryCode) ?? [];
}

/** Número de regiones por país: el denominador de "Japón 38 %". */
export const regionCountByCountry: Readonly<Record<string, number>> = Object.fromEntries(
  [...byCountry].map(([code, list]) => [code, list.length]),
);

// Un índice por país, creado la primera vez que hace falta: solo se busca entre sus regiones.
const indexes = new Map<string, AreaIndex<RegionProperties>>();

export function regionIndexOf(countryCode: string): AreaIndex<RegionProperties> {
  let index = indexes.get(countryCode);
  if (!index) {
    index = createAreaIndex({
      type: 'FeatureCollection',
      features: regionAreas.features.filter((f) => f.properties.country === countryCode),
    });
    indexes.set(countryCode, index);
  }
  return index;
}
