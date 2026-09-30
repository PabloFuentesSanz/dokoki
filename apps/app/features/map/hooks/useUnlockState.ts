import { buildFogLayer, computeUnlockState, type UnlockState } from '@atlas/domain';
import type { FogLayer } from '@atlas/map';
import { useMemo } from 'react';
import { usePhotoLibrary } from '../../photos/store/PhotoLibraryProvider';
import { countryAreas, countryCatalog } from '../services/countries';

/** Estado de desbloqueo y capa de niebla a partir de las fotos leídas. Todo en el móvil. */
export function useUnlockState(): { state: UnlockState; fog: FogLayer } {
  const { assignments } = usePhotoLibrary();
  return useMemo(() => {
    const state = computeUnlockState(assignments, { catalog: countryCatalog });
    return { state, fog: buildFogLayer(state, countryAreas) };
  }, [assignments]);
}
