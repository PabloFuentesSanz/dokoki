import type { PlaceAssignment } from '@atlas/domain';
import type { LocatedPhoto } from './scanLibrary';

export interface StoredPhoto extends LocatedPhoto {
  countryCode: string | null;
  regionId: string | null;
  cityId: string | null;
}

export interface PhotoStoreMeta {
  /** Foto más reciente ya leída (con o sin GPS): la próxima lectura empieza aquí. */
  newestTakenAt: number | null;
  /** Total de fotos leídas del carrete, con y sin GPS. */
  scannedCount: number;
  /** Versión de los datos geográficos con los que se asignaron los lugares. */
  placesVersion: string | null;
}

export interface PhotoStore {
  load(): Promise<{ photos: StoredPhoto[]; meta: PhotoStoreMeta }>;
  save(photos: readonly StoredPhoto[]): Promise<void>;
  saveMeta(meta: PhotoStoreMeta): Promise<void>;
  clear(): Promise<void>;
}

/** Une cada foto con su lugar asignado (o null si cae en el mar o fuera de los datos). */
export function withPlaces(
  photos: readonly LocatedPhoto[],
  assignments: readonly PlaceAssignment[],
): StoredPhoto[] {
  const byId = new Map(assignments.map((a) => [a.photoId, a]));
  return photos.map((photo) => {
    const place = byId.get(photo.id);
    return {
      ...photo,
      countryCode: place?.countryCode ?? null,
      regionId: place?.regionId ?? null,
      cityId: place?.cityId ?? null,
    };
  });
}

/** Asignaciones a partir de lo guardado, sin volver a buscar lugares. */
export function toAssignments(photos: readonly StoredPhoto[]): PlaceAssignment[] {
  const out: PlaceAssignment[] = [];
  for (const p of photos) {
    if (p.countryCode === null) continue;
    out.push({
      photoId: p.id,
      takenAt: p.takenAt,
      countryCode: p.countryCode,
      regionId: p.regionId,
      cityId: p.cityId,
      placeId: null,
      source: 'gps',
    });
  }
  return out;
}
