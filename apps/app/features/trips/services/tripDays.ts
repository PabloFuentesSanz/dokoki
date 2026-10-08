import { haversineKm, type LatLng, type TripPhoto } from '@atlas/domain';

export interface TripDay {
  /** aaaa-mm-dd, en hora local. */
  key: string;
  date: number;
  /** Ciudades del día, en el orden en que se visitaron. */
  cities: string[];
  /** Fotos del día, en orden. */
  photoIds: string[];
}

const dayKey = (ms: number): string => {
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

/** M4.2 · Día a día: las fotos de un viaje agrupadas por día, con sus ciudades. */
export function tripDays(photoIds: readonly string[], photos: readonly TripPhoto[]): TripDay[] {
  const byId = new Map(photos.map((p) => [p.id, p]));
  const ordered = photoIds
    .flatMap((id) => {
      const p = byId.get(id);
      return p ? [p] : [];
    })
    .sort((a, b) => a.takenAt - b.takenAt);
  const days: TripDay[] = [];
  for (const p of ordered) {
    const key = dayKey(p.takenAt);
    let day = days.at(-1);
    if (day?.key !== key) {
      day = { key, date: p.takenAt, cities: [], photoIds: [] };
      days.push(day);
    }
    day.photoIds.push(p.id);
    if (day.cities.at(-1) !== p.cityName) day.cities.push(p.cityName);
  }
  for (const day of days) day.cities = [...new Set(day.cities)];
  return days;
}

/** Kilómetros en línea recta de una ciudad a la siguiente, redondeados. */
export function routeKm(points: readonly LatLng[]): number {
  let km = 0;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    if (a && b) km += haversineKm(a, b);
  }
  return Math.round(km);
}
