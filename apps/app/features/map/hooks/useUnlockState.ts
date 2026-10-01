import { buildFogLayer, computeUnlockState, type UnlockState } from '@atlas/domain';
import type { FogLayer } from '@atlas/map';
import { useMemo } from 'react';
import { usePhotoLibrary } from '../../photos/store/PhotoLibraryProvider';
import { countryAreas } from '../services/countries';
import { placesCatalog } from '../services/places';
import { regionAreas } from '../services/regions';

/**
 * Estado de desbloqueo y capa de niebla a partir de las fotos leídas. Todo en el móvil.
 * Con `until` (viaje en el tiempo, M1.3) solo cuenta lo visitado hasta ese instante.
 * La niebla lleva todos los países y solo las regiones de los países visitados: el resto de
 * regiones queda bajo la niebla de su país y así no se mandan 2 MB al mapa.
 */
export function useUnlockState(options: { until?: number } = {}): {
  state: UnlockState;
  fog: FogLayer;
} {
  const { until } = options;
  const { assignments } = usePhotoLibrary();
  const state = useMemo(
    () =>
      computeUnlockState(assignments, {
        catalog: placesCatalog,
        ...(until !== undefined ? { until } : {}),
      }),
    [assignments, until],
  );

  // Clave estable: la niebla solo se recalcula cuando se desbloquea algo nuevo.
  const unlockedKey = `${Object.keys(state.countries).sort().join(',')}|${Object.keys(state.regions).sort().join(',')}`;
  const fog = useMemo(() => {
    const visited = new Set(Object.keys(state.countries));
    return buildFogLayer(state, {
      type: 'FeatureCollection',
      features: [
        ...countryAreas.features,
        ...regionAreas.features.filter((f) => visited.has(f.properties.country)),
      ],
    });
    // Depende solo de qué está desbloqueado, no del recuento de fotos.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unlockedKey]);

  return { state, fog };
}
