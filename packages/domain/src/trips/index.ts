/**
 * Detección automática de viajes (HU-21, HU-22).
 *
 * Un viaje es un periodo lejos de la base del usuario; un hueco de más de N días sin fotos
 * (2 por defecto) o una foto hecha en casa lo cortan. Lo que el usuario corrige queda
 * bloqueado y ninguna importación posterior lo vuelve a tocar.
 */
import { haversineKm, type LatLng } from '../geo';

const DAY_MS = 24 * 60 * 60 * 1000;

/** Foto ya asignada a una ciudad (salida de photos/assignPhotosToBatch + nombres del catálogo). */
export interface TripPhoto {
  id: string;
  takenAt: number;
  location: LatLng;
  countryCode: string;
  cityId: string;
  cityName: string;
}

/** Dónde vive el usuario (M0.5). */
export interface HomeBase {
  location: LatLng;
  /** Desde cuándo es tu base (epoch ms). Sin valor: desde siempre. */
  from?: number;
  /** Hasta cuándo fue tu base (epoch ms). Sin valor: hasta hoy. */
  until?: number;
  /** Radio a partir del cual se considera "fuera de casa". 50 km por defecto. */
  radiusKm?: number;
}

export interface TripCity {
  cityId: string;
  cityName: string;
  photoCount: number;
}

export interface DetectedTrip {
  /** Estable: `trip-<startAt>`. */
  id: string;
  startAt: number;
  endAt: number;
  /** En orden cronológico. */
  photoIds: string[];
  /** ISO alfa-2, en orden de llegada. */
  countryCodes: string[];
  /** En orden de llegada. */
  cities: TripCity[];
  /** Nombre propuesto: "Kioto, Nara y Osaka". */
  name: string;
  coverPhotoId: string;
  /** true si el usuario lo confirmó, fusionó, dividió o renombró. */
  locked: boolean;
}

export interface DetectTripsOptions {
  /** Hueco máximo sin fotos dentro de un viaje. 2 días por defecto. */
  maxGapDays?: number;
  /** Fotos mínimas para proponer un viaje. 1 por defecto. */
  minPhotos?: number;
  /** Viajes bloqueados: se devuelven tal cual y sus fotos no se vuelven a agrupar. */
  locked?: readonly DetectedTrip[];
}

const DEFAULT_HOME_RADIUS_KM = 50;

type NonEmpty<T> = readonly [T, ...T[]];

function isNonEmpty<T>(items: readonly T[]): items is NonEmpty<T> {
  return items.length > 0;
}

/** Las 3 ciudades con más fotos (a igualdad, la primera en llegar), en orden de llegada. */
function proposeName(cities: readonly TripCity[]): string {
  const top = cities
    .map((city, order) => ({ city, order }))
    .sort((a, b) => b.city.photoCount - a.city.photoCount || a.order - b.order)
    .slice(0, 3)
    .sort((a, b) => a.order - b.order)
    .map(({ city }) => city.cityName);
  if (top.length <= 1) return top.join('');
  return `${top.slice(0, -1).join(', ')} y ${top[top.length - 1]}`;
}

/** Construye un viaje a partir de sus fotos, ya ordenadas y no vacías. */
function buildTrip(photos: NonEmpty<TripPhoto>, locked: boolean): DetectedTrip {
  const [first] = photos;

  const cities = new Map<string, TripCity & { firstPhotoId: string }>();
  const countryCodes: string[] = [];
  for (const photo of photos) {
    if (!countryCodes.includes(photo.countryCode)) countryCodes.push(photo.countryCode);
    const city = cities.get(photo.cityId);
    if (city) city.photoCount += 1;
    else
      cities.set(photo.cityId, {
        cityId: photo.cityId,
        cityName: photo.cityName,
        photoCount: 1,
        firstPhotoId: photo.id,
      });
  }

  const cityList = [...cities.values()];
  const cover = cityList.reduce((best, city) => (city.photoCount > best.photoCount ? city : best));

  const tripCities = cityList.map(({ cityId, cityName, photoCount }) => ({
    cityId,
    cityName,
    photoCount,
  }));
  return {
    id: `trip-${first.takenAt}`,
    startAt: first.takenAt,
    endAt: photos.reduce((max, photo) => Math.max(max, photo.takenAt), first.takenAt),
    photoIds: photos.map((photo) => photo.id),
    countryCodes,
    cities: tripCities,
    name: proposeName(tripCities),
    coverPhotoId: cover.firstPhotoId,
    locked,
  };
}

/**
 * ¿Estaba en casa? Cerca de alguna base vigente en la fecha de la foto. Se puede tener varias
 * bases a la vez (casa y pueblo) o sucesivas (Madrid hasta 2019, después Barcelona).
 */
export function isAtHome(
  photo: Pick<TripPhoto, 'location' | 'takenAt'>,
  homes: readonly HomeBase[],
): boolean {
  return homes.some(
    (home) =>
      (home.from === undefined || photo.takenAt >= home.from) &&
      (home.until === undefined || photo.takenAt <= home.until) &&
      haversineKm(photo.location, home.location) <= (home.radiusKm ?? DEFAULT_HOME_RADIUS_KM),
  );
}

/**
 * Agrupa las fotos en viajes.
 *
 * Algoritmo: ordena por fecha y recorre una vez (O(n log n) por la ordenación).
 * - Foto a más de `radiusKm` de la base → pertenece a un viaje.
 * - Foto en casa → cierra el viaje en curso.
 * - Hueco mayor que `maxGapDays` desde la foto anterior del viaje → cierra y abre otro.
 * Los viajes bloqueados se respetan tal cual y se devuelve todo ordenado por inicio.
 */
export function detectTrips(
  photos: readonly TripPhoto[],
  home: HomeBase | readonly HomeBase[],
  options: DetectTripsOptions = {},
): DetectedTrip[] {
  const maxGapMs = (options.maxGapDays ?? 2) * DAY_MS;
  const minPhotos = options.minPhotos ?? 1;
  const homes: readonly HomeBase[] = Array.isArray(home) ? home : [home];
  // Sin base no se puede saber qué es un viaje.
  if (homes.length === 0) return [...(options.locked ?? [])];
  const locked = options.locked ?? [];
  const lockedPhotoIds = new Set(locked.flatMap((trip) => trip.photoIds));

  const sorted = photos
    .filter((photo) => !lockedPhotoIds.has(photo.id))
    .sort((a, b) => a.takenAt - b.takenAt);

  const trips: DetectedTrip[] = [...locked];
  let current: TripPhoto[] = [];
  const close = (): void => {
    if (isNonEmpty(current) && current.length >= minPhotos) trips.push(buildTrip(current, false));
    current = [];
  };

  for (const photo of sorted) {
    const away = !isAtHome(photo, homes);
    if (!away) {
      close();
      continue;
    }
    const previous = current[current.length - 1];
    if (previous && photo.takenAt - previous.takenAt > maxGapMs) close();
    current.push(photo);
  }
  close();

  return trips.sort((a, b) => a.startAt - b.startAt);
}

/** Fusiona dos o más viajes en uno (M3.6, M4.4). El resultado queda bloqueado. */
export function mergeTrips(trips: readonly DetectedTrip[]): DetectedTrip {
  const ordered = [...trips].sort((a, b) => a.startAt - b.startAt);
  if (trips.length < 2 || !isNonEmpty(ordered)) {
    throw new RangeError('Para fusionar hacen falta al menos dos viajes.');
  }
  const [first] = ordered;

  const cities = new Map<string, TripCity>();
  const countryCodes: string[] = [];
  for (const trip of ordered) {
    for (const code of trip.countryCodes) if (!countryCodes.includes(code)) countryCodes.push(code);
    for (const city of trip.cities) {
      const existing = cities.get(city.cityId);
      if (existing) existing.photoCount += city.photoCount;
      else cities.set(city.cityId, { ...city });
    }
  }

  // Portada: la del viaje con más fotos (a igualdad, el primero).
  const biggest = ordered.reduce((best, trip) =>
    trip.photoIds.length > best.photoIds.length ? trip : best,
  );
  const mergedCities = [...cities.values()];

  return {
    id: first.id,
    startAt: first.startAt,
    endAt: Math.max(...ordered.map((trip) => trip.endAt)),
    photoIds: ordered.flatMap((trip) => trip.photoIds),
    countryCodes,
    cities: mergedCities,
    name: proposeName(mergedCities),
    coverPhotoId: biggest.coverPhotoId,
    locked: true,
  };
}

/**
 * Divide un viaje en dos por un instante (M3.6, M4.4): lo anterior a `splitAt` queda en el
 * primero y el resto en el segundo. Ambos quedan bloqueados.
 */
export function splitTrip(
  trip: DetectedTrip,
  photos: readonly TripPhoto[],
  splitAt: number,
): [DetectedTrip, DetectedTrip] {
  const ids = new Set(trip.photoIds);
  const own = photos.filter((photo) => ids.has(photo.id)).sort((a, b) => a.takenAt - b.takenAt);
  const before = own.filter((photo) => photo.takenAt < splitAt);
  const after = own.filter((photo) => photo.takenAt >= splitAt);
  if (!isNonEmpty(before) || !isNonEmpty(after)) {
    throw new RangeError('El corte tiene que dejar fotos en los dos viajes.');
  }
  return [buildTrip(before, true), buildTrip(after, true)];
}
