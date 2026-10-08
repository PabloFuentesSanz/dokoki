import {
  detectTrips,
  mergeTrips,
  splitTrip,
  tripFromPhotos,
  type DetectedTrip,
  type TripPhoto,
} from '@atlas/domain';
import { useCallback, useMemo } from 'react';
import { cityName } from '../../map/services/cities';
import { countryName } from '../../map/services/countries';
import { regionName } from '../../map/services/regions';
import { usePhotoLibrary } from '../../photos/store/PhotoLibraryProvider';
import { toHomeBases } from '../../settings/services/bases';
import { useSettings } from '../../settings/store/SettingsProvider';
import { hideTrip, lockTrips, setNote, visibleTrips } from '../services/tripEdits';
import { homeBaseFrom, toTripPhotos } from '../services/tripInputs';
import { useTripEdits } from '../store/TripEditsProvider';

/** Un viaje necesita al menos estas fotos: una foto suelta en una excursión no es un viaje. */
const MIN_TRIP_PHOTOS = 3;

export interface TripActions {
  rename: (trip: DetectedTrip, name: string) => Promise<void>;
  confirm: (trip: DetectedTrip) => Promise<void>;
  merge: (a: DetectedTrip, b: DetectedTrip) => Promise<void>;
  /** Divide antes del instante `at`: lo anterior queda en un viaje y el resto en otro. */
  split: (trip: DetectedTrip, at: number) => Promise<void>;
  dismiss: (trip: DetectedTrip) => Promise<void>;
  /** Crea un viaje con las fotos con lugar entre dos instantes (incluidos). */
  create: (from: number, until: number, name?: string) => Promise<DetectedTrip | null>;
  /** Escribe una nota a mano (del viaje o de un día). Escribir confirma el viaje. */
  note: (trip: DetectedTrip, key: string, text: string) => Promise<void>;
}

export interface TripsResult extends TripActions {
  /** Del más reciente al más antiguo. */
  trips: DetectedTrip[];
  /** true si aún no has elegido ninguna base: sin base no se pueden detectar viajes. */
  needsBase: boolean;
  /** Ciudad sugerida como base: la que tiene más fotos (HU-04). */
  suggestedCityId: string | null;
  tripPhotos: readonly TripPhoto[];
  /** Notas a mano por clave (`<idViaje>` o `<idViaje>@<día>`). */
  notes: Readonly<Record<string, string>>;
}

/**
 * Viajes (HU-21, HU-22): detectados solos como periodos lejos de tus bases (un hueco de más de
 * 2 días sin fotos o volver a casa los cortan), más lo que has corregido o creado a mano, que
 * queda bloqueado. Todo se calcula en el móvil.
 */
export function useTrips(): TripsResult {
  const { photos, assignments } = usePhotoLibrary();
  const { bases } = useSettings();
  const { edits, update } = useTripEdits();

  const tripPhotos = useMemo(
    () =>
      toTripPhotos(photos, assignments, {
        city: cityName,
        region: regionName,
        country: countryName,
      }),
    [photos, assignments],
  );

  const { trips, needsBase, suggestedCityId } = useMemo(() => {
    const suggested = homeBaseFrom(photos, assignments)?.cityId ?? null;
    if (bases.length === 0) {
      return {
        trips: visibleTrips([...edits.locked].reverse(), edits),
        needsBase: true,
        suggestedCityId: suggested,
      };
    }
    const detected = detectTrips(tripPhotos, toHomeBases(bases), {
      minPhotos: MIN_TRIP_PHOTOS,
      locked: [...edits.locked, ...edits.hidden],
    });
    return {
      trips: visibleTrips(detected, edits).reverse(),
      needsBase: false,
      suggestedCityId: suggested,
    };
  }, [photos, assignments, bases, tripPhotos, edits]);

  const rename = useCallback(
    (trip: DetectedTrip, name: string) =>
      update((e) => lockTrips(e, [{ ...trip, name }], [trip.id])),
    [update],
  );
  const confirm = useCallback(
    (trip: DetectedTrip) => update((e) => lockTrips(e, [trip], [trip.id])),
    [update],
  );
  const merge = useCallback(
    (a: DetectedTrip, b: DetectedTrip) =>
      update((e) => lockTrips(e, [mergeTrips([a, b])], [a.id, b.id])),
    [update],
  );
  const split = useCallback(
    (trip: DetectedTrip, at: number) =>
      update((e) => lockTrips(e, splitTrip(trip, tripPhotos, at), [trip.id])),
    [update, tripPhotos],
  );
  const dismiss = useCallback((trip: DetectedTrip) => update((e) => hideTrip(e, trip)), [update]);
  const create = useCallback(
    async (from: number, until: number, name?: string) => {
      const inRange = tripPhotos.filter((p) => p.takenAt >= from && p.takenAt <= until);
      if (inRange.length === 0) return null;
      const trip = tripFromPhotos(inRange, name);
      // Las fotos pasan al viaje nuevo: se quitan de los viajes bloqueados que las tuvieran.
      const ids = new Set(trip.photoIds);
      await update((e) => {
        const touched = e.locked
          .filter((t) => t.photoIds.some((id) => ids.has(id)))
          .map((t) => t.id);
        return lockTrips(e, [trip], touched);
      });
      return trip;
    },
    [tripPhotos, update],
  );

  const note = useCallback(
    (trip: DetectedTrip, key: string, text: string) =>
      update((e) => setNote(lockTrips(e, [trip], [trip.id]), key, text)),
    [update],
  );

  return {
    trips,
    needsBase,
    notes: edits.notes,
    note,
    suggestedCityId,
    tripPhotos,
    rename,
    confirm,
    merge,
    split,
    dismiss,
    create,
  };
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** "abril 2024, 9 días, 312 fotos". */
export function tripMeta(trip: DetectedTrip): string {
  const month = new Date(trip.startAt).toLocaleDateString('es-ES', {
    month: 'long',
    year: 'numeric',
  });
  const days = Math.max(1, Math.round((trip.endAt - trip.startAt) / DAY_MS) + 1);
  return `${month}, ${days} ${days === 1 ? 'día' : 'días'}, ${trip.photoIds.length} fotos`;
}
