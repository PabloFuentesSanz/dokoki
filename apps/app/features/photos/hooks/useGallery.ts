import type { PlaceAssignment } from '@atlas/domain';
import { useMemo } from 'react';
import { cityName } from '../../map/services/cities';
import { countryName } from '../../map/services/countries';
import { regionName } from '../../map/services/regions';
import { useTrips } from '../../trips/hooks/useTrips';
import { parseScope, selectPhotos, type GalleryScope } from '../services/gallery';
import { usePhotoLibrary } from '../store/PhotoLibraryProvider';

export interface Gallery {
  scope: GalleryScope;
  /** Título de la galería: país, ciudad, viaje o "Todas tus fotos". */
  title: string;
  /** Las más recientes primero. */
  photos: PlaceAssignment[];
}

/** Fotos de un ámbito de ruta (`country:JP`, `city:<id>`, `trip:<id>` o todas). */
export function useGallery(rawScope: string | undefined): Gallery {
  const { assignments } = usePhotoLibrary();
  const { trips } = useTrips();
  return useMemo(() => {
    const scope = parseScope(rawScope);
    const trip = scope.kind === 'trip' ? trips.find((t) => t.id === scope.id) : undefined;
    const title =
      scope.kind === 'country'
        ? countryName(scope.id)
        : scope.kind === 'region'
          ? regionName(scope.id)
          : scope.kind === 'city'
            ? cityName(scope.id)
            : scope.kind === 'trip'
              ? (trip?.name ?? 'Viaje')
              : 'Todas tus fotos';
    return { scope, title, photos: selectPhotos(assignments, scope, new Set(trip?.photoIds)) };
  }, [rawScope, assignments, trips]);
}
