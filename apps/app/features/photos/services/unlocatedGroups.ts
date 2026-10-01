/** Bandeja "Sin ubicación" (M3.5, HU-19): fotos agrupadas por día con una sugerencia de lugar. */
import { nearestInTime, type LatLng } from '@atlas/domain';
import type { LocatedPhoto, UnlocatedPhoto } from './scanLibrary';

export interface DayGroup {
  /** "AAAA-MM-DD" en la hora local del móvil. */
  key: string;
  ids: string[];
  /** Punto medio del día de fotos: referencia para buscar una foto con GPS cercana. */
  middleAt: number;
}

export interface Suggestion {
  /** La foto con GPS de la que se toma la ubicación. */
  photoId: string;
  location: LatLng;
  /** Distancia en el tiempo a esa foto. */
  gapMs: number;
}

/** Ventana para sugerir: una foto con GPS a más de 12 h no dice dónde estabas. */
export const SUGGESTION_WINDOW_MS = 12 * 60 * 60 * 1000;

const pad = (n: number): string => String(n).padStart(2, '0');

/**
 * Agrupa por día local. `timezoneOffsetMinutes` es el de `Date#getTimezoneOffset()`
 * (UTC+2 → -120); se pasa para poder probarlo sin depender de la zona del entorno.
 */
export function groupByDay(
  photos: readonly UnlocatedPhoto[],
  timezoneOffsetMinutes: number = new Date().getTimezoneOffset(),
): DayGroup[] {
  const groups = new Map<string, { ids: string[]; first: number; last: number }>();
  for (const photo of photos) {
    const local = new Date(photo.takenAt - timezoneOffsetMinutes * 60_000);
    const key = `${local.getUTCFullYear()}-${pad(local.getUTCMonth() + 1)}-${pad(local.getUTCDate())}`;
    const group = groups.get(key);
    if (group) {
      group.ids.push(photo.id);
      group.first = Math.min(group.first, photo.takenAt);
      group.last = Math.max(group.last, photo.takenAt);
    } else {
      groups.set(key, { ids: [photo.id], first: photo.takenAt, last: photo.takenAt });
    }
  }
  return [...groups]
    .map(([key, g]) => ({ key, ids: g.ids, middleAt: g.first + (g.last - g.first) / 2 }))
    .sort((a, b) => (a.key < b.key ? 1 : -1));
}

/** Sugerencia para un día: la foto con GPS más cercana en el tiempo (lista ordenada por fecha). */
export function suggestionFor(
  group: DayGroup,
  sortedLocated: readonly LocatedPhoto[],
): Suggestion | null {
  const nearest = nearestInTime(group.middleAt, sortedLocated, SUGGESTION_WINDOW_MS);
  if (!nearest) return null;
  return {
    photoId: nearest.id,
    location: nearest.location,
    gapMs: Math.abs(nearest.takenAt - group.middleAt),
  };
}
