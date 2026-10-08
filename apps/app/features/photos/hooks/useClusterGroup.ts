import { clusterCellId, type PlaceAssignment } from '@atlas/domain';
import { useMemo } from 'react';
import { cityName } from '../../map/services/cities';
import { countryName } from '../../map/services/countries';
import { photoDays } from '../services/photoDays';
import { usePhotoLibrary } from '../store/PhotoLibraryProvider';

export interface ClusterGroup {
  title: string;
  meta: string;
  /** Las más recientes primero. */
  photos: PlaceAssignment[];
  /** Si todo el grupo es de una ciudad, su id (para abrir su ficha). */
  cityId: string | null;
}

/** M3.3b · Fotos de un grupo del mapa: las de su celda de la rejilla. Todo en el móvil. */
export function useClusterGroup(
  clusterId: string | null,
  cellDegrees: number,
  until?: number,
): ClusterGroup | null {
  const { photos, assignments } = usePhotoLibrary();
  return useMemo(() => {
    if (clusterId === null) return null;
    const ids = new Set(
      photos
        .filter(
          (p) =>
            (until === undefined || p.takenAt <= until) &&
            clusterCellId(p.location, cellDegrees) === clusterId,
        )
        .map((p) => p.id),
    );
    const group = assignments
      .filter((a) => ids.has(a.photoId))
      .sort((a, b) => b.takenAt - a.takenAt);
    const counts = new Map<string, number>();
    for (const a of group) {
      if (a.cityId !== null) counts.set(a.cityId, (counts.get(a.cityId) ?? 0) + 1);
    }
    const top = [...counts].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
    const first = group[0];
    const title = top
      ? `${cityName(top)}${counts.size > 1 ? ' y alrededores' : ''}`
      : first
        ? countryName(first.countryCode)
        : 'Fotos';
    const days = photoDays(group);
    return {
      title,
      meta: `${group.length.toLocaleString('es-ES')} ${group.length === 1 ? 'foto' : 'fotos'}, ${days} ${days === 1 ? 'día' : 'días'}`,
      photos: group,
      cityId: counts.size === 1 ? top : null,
    };
  }, [clusterId, cellDegrees, until, photos, assignments]);
}
