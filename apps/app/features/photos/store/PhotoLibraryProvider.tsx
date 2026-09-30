import { assignPhotosToBatch, type PlaceAssignment, type ResolvedPlace } from '@atlas/domain';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Platform } from 'react-native';
import { PLACES_VERSION, placeResolver } from '../../map/services/places';
import {
  expoPhotoSource,
  hasPhotoAccess,
  pickMorePhotos,
  requestPhotoAccess,
  type PhotoAccess,
} from '../services/expoPhotoSource';
import {
  sqlitePhotoStore,
  toAssignments,
  withPlaces,
  type PhotoStoreMeta,
  type StoredPhoto,
} from '../services/photoStore';
import { scanLibrary, type LocatedPhoto, type ScanProgress } from '../services/scanLibrary';

export type LibraryStatus =
  'loading' | 'idle' | 'requesting' | 'denied' | 'scanning' | 'done' | 'error' | 'unsupported';

export interface PhotoLibraryState {
  status: LibraryStatus;
  access: PhotoAccess | null;
  /** Solo las fotos con GPS. Viven en el dispositivo (memoria + SQLite). */
  photos: readonly LocatedPhoto[];
  /** Lugar de cada foto con GPS, calculado en el móvil (HU-06). */
  assignments: readonly PlaceAssignment[];
  /** Progreso de la última lectura (completa o incremental). */
  progress: ScanProgress | null;
  /** Total de fotos leídas alguna vez, con y sin GPS. */
  scannedTotal: number;
  /** true si la última lectura solo buscó fotos nuevas. */
  incremental: boolean;
  error: string | null;
}

interface PhotoLibraryContextValue extends PhotoLibraryState {
  /** Pide permiso si hace falta y lee el carrete. `full` descarta lo guardado y lo lee todo. */
  scan: (options?: { full?: boolean }) => Promise<void>;
  cancel: () => void;
  pickMore: () => Promise<void>;
}

const INITIAL: PhotoLibraryState = {
  status: Platform.OS === 'web' ? 'unsupported' : 'loading',
  access: null,
  photos: [],
  assignments: [],
  progress: null,
  scannedTotal: 0,
  incremental: false,
  error: null,
};

const PhotoLibraryContext = createContext<PhotoLibraryContextValue | null>(null);

const message = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

/**
 * Estado del carrete compartido por todas las pestañas.
 * Al abrir: carga lo guardado en SQLite al instante y, si ya hay permiso, lee solo las fotos
 * nuevas (HU-07). Si cambian los datos geográficos, reasigna lo guardado sin releer el carrete.
 */
export function PhotoLibraryProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PhotoLibraryState>(INITIAL);
  const controller = useRef<AbortController | null>(null);
  const meta = useRef<PhotoStoreMeta>({
    newestTakenAt: null,
    scannedCount: 0,
    placesVersion: null,
  });

  const runScan = useCallback(async (access: PhotoAccess, full: boolean) => {
    controller.current?.abort();
    const abort = new AbortController();
    controller.current = abort;

    if (full) {
      await sqlitePhotoStore.clear();
      meta.current = { newestTakenAt: null, scannedCount: 0, placesVersion: PLACES_VERSION };
    }
    const since = meta.current.newestTakenAt ?? undefined;
    const baseCount = meta.current.scannedCount;
    setState((s) => ({
      ...s,
      status: 'scanning',
      access,
      incremental: since !== undefined,
      progress: null,
      ...(full ? { photos: [], assignments: [], scannedTotal: 0 } : {}),
    }));

    // Caché por celda compartida entre páginas: las ráfagas no repiten la búsqueda.
    const cache = new Map<string, ResolvedPlace | null>();
    const result = await scanLibrary(expoPhotoSource, {
      since,
      signal: abort.signal,
      onProgress: (progress, page) => {
        const { assignments } = assignPhotosToBatch(page, placeResolver, { cache });
        void sqlitePhotoStore.save(withPlaces(page, assignments));
        setState((s) => {
          // Una lectura retomada tras una pausa puede repetir fotos ya guardadas.
          const known = new Set(s.photos.map((p) => p.id));
          return {
            ...s,
            progress,
            scannedTotal: baseCount + progress.scanned,
            photos: [...s.photos, ...page.filter((p) => !known.has(p.id))],
            assignments: [...s.assignments, ...assignments.filter((a) => !known.has(a.photoId))],
          };
        });
      },
    });

    // Solo avanzamos la marca si la lectura terminó: una pausa se retoma desde el mismo punto.
    if (!result.cancelled) {
      meta.current = {
        newestTakenAt: result.newestTakenAt ?? meta.current.newestTakenAt,
        scannedCount: baseCount + result.scanned,
        placesVersion: PLACES_VERSION,
      };
      await sqlitePhotoStore.saveMeta(meta.current);
    }
    setState((s) => ({ ...s, status: result.cancelled ? 'idle' : 'done' }));
  }, []);

  // Arranque: lo guardado primero, luego las fotos nuevas en segundo plano.
  useEffect(() => {
    if (Platform.OS === 'web') return;
    let cancelled = false;
    void (async () => {
      try {
        const loaded = await sqlitePhotoStore.load();
        let photos: StoredPhoto[] = loaded.photos;
        if (photos.length > 0 && loaded.meta.placesVersion !== PLACES_VERSION) {
          // Nuevos datos geográficos: reasignar desde las coordenadas guardadas.
          const { assignments } = assignPhotosToBatch(photos, placeResolver);
          photos = withPlaces(photos, assignments);
          await sqlitePhotoStore.save(photos);
          await sqlitePhotoStore.saveMeta({ ...loaded.meta, placesVersion: PLACES_VERSION });
        }
        meta.current = { ...loaded.meta, placesVersion: PLACES_VERSION };
        if (cancelled) return;
        setState((s) => ({
          ...s,
          status: photos.length > 0 || loaded.meta.scannedCount > 0 ? 'done' : 'idle',
          photos,
          assignments: toAssignments(photos),
          scannedTotal: loaded.meta.scannedCount,
        }));

        const access = await hasPhotoAccess();
        if (!cancelled && access && loaded.meta.newestTakenAt !== null)
          await runScan(access, false);
      } catch (error: unknown) {
        if (!cancelled) setState((s) => ({ ...s, status: 'error', error: message(error) }));
      }
    })();
    return () => {
      cancelled = true;
      controller.current?.abort();
    };
  }, [runScan]);

  const scan = useCallback(
    async ({ full = false }: { full?: boolean } = {}) => {
      if (Platform.OS === 'web') return;
      setState((s) => ({ ...s, status: 'requesting', error: null }));
      try {
        const access = await requestPhotoAccess();
        if (access === 'denied') {
          setState((s) => ({ ...s, status: 'denied', access }));
          return;
        }
        await runScan(access, full);
      } catch (error: unknown) {
        setState((s) => ({ ...s, status: 'error', error: message(error) }));
      }
    },
    [runScan],
  );

  const cancel = useCallback(() => controller.current?.abort(), []);

  const pickMore = useCallback(async () => {
    await pickMorePhotos();
    await scan({ full: true });
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
