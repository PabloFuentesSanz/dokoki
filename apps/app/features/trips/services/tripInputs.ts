/** Prepara las fotos asignadas para `detectTrips` (@atlas/domain/trips). Todo en el móvil. */
import type { HomeBase, LatLng, PlaceAssignment, TripPhoto } from '@atlas/domain';

interface Located {
  id: string;
  takenAt: number;
  location: LatLng;
}

export interface PlaceNames {
  city(id: string): string;
  region(id: string): string;
  country(code: string): string;
}

/** Cada foto con su lugar más fino conocido: ciudad, si no región, si no país. */
export function toTripPhotos(
  photos: readonly Located[],
  assignments: readonly PlaceAssignment[],
  names: PlaceNames,
): TripPhoto[] {
  const byId = new Map(assignments.map((a) => [a.photoId, a]));
  const out: TripPhoto[] = [];
  for (const photo of photos) {
    const place = byId.get(photo.id);
    if (!place) continue;
    const [cityId, cityName] = place.cityId
      ? [place.cityId, names.city(place.cityId)]
      : place.regionId
        ? [place.regionId, names.region(place.regionId)]
        : [place.countryCode, names.country(place.countryCode)];
    out.push({
      id: photo.id,
      takenAt: photo.takenAt,
      location: photo.location,
      countryCode: place.countryCode,
      cityId,
      cityName,
    });
  }
  return out;
}

/**
 * Base propuesta (HU-04): la ciudad con más fotos, en el centro de sus fotos.
 * Es la sugerencia de base de la bienvenida (M0.5); la persona la confirma o la cambia.
 */
export function homeBaseFrom(
  photos: readonly Located[],
  assignments: readonly PlaceAssignment[],
): (HomeBase & { cityId: string }) | null {
  const byId = new Map(photos.map((p) => [p.id, p]));
  const cities = new Map<string, { count: number; lat: number; lng: number }>();
  for (const a of assignments) {
    const photo = byId.get(a.photoId);
    if (!a.cityId || !photo) continue;
    const city = cities.get(a.cityId) ?? { count: 0, lat: 0, lng: 0 };
    city.count += 1;
    city.lat += photo.location.lat;
    city.lng += photo.location.lng;
    cities.set(a.cityId, city);
  }
  let best: [string, { count: number; lat: number; lng: number }] | null = null;
  for (const entry of cities) if (!best || entry[1].count > best[1].count) best = entry;
  if (!best) return null;
  const [cityId, { count, lat, lng }] = best;
  return { cityId, location: { lat: lat / count, lng: lng / count } };
}
