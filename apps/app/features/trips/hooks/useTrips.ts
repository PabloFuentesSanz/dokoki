import { detectTrips, type DetectedTrip } from '@atlas/domain';
import { useMemo } from 'react';
import { cityName } from '../../map/services/cities';
import { countryName } from '../../map/services/countries';
import { regionName } from '../../map/services/regions';
import { usePhotoLibrary } from '../../photos/store/PhotoLibraryProvider';
import { homeBaseFrom, toTripPhotos } from '../services/tripInputs';

/** Un viaje necesita al menos estas fotos: una foto suelta en una excursión no es un viaje. */
const MIN_TRIP_PHOTOS = 3;

export interface TripsResult {
  /** Del más reciente al más antiguo. */
  trips: DetectedTrip[];
  homeCityId: string | null;
}

/**
 * Viajes detectados solos (HU-21): periodos lejos de tu base; un hueco de más de 2 días sin
 * fotos o volver a casa cortan el viaje. Todo se calcula en el móvil.
 * TODO(M3.6, HU-22): confirmar, fusionar, dividir y renombrar, y guardar lo corregido.
 */
export function useTrips(): TripsResult {
  const { photos, assignments } = usePhotoLibrary();
  return useMemo(() => {
    const home = homeBaseFrom(photos, assignments);
    if (!home) return { trips: [], homeCityId: null };
    const tripPhotos = toTripPhotos(photos, assignments, {
      city: cityName,
      region: regionName,
      country: countryName,
    });
    const trips = detectTrips(tripPhotos, home, { minPhotos: MIN_TRIP_PHOTOS }).reverse();
    return { trips, homeCityId: home.cityId };
  }, [photos, assignments]);
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
