import {
  assignPhotosToBatch,
  type LatLng,
  type PlaceAssignment,
  type ResolvedPlace,
} from '@atlas/domain';
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
  SCAN_SCHEMA,
  sqlitePhotoStore,
  toAssignments,
  withPlaces,
  type PhotoStoreMeta,
  type StoredPhoto,
} from '../services/photoStore';
import {
  scanLibrary,
  type LocatedPhoto,
  type ScanProgress,
  type UnlocatedPhoto,
} from '../services/scanLibrary';

export type LibraryStatus =
  'loading' | 'idle' | 'requesting' | 'denied' | 'scanning' | 'done' | 'error' | 'unsupported';

export interface PhotoLibraryState {
  status: LibraryStatus;
  access: PhotoAccess | null;
  /** Fotos con ubicación (del GPS o puesta a mano). Viven en el dispositivo (memoria + SQLite). */
  photos: readonly LocatedPhoto[];
  /** Lugar de cada foto con ubicación, calculado en el móvil (HU-06). */
  assignments: readonly PlaceAssignment[];
  /** Fotos sin ubicación, ordenadas por fecha: la bandeja de M3.5. */
  unlocated: readonly UnlocatedPhoto[];
  /** Progreso de la última lectura (completa o incremental). */
  progress: ScanProgress | null;
  /** Total de fotos leídas alguna vez, con y sin GPS. */
  scannedTotal: number;
  /** true si la última lectura solo buscó fotos nuevas. */
  incremental: boolean;
  error: string | null;
}

interface PhotoLibraryContextValue extends PhotoLibraryState {
  /** Pide permiso si hace falta y lee el carrete. `full` relee todo (lo puesto a mano se queda). */
  scan: (options?: { full?: boolean }) => Promise<void>;
  cancel: () => void;
  pickMore: () => Promise<void>;
  /** Da ubicación a fotos de la bandeja (M3.5, HU-19). Se guarda como ubicación manual. */
  assignLocations: (
    items: readonly { ids: readonly string[]; location: LatLng }[],
  ) => Promise<void>;
}

const INITIAL: PhotoLibraryState = {
  status: Platform.OS === 'web' ? 'unsupported' : 'loading',
  access: null,
  photos: [],
  assignments: [],
  unlocated: [],
  progress: null,
  scannedTotal: 0,
  incremental: false,
  error: null,
};

const PhotoLibraryContext = createContext<PhotoLibraryContextValue | null>(null);

const message = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

const byTakenAt = (a: { takenAt: number }, b: { takenAt: number }): number => a.takenAt - b.takenAt;

/**
 * Estado del carrete compartido por todas las pestañas.
 * Al abrir: carga lo guardado en SQLite al instante y, si ya hay permiso, lee solo las fotos
 * nuevas (HU-07). Si cambian los datos geográficos, reasigna lo guardado sin releer el carrete.
 * Si lo guardado es de un esquema anterior (sin la bandeja de fotos sin ubicación), relee todo
 * una vez, sin perder lo puesto a mano.
 */
export function PhotoLibraryProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PhotoLibraryState>(INITIAL);
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  });
  const controller = useRef<AbortController | null>(null);
  const meta = useRef<PhotoStoreMeta>({
    newestTakenAt: null,
    scannedCount: 0,
    placesVersion: null,
  });
  /** Ids con ubicación puesta a mano: una relectura nunca los devuelve a la bandeja. */
  const manualIds = useRef(new Set<string>());

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
    setState((s) => {
      const keep = full ? s.photos.filter((p) => manualIds.current.has(p.id)) : s.photos;
      const keepIds = new Set(keep.map((p) => p.id));
      return {
        ...s,
        status: 'scanning',
        access,
        incremental: since !== undefined,
        progress: null,
        ...(full
          ? {
              photos: keep,
              assignments: s.assignments.filter((a) => keepIds.has(a.photoId)),
              unlocated: [],
              scannedTotal: 0,
            }
          : {}),
      };
    });

    // Caché por celda compartida entre páginas: las ráfagas no repiten la búsqueda.
    const cache = new Map<string, ResolvedPlace | null>();
    const result = await scanLibrary(expoPhotoSource, {
      since,
      signal: abort.signal,
      onProgress: (progress, page, pageUnlocated) => {
        const { assignments } = assignPhotosToBatch(page, placeResolver, { cache });
        const freshUnlocated = pageUnlocated.filter((u) => !manualIds.current.has(u.id));
        void sqlitePhotoStore.save(withPlaces(page, assignments));
        void sqlitePhotoStore.saveUnlocated(freshUnlocated);
        setState((s) => {
          // Una lectura retomada tras una pausa puede repetir fotos ya guardadas.
          const known = new Set(s.photos.map((p) => p.id));
          const knownUnlocated = new Set(s.unlocated.map((u) => u.id));
          return {
            ...s,
            progress,
            scannedTotal: baseCount + progress.scanned,
            photos: [...s.photos, ...page.filter((p) => !known.has(p.id))],
            assignments: [...s.assignments, ...assignments.filter((a) => !known.has(a.photoId))],
            unlocated: [...s.unlocated, ...freshUnlocated.filter((u) => !knownUnlocated.has(u.id))],
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
        schema: SCAN_SCHEMA,
      };
      await sqlitePhotoStore.saveMeta(meta.current);
    }
    setState((s) => ({
      ...s,
      status: result.cancelled ? 'idle' : 'done',
      unlocated: [...s.unlocated].sort(byTakenAt),
    }));
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
          // withPlaces conserva el resto de campos de cada foto, incluido `manual`.
          photos = withPlaces(photos, assignments);
          await sqlitePhotoStore.save(photos);
          await sqlitePhotoStore.saveMeta({ ...loaded.meta, placesVersion: PLACES_VERSION });
        }
        manualIds.current = new Set(photos.filter((p) => p.manual).map((p) => p.id));
        meta.current = { ...loaded.meta, placesVersion: PLACES_VERSION };
        if (cancelled) return;
        setState((s) => ({
          ...s,
          status: photos.length > 0 || loaded.meta.scannedCount > 0 ? 'done' : 'idle',
          photos,
          assignments: toAssignments(photos),
          unlocated: loaded.unlocated,
          scannedTotal: loaded.meta.scannedCount,
        }));

        const access = await hasPhotoAccess();
        if (cancelled || !access || loaded.meta.newestTakenAt === null) return;
        // Esquema antiguo: relectura completa una vez para llenar la bandeja sin ubicación.
        await runScan(access, (loaded.meta.schema ?? 1) < SCAN_SCHEMA);
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

  const assignLocations = useCallback(
    async (items: readonly { ids: readonly string[]; location: LatLng }[]) => {
      const takenAt = new Map(stateRef.current.unlocated.map((u) => [u.id, u.takenAt]));
      const rows: StoredPhoto[] = [];
      for (const { ids, location } of items) {
        const place = placeResolver.resolve(location);
        for (const id of ids) {
          const at = takenAt.get(id);
          if (at === undefined) continue;
          rows.push({
            id,
            takenAt: at,
            location,
            countryCode: place?.countryCode ?? null,
            regionId: place?.regionId ?? null,
            cityId: place?.cityId ?? null,
            manual: true,
          });
        }
      }
      if (rows.length === 0) return;
      const moved = new Set(rows.map((r) => r.id));
      for (const id of moved) manualIds.current.add(id);
      setState((s) => ({
        ...s,
        unlocated: s.unlocated.filter((u) => !moved.has(u.id)),
        photos: [
          ...s.photos,
          ...rows.map(({ id, takenAt: at, location }) => ({ id, takenAt: at, location })),
        ].sort(byTakenAt),
        assignments: [...s.assignments, ...toAssignments(rows)],
      }));
      await sqlitePhotoStore.assignManual(rows);
    },
    [],
  );

  const value = useMemo(
    () => ({ ...state, scan, cancel, pickMore, assignLocations }),
    [state, scan, cancel, pickMore, assignLocations],
  );
  return <PhotoLibraryContext.Provider value={value}>{children}</PhotoLibraryContext.Provider>;
}

export function usePhotoLibrary(): PhotoLibraryContextValue {
  const value = useContext(PhotoLibraryContext);
  if (!value) throw new Error('usePhotoLibrary necesita <PhotoLibraryProvider>.');
  return value;
}
