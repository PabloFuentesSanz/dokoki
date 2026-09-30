/**
 * Lectura del carrete (HU-05): lista las fotos por páginas y pide la ubicación de cada una en
 * paralelo. Todo ocurre en el dispositivo: las coordenadas nunca se envían a ningún servidor.
 *
 * La fuente es inyectable para poder probar la lógica sin el módulo nativo
 * (ver `expoPhotoSource.ts` para la real).
 */
import type { LatLng } from '@atlas/domain';

export interface PhotoSource {
  /** Una página de fotos, de la más reciente a la más antigua; con `since`, solo las posteriores. */
  listPage(
    offset: number,
    limit: number,
    since?: number,
  ): Promise<{ id: string; creationTime: number | null }[]>;
  getLocation(id: string): Promise<{ latitude: number; longitude: number } | null>;
}

export interface LocatedPhoto {
  id: string;
  takenAt: number;
  location: LatLng;
}

export interface ScanProgress {
  scanned: number;
  located: number;
  /** Desde el inicio de la lectura. */
  elapsedMs: number;
  /** Tiempo acumulado listando páginas y pidiendo ubicaciones, para la prueba técnica. */
  listMs: number;
  locationMs: number;
}

export type ScanResult = Omit<ScanProgress, 'located'> & {
  located: LocatedPhoto[];
  cancelled: boolean;
  /** Fecha de la foto más reciente leída (con o sin GPS), para la próxima lectura incremental. */
  newestTakenAt: number | null;
};

export interface ScanOptions {
  pageSize?: number;
  /** Peticiones de ubicación simultáneas. */
  concurrency?: number;
  onProgress?: (progress: ScanProgress, page: LocatedPhoto[]) => void;
  signal?: AbortSignal;
  /** Solo fotos creadas después de este instante (epoch ms). */
  since?: number;
}

async function mapLimit<T, R>(
  items: readonly T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array<R>(items.length);
  let next = 0;
  const worker = async (): Promise<void> => {
    while (next < items.length) {
      const index = next;
      next += 1;
      const item = items[index];
      if (item !== undefined) results[index] = await fn(item);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

export async function scanLibrary(
  source: PhotoSource,
  options: ScanOptions = {},
): Promise<ScanResult> {
  const { pageSize = 500, concurrency = 16, onProgress, signal, since } = options;
  const started = Date.now();
  const located: LocatedPhoto[] = [];
  let scanned = 0;
  let listMs = 0;
  let locationMs = 0;
  let newestTakenAt: number | null = null;
  const progress = (): ScanProgress => ({
    scanned,
    located: located.length,
    elapsedMs: Date.now() - started,
    listMs,
    locationMs,
  });

  for (;;) {
    if (signal?.aborted) return { ...progress(), located, cancelled: true, newestTakenAt };

    const listStart = Date.now();
    const page = await source.listPage(scanned, pageSize, since);
    listMs += Date.now() - listStart;
    if (page.length === 0) break;

    const locationStart = Date.now();
    const locations = await mapLimit(page, concurrency, (photo) =>
      source.getLocation(photo.id).catch(() => null),
    );
    locationMs += Date.now() - locationStart;

    const pageLocated: LocatedPhoto[] = [];
    page.forEach((photo, i) => {
      if (
        photo.creationTime !== null &&
        (newestTakenAt === null || photo.creationTime > newestTakenAt)
      ) {
        newestTakenAt = photo.creationTime;
      }
      const loc = locations[i];
      if (loc) {
        pageLocated.push({
          id: photo.id,
          takenAt: photo.creationTime ?? 0,
          location: { lat: loc.latitude, lng: loc.longitude },
        });
      }
    });
    located.push(...pageLocated);
    scanned += page.length;
    onProgress?.(progress(), pageLocated);

    if (page.length < pageSize) break;
  }

  return { ...progress(), located, cancelled: false, newestTakenAt };
}
