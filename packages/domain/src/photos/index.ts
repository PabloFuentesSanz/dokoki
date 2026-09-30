/**
 * Fotos → país › región › ciudad › lugar.
 *
 * Todo esto corre en el dispositivo. Las coordenadas GPS de las fotos NUNCA salen del móvil:
 * este módulo solo recibe puntos y devuelve identificadores de lugar, que son lo único que
 * puede sincronizarse.
 */
import { isValidCoordinate, type LatLng } from '../geo';

/** Metadatos mínimos de una foto del carrete, tal como los entrega expo-media-library. */
export interface PhotoMeta {
  /** Id del asset en el carrete (estable en el dispositivo). */
  id: string;
  /** Momento de la captura, epoch en ms. */
  takenAt: number;
  /** GPS del EXIF; null si la foto no lo tiene. */
  location: LatLng | null;
  /** Oculta por el usuario (M3.7): no cuenta para nada, pero nunca se borra del carrete. */
  hidden?: boolean;
}

/** Jerarquía administrativa de un punto. Los ids son estables y no revelan coordenadas. */
export interface ResolvedPlace {
  /** ISO 3166-1 alfa-2. */
  countryCode: string;
  /** ISO 3166-2 cuando existe (JP-26), o id propio del dataset de límites. */
  regionId: string;
  cityId: string;
  /** Lugar concreto (mirador, templo…) si el punto cae en uno conocido. */
  placeId: string | null;
}

/** Resultado de asignar una foto. */
export interface PlaceAssignment extends ResolvedPlace {
  photoId: string;
  takenAt: number;
  /** gps: detectado por el EXIF. manual: corregido por el usuario (M3.4b, M3.5). */
  source: 'gps' | 'manual';
}

/**
 * Busca a qué área administrativa pertenece un punto. Lo implementa la app con límites
 * administrativos descargados en el dispositivo; el dominio solo conoce la interfaz.
 */
export interface PlaceResolver {
  resolve(point: LatLng): ResolvedPlace | null;
}

export interface AssignBatchOptions {
  /**
   * Caché por celda compartida entre lotes. Una importación de 15.000 fotos tiene muchísimas
   * ráfagas en el mismo sitio: con la caché, la búsqueda punto-en-polígono se hace una vez por celda.
   */
  cache?: Map<string, ResolvedPlace | null>;
  /** Correcciones del usuario por id de foto. Siempre mandan sobre el GPS. */
  overrides?: ReadonlyMap<string, ResolvedPlace>;
}

export interface AssignBatchResult {
  assignments: PlaceAssignment[];
  /** Fotos visibles que van a la bandeja "Sin ubicación" (M3.5). */
  unlocated: string[];
}

/** 3 decimales ≈ 110 m en el ecuador: suficiente para ciudad y región, y agrupa ráfagas. */
const CELL_PRECISION = 1000;

function cellKey(point: LatLng): string {
  return `${Math.round(point.lat * CELL_PRECISION)}:${Math.round(point.lng * CELL_PRECISION)}`;
}

/**
 * Asigna un lote de fotos a su lugar.
 *
 * Algoritmo (un lote = una página de expo-media-library, ~500 fotos, para no bloquear la UI):
 * 1. Descarta las fotos ocultas.
 * 2. Si el usuario corrigió la foto, usa su corrección (source 'manual') y termina.
 * 3. Sin GPS válido (null, fuera de rango o la "isla nula" 0,0) → bandeja Sin ubicación.
 * 4. Redondea el punto a una celda de ~110 m y consulta la caché; si no está, pregunta al
 *    PlaceResolver y guarda también los fallos (null) para no repetirlos.
 * 5. Si el punto no cae en ningún territorio (mar abierto) → bandeja Sin ubicación.
 *
 * Coste: O(n) sobre el lote más una búsqueda por celda distinta.
 *
 * TODO(M0.6): implementar el PlaceResolver real en la app: límites administrativos
 *   (geoBoundaries / Natural Earth simplificados, empaquetados por país) indexados con un
 *   R-tree en expo-sqlite, con búsqueda punto-en-polígono en un worker nativo.
 *   Objetivo HU-06: ≥ 98 % de fotos en el país correcto y ≥ 95 % en la región correcta.
 * TODO(M0.6): lugares (placeId) a partir de un índice local de POIs; hoy depende del resolver.
 */
export function assignPhotosToBatch(
  photos: readonly PhotoMeta[],
  resolver: PlaceResolver,
  options: AssignBatchOptions = {},
): AssignBatchResult {
  const cache = options.cache ?? new Map<string, ResolvedPlace | null>();
  const assignments: PlaceAssignment[] = [];
  const unlocated: string[] = [];

  for (const photo of photos) {
    if (photo.hidden) continue;

    const override = options.overrides?.get(photo.id);
    if (override) {
      assignments.push({
        photoId: photo.id,
        takenAt: photo.takenAt,
        ...override,
        source: 'manual',
      });
      continue;
    }

    if (!photo.location || !isValidCoordinate(photo.location)) {
      unlocated.push(photo.id);
      continue;
    }

    const key = cellKey(photo.location);
    let place = cache.get(key);
    if (place === undefined) {
      place = resolver.resolve(photo.location);
      cache.set(key, place);
    }

    if (place === null) {
      unlocated.push(photo.id);
      continue;
    }

    assignments.push({ photoId: photo.id, takenAt: photo.takenAt, ...place, source: 'gps' });
  }

  return { assignments, unlocated };
}

export interface SuggestOptions {
  /** Distancia temporal máxima a la foto de referencia. 12 h por defecto. */
  windowMs?: number;
}

const DEFAULT_SUGGEST_WINDOW_MS = 12 * 60 * 60 * 1000;

/**
 * Sugerencia para una foto sin GPS (M3.5, HU-19): el lugar de la foto localizada más cercana
 * en el tiempo, si está dentro de la ventana. A igual distancia gana la anterior.
 */
export function suggestPlaceByTime(
  takenAt: number,
  located: readonly PlaceAssignment[],
  options: SuggestOptions = {},
): ResolvedPlace | null {
  const windowMs = options.windowMs ?? DEFAULT_SUGGEST_WINDOW_MS;
  let best: PlaceAssignment | null = null;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (const candidate of located) {
    const distance = Math.abs(candidate.takenAt - takenAt);
    const closer = distance < bestDistance;
    const tieButEarlier =
      distance === bestDistance && best !== null && candidate.takenAt < best.takenAt;
    if (closer || tieButEarlier) {
      best = candidate;
      bestDistance = distance;
    }
  }

  if (best === null || bestDistance > windowMs) return null;
  const { countryCode, regionId, cityId, placeId } = best;
  return { countryCode, regionId, cityId, placeId };
}

export interface PhotoCluster {
  /** Id estable de la celda: "<fila>:<columna>". */
  id: string;
  /** Centro medio de las fotos de la celda. */
  center: LatLng;
  count: number;
}

/**
 * Agrupa puntos en celdas cuadradas de `cellDegrees` grados para pintarlos en el mapa (M3.3).
 * O(n). Se calcula en el dispositivo: los puntos nunca salen del móvil.
 */
export function clusterPhotos(points: readonly LatLng[], cellDegrees: number): PhotoCluster[] {
  const cells = new Map<string, { lat: number; lng: number; count: number }>();
  for (const point of points) {
    if (!isValidCoordinate(point)) continue;
    const id = `${Math.floor(point.lat / cellDegrees)}:${Math.floor(point.lng / cellDegrees)}`;
    const cell = cells.get(id);
    if (cell) {
      cell.lat += point.lat;
      cell.lng += point.lng;
      cell.count += 1;
    } else {
      cells.set(id, { lat: point.lat, lng: point.lng, count: 1 });
    }
  }
  return [...cells].map(([id, cell]) => ({
    id,
    center: { lat: cell.lat / cell.count, lng: cell.lng / cell.count },
    count: cell.count,
  }));
}
