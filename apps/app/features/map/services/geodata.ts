/** Validación de los JSON geográficos empaquetados (sin `any` ni conversiones a ciegas). */
import type { Feature, FeatureCollection, MultiPolygon, Polygon } from 'geojson';

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function toGeometry(value: unknown): Polygon | MultiPolygon {
  if (!isRecord(value) || !Array.isArray(value.coordinates)) throw new Error('Geometría no válida');
  if (value.type === 'Polygon') return { type: 'Polygon', coordinates: value.coordinates };
  if (value.type === 'MultiPolygon')
    return { type: 'MultiPolygon', coordinates: value.coordinates };
  throw new Error(`Geometría no soportada: ${String(value.type)}`);
}

/** Convierte un JSON en una FeatureCollection tipada; `readProps` valida cada feature. */
export function toAreaCollection<P>(
  json: unknown,
  readProps: (properties: Record<string, unknown>) => P,
): FeatureCollection<Polygon | MultiPolygon, P> {
  if (!isRecord(json) || !Array.isArray(json.features))
    throw new Error('No es una FeatureCollection');
  const features = json.features.map((feature: unknown): Feature<Polygon | MultiPolygon, P> => {
    if (!isRecord(feature) || !isRecord(feature.properties))
      throw new Error('Feature sin propiedades');
    return {
      type: 'Feature',
      geometry: toGeometry(feature.geometry),
      properties: readProps(feature.properties),
    };
  });
  return { type: 'FeatureCollection', features };
}

export function readString(properties: Record<string, unknown>, key: string): string {
  const value = properties[key];
  if (typeof value !== 'string') throw new Error(`Falta "${key}"`);
  return value;
}
