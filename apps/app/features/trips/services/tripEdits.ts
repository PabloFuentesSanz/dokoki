/**
 * Correcciones de viajes (HU-22): lo que la persona confirma, renombra, fusiona, divide, crea o
 * descarta queda bloqueado y ninguna lectura posterior lo vuelve a tocar.
 */
import type { DetectedTrip, TripCity } from '@atlas/domain';

export interface TripEdits {
  /** Viajes corregidos o creados a mano: se respetan tal cual. */
  locked: DetectedTrip[];
  /** Viajes descartados ("no es un viaje"): sus fotos no vuelven a formar un viaje. */
  hidden: DetectedTrip[];
  /** Notas a mano (M4.2): `<idViaje>` para el viaje, `<idViaje>@<aaaa-mm-dd>` para un día. */
  notes: Record<string, string>;
}

export const EMPTY_EDITS: TripEdits = { locked: [], hidden: [], notes: {} };

/** Escribe (o borra, si queda vacía) una nota. */
export function setNote(edits: TripEdits, key: string, text: string): TripEdits {
  const clean = text.trim();
  const others = Object.entries(edits.notes).filter(([k]) => k !== key);
  return {
    ...edits,
    notes: Object.fromEntries(clean.length === 0 ? others : [...others, [key, clean]]),
  };
}

/** Añade `trips` bloqueados en lugar de los viajes con id en `replaces`. */
export function lockTrips(
  edits: TripEdits,
  trips: readonly DetectedTrip[],
  replaces: readonly string[],
): TripEdits {
  const gone = new Set([...replaces, ...trips.map((t) => t.id)]);
  return {
    ...edits,
    locked: [
      ...edits.locked.filter((t) => !gone.has(t.id)),
      ...trips.map((t) => ({ ...t, locked: true })),
    ],
    hidden: edits.hidden.filter((t) => !gone.has(t.id)),
  };
}

export function hideTrip(edits: TripEdits, trip: DetectedTrip): TripEdits {
  return {
    ...edits,
    locked: edits.locked.filter((t) => t.id !== trip.id),
    hidden: [...edits.hidden.filter((t) => t.id !== trip.id), { ...trip, locked: true }],
  };
}

/** Lo que se muestra: lo detectado (que ya incluye lo bloqueado) menos lo descartado. */
export function visibleTrips(trips: readonly DetectedTrip[], edits: TripEdits): DetectedTrip[] {
  const hidden = new Set(edits.hidden.map((t) => t.id));
  return trips.filter((t) => !hidden.has(t.id));
}

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;
const isStringArray = (v: unknown): v is string[] =>
  Array.isArray(v) && v.every((x) => typeof x === 'string');

function parseCity(v: unknown): TripCity | null {
  if (!isRecord(v)) return null;
  const { cityId, cityName, photoCount } = v;
  return typeof cityId === 'string' &&
    typeof cityName === 'string' &&
    typeof photoCount === 'number'
    ? { cityId, cityName, photoCount }
    : null;
}

function parseTrip(v: unknown): DetectedTrip | null {
  if (!isRecord(v)) return null;
  const { id, startAt, endAt, photoIds, countryCodes, cities, name, coverPhotoId } = v;
  if (typeof id !== 'string' || typeof name !== 'string' || typeof coverPhotoId !== 'string')
    return null;
  if (typeof startAt !== 'number' || typeof endAt !== 'number') return null;
  if (!isStringArray(photoIds) || !isStringArray(countryCodes) || !Array.isArray(cities))
    return null;
  const parsedCities = cities.map(parseCity);
  if (parsedCities.some((c) => c === null)) return null;
  return {
    id,
    startAt,
    endAt,
    photoIds,
    countryCodes,
    cities: parsedCities.filter((c): c is TripCity => c !== null),
    name,
    coverPhotoId,
    locked: true,
  };
}

function parseList(v: unknown): DetectedTrip[] {
  if (!Array.isArray(v)) return [];
  return v.map(parseTrip).filter((t): t is DetectedTrip => t !== null);
}

export function parseTripEdits(value: unknown): TripEdits {
  if (!isRecord(value)) return EMPTY_EDITS;
  const notes = isRecord(value.notes)
    ? Object.fromEntries(
        Object.entries(value.notes).filter((e): e is [string, string] => typeof e[1] === 'string'),
      )
    : {};
  return { locked: parseList(value.locked), hidden: parseList(value.hidden), notes };
}
