/** Ciudades de GeoNames (≥ 15.000 habitantes, CC BY 4.0), en el dispositivo. */
import { createNearestIndex } from '@atlas/domain';
import rawCities from '../data/cities.json';
import { isRecord } from './geodata';

export interface City {
  id: string;
  name: string;
  country: string;
  lat: number;
  lng: number;
  population: number;
}

export function toCities(json: unknown): City[] {
  if (!isRecord(json) || !Array.isArray(json.rows))
    throw new Error('Formato de ciudades no válido');
  return json.rows.map((row: unknown): City => {
    if (!Array.isArray(row)) throw new Error('Fila de ciudad no válida');
    const [id, name, country, lat, lng, population] = row;
    if (typeof id !== 'string' || typeof name !== 'string' || typeof country !== 'string')
      throw new Error('Ciudad sin id, nombre o país');
    if (typeof lat !== 'number' || typeof lng !== 'number' || typeof population !== 'number')
      throw new Error('Ciudad sin coordenadas');
    return { id, name, country, lat, lng, population };
  });
}

export const cities = toCities(rawCities);
export const cityIndex = createNearestIndex(cities);
const byId = new Map(cities.map((city) => [city.id, city]));

export function cityById(id: string): City | undefined {
  return byId.get(id);
}

export function cityName(id: string): string {
  return byId.get(id)?.name ?? id;
}

const normalize = (text: string): string =>
  text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

const searchable = cities
  .map((city) => ({ city, key: normalize(city.name) }))
  .sort((a, b) => b.city.population - a.city.population);

/** Ciudades cuyo nombre empieza (o, si no hay, contiene) el texto. Las más pobladas primero. */
export function searchCities(query: string, limit = 8): City[] {
  const q = normalize(query);
  if (q.length === 0) return [];
  const starts = searchable.filter((s) => s.key.startsWith(q));
  const pool = starts.length > 0 ? starts : searchable.filter((s) => s.key.includes(q));
  return pool.slice(0, limit).map((s) => s.city);
}
