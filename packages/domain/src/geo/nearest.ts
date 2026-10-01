/**
 * Punto más cercano con una rejilla: para asignar cada foto a su ciudad sin recorrer las
 * ~24.000 ciudades en cada búsqueda.
 */
import { haversineKm, type LatLng } from './coords';

const KM_PER_DEGREE = 111.32;

export interface NearestIndex<T extends LatLng> {
  /** El elemento más cercano a menos de `maxKm`, opcionalmente filtrado, o null. */
  nearest(point: LatLng, maxKm: number, accept?: (item: T) => boolean): T | null;
}

export function createNearestIndex<T extends LatLng>(
  items: readonly T[],
  cellDegrees = 0.5,
): NearestIndex<T> {
  const key = (row: number, col: number): string => `${row}:${col}`;
  const cells = new Map<string, T[]>();
  for (const item of items) {
    const k = key(Math.floor(item.lat / cellDegrees), Math.floor(item.lng / cellDegrees));
    const cell = cells.get(k);
    if (cell) cell.push(item);
    else cells.set(k, [item]);
  }

  return {
    nearest(point, maxKm, accept) {
      const latSpan = maxKm / KM_PER_DEGREE;
      const lngSpan =
        maxKm / (KM_PER_DEGREE * Math.max(Math.cos((point.lat * Math.PI) / 180), 0.01));
      const firstRow = Math.floor((point.lat - latSpan) / cellDegrees);
      const lastRow = Math.floor((point.lat + latSpan) / cellDegrees);
      const firstCol = Math.floor((point.lng - lngSpan) / cellDegrees);
      const lastCol = Math.floor((point.lng + lngSpan) / cellDegrees);

      let best: T | null = null;
      let bestKm = maxKm;
      for (let row = firstRow; row <= lastRow; row += 1) {
        for (let col = firstCol; col <= lastCol; col += 1) {
          for (const item of cells.get(key(row, col)) ?? []) {
            const km = haversineKm(point, item);
            if (km <= bestKm && (!accept || accept(item))) {
              best = item;
              bestKm = km;
            }
          }
        }
      }
      return best;
    },
  };
}
