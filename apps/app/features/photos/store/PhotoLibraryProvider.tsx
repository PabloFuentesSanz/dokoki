import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { assignPhotosToBatch, type PlaceAssignment, type ResolvedPlace } from '@atlas/domain';
import { Platform } from 'react-native';
import { countryResolver } from '../../map/services/countries';
import {
  expoPhotoSource,
  pickMorePhotos,
  requestPhotoAccess,
  type PhotoAccess,
} from '../services/expoPhotoSource';
import { scanLibrary, type LocatedPhoto, type ScanProgress } from '../services/scanLibrary';

export type LibraryStatus =
  'idle' | 'requesting' | 'denied' | 'scanning' | 'done' | 'error' | 'unsupported';

export interface PhotoLibraryState {
  status: LibraryStatus;
  access: PhotoAccess | null;
  /** Solo las fotos con GPS. Viven en memoria, en el dispositivo. */
  photos: readonly LocatedPhoto[];
  /** País de cada foto con GPS, calculado en el móvil (HU-06). */
  assignments: readonly PlaceAssignment[];
  progress: ScanProgress | null;
  error: string | null;
}

interface PhotoLibraryContextValue extends PhotoLibraryState {
  /** Pide permiso (si hace falta) y lee todo el carrete. */
  scan: () => Promise<void>;
  cancel: () => void;
  pickMore: () => Promise<void>;
}

const INITIAL: PhotoLibraryState = {
  status: Platform.OS === 'web' ? 'unsupported' : 'idle',
  access: null,
  photos: [],
  assignments: [],
  progress: null,
  error: null,
};

const PhotoLibraryContext = createContext<PhotoLibraryContextValue | null>(null);

/**
 * Estado del carrete compartido por las pestañas Fotos y Mapa.
 * TODO(M3.8): guardar el índice en expo-sqlite para no releer el carrete en cada arranque
 * y procesar solo las fotos nuevas (HU-07).
 */
export function PhotoLibraryProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PhotoLibraryState>(INITIAL);
  const controller = useRef<AbortController | null>(null);

  const scan = useCallback(async () => {
    if (Platform.OS === 'web') return;
    setState((s) => ({ ...s, status: 'requesting', error: null }));
    try {
      const access = await requestPhotoAccess();
      if (access === 'denied') {
        setState((s) => ({ ...s, status: 'denied', access }));
        return;
      }
      controller.current?.abort();
      const abort = new AbortController();
      controller.current = abort;
      setState((s) => ({
        ...s,
        status: 'scanning',
        access,
        photos: [],
        assignments: [],
        progress: null,
      }));

      // Caché por celda compartida entre páginas: las ráfagas no repiten la búsqueda.
      const cache = new Map<string, ResolvedPlace | null>();
      const result = await scanLibrary(expoPhotoSource, {
        signal: abort.signal,
        onProgress: (progress, page) => {
          const { assignments } = assignPhotosToBatch(page, countryResolver, { cache });
          setState((s) => ({
            ...s,
            progress,
            photos: [...s.photos, ...page],
            assignments: [...s.assignments, ...assignments],
          }));
        },
      });
      setState((s) => ({ ...s, status: result.cancelled ? 'idle' : 'done' }));
    } catch (error: unknown) {
      setState((s) => ({
        ...s,
        status: 'error',
        error: error instanceof Error ? error.message : String(error),
      }));
    }
  }, []);

  const cancel = useCallback(() => controller.current?.abort(), []);

  const pickMore = useCallback(async () => {
    await pickMorePhotos();
    await scan();
  }, [scan]);

  const value = useMemo(
    () => ({ ...state, scan, cancel, pickMore }),
    [state, scan, cancel, pickMore],
  );
  return <PhotoLibraryContext.Provider value={value}>{children}</PhotoLibraryContext.Provider>;
}

export function usePhotoLibrary(): PhotoLibraryContextValue {
  const value = useContext(PhotoLibraryContext);
  if (!value) throw new Error('usePhotoLibrary necesita <PhotoLibraryProvider>.');
  return value;
}
