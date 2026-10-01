/**
 * Búsqueda punto-en-polígono sobre límites administrativos, en el dispositivo (HU-06).
 * Sin red: el dataset viaja dentro de la app.
 */
import type { Feature, FeatureCollection, MultiPolygon, Polygon, Position } from 'geojson';
import type { LatLng } from './coords';

type AreaGeometry = Polygon | MultiPolygon;

/** Ray casting sobre un anillo [lng, lat]. */
function inRing(point: LatLng, ring: readonly Position[]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i, i += 1) {
    // Number() convierte el índice opcional en número sin ramas: GeoJSON garantiza [lng, lat].
    const xi = Number(ring[i]?.[0]);
    const yi = Number(ring[i]?.[1]);
    const xj = Number(ring[j]?.[0]);
    const yj = Number(ring[j]?.[1]);
    const crosses = yi > point.lat !== yj > point.lat;
    if (crosses && point.lng < ((xj - xi) * (point.lat - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/** Dentro del anillo exterior y fuera de los agujeros. */
function inPolygon(point: LatLng, rings: readonly Position[][]): boolean {
  const [outer, ...holes] = rings;
  if (!outer || !inRing(point, outer)) return false;
  return !holes.some((hole) => inRing(point, hole));
}

export function pointInGeometry(point: LatLng, geometry: AreaGeometry): boolean {
  if (geometry.type === 'Polygon') return inPolygon(point, geometry.coordinates);
  return geometry.coordinates.some((polygon) => inPolygon(point, polygon));
}

interface Indexed<P> {
  feature: Feature<AreaGeometry, P>;
  west: number;
  south: number;
  east: number;
  north: number;
  area: number;
}

export interface AreaIndex<P> {
  /** El área más pequeña que contiene el punto (así un enclave gana a quien lo rodea), o null. */
  find(point: LatLng): Feature<AreaGeometry, P> | null;
}

/**
 * Índice con caja envolvente por área: descarta casi todas las áreas con 4 comparaciones y solo
 * hace punto-en-polígono con las candidatas. Suficiente para ~250 países; para regiones y
 * ciudades se pasará a un R-tree en expo-sqlite.
 */
export function createAreaIndex<P>(collection: FeatureCollection<AreaGeometry, P>): AreaIndex<P> {
  const entries: Indexed<P>[] = collection.features.map((feature) => {
    let west = Infinity;
    let south = Infinity;
    let east = -Infinity;
    let north = -Infinity;
    const polygons =
      feature.geometry.type === 'Polygon'
        ? [feature.geometry.coordinates]
        : feature.geometry.coordinates;
    for (const ring of polygons.flat()) {
      for (const position of ring) {
        const lng = Number(position[0]);
        const lat = Number(position[1]);
        west = Math.min(west, lng);
        east = Math.max(east, lng);
        south = Math.min(south, lat);
        north = Math.max(north, lat);
      }
    }
    return { feature, west, south, east, north, area: (east - west) * (north - south) };
  });
  // Las cajas pequeñas primero: el primer acierto es el área más pequeña.
  entries.sort((a, b) => a.area - b.area);

  return {
    find(point) {
      for (const entry of entries) {
        if (
          point.lng < entry.west ||
          point.lng > entry.east ||
          point.lat < entry.south ||
          point.lat > entry.north
        )
          continue;
        if (pointInGeometry(point, entry.feature.geometry)) return entry.feature;
      }
      return null;
    },
  };
}
