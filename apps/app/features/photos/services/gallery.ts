import type { PlaceAssignment } from '@atlas/domain';

/** Qué fotos enseña una galería: todas, las de un país, una ciudad o un viaje. */
export type GalleryScope =
  { kind: 'all' } | { kind: 'country' | 'region' | 'city' | 'trip'; id: string };

/** Lee el ámbito de la ruta (`country:JP`, `region:JP-26`, `city:3117735`, `trip:<id>`). */
export function parseScope(raw: string | undefined): GalleryScope {
  const sep = raw?.indexOf(':') ?? -1;
  if (raw === undefined || sep < 0) return { kind: 'all' };
  const kind = raw.slice(0, sep);
  const id = raw.slice(sep + 1);
  return kind === 'country' || kind === 'region' || kind === 'city' || kind === 'trip'
    ? { kind, id }
    : { kind: 'all' };
}

const newestFirst = (a: PlaceAssignment, b: PlaceAssignment): number => b.takenAt - a.takenAt;

/** Fotos del ámbito, de la más reciente a la más antigua. `tripPhotoIds` solo para viajes. */
export function selectPhotos(
  assignments: readonly PlaceAssignment[],
  scope: GalleryScope,
  tripPhotoIds: ReadonlySet<string> = new Set(),
): PlaceAssignment[] {
  const keep = (a: PlaceAssignment): boolean => {
    switch (scope.kind) {
      case 'all':
        return true;
      case 'country':
        return a.countryCode === scope.id;
      case 'region':
        return a.regionId === scope.id;
      case 'city':
        return a.cityId === scope.id;
      case 'trip':
        return tripPhotoIds.has(a.photoId);
    }
  };
  return assignments.filter(keep).sort(newestFirst);
}

export interface PlaceFolder {
  code: string;
  count: number;
  cityCount: number;
  /** Hasta tres fotos para el mosaico, las más recientes primero. */
  coverIds: string[];
}

/** M3.1 · Fotos por lugar: una carpeta por país, con más fotos primero. */
export function placeFolders(assignments: readonly PlaceAssignment[]): PlaceFolder[] {
  const byCountry = new Map<string, PlaceAssignment[]>();
  for (const a of assignments) {
    const list = byCountry.get(a.countryCode);
    if (list) list.push(a);
    else byCountry.set(a.countryCode, [a]);
  }
  return [...byCountry]
    .map(([code, list]) => ({
      code,
      count: list.length,
      cityCount: new Set(list.flatMap((a) => (a.cityId === null ? [] : [a.cityId]))).size,
      coverIds: [...list]
        .sort(newestFirst)
        .slice(0, 3)
        .map((a) => a.photoId),
    }))
    .sort((a, b) => b.count - a.count);
}

export interface MonthSection {
  /** aaaa-mm */
  key: string;
  /** "abril de 2024" */
  title: string;
  ids: string[];
}

/** M3.2 · Fotos por tiempo: secciones por mes (en hora local), en el orden recibido. */
export function monthSections(
  photos: readonly { photoId: string; takenAt: number }[],
): MonthSection[] {
  const sections: MonthSection[] = [];
  for (const p of photos) {
    const date = new Date(p.takenAt);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const last = sections.at(-1);
    if (last?.key === key) {
      last.ids.push(p.photoId);
    } else {
      sections.push({
        key,
        title: date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }),
        ids: [p.photoId],
      });
    }
  }
  return sections;
}

export type GridRow =
  | { type: 'header'; key: string; title: string; count: number }
  | { type: 'photos'; key: string; ids: string[] };

/** Filas para una lista virtualizada: cabecera de cada mes y filas de `columns` fotos. */
export function gridRows(sections: readonly MonthSection[], columns: number): GridRow[] {
  const rows: GridRow[] = [];
  for (const s of sections) {
    rows.push({ type: 'header', key: `h-${s.key}`, title: s.title, count: s.ids.length });
    for (let i = 0; i < s.ids.length; i += columns) {
      rows.push({
        type: 'photos',
        key: `${s.key}-${i / columns}`,
        ids: s.ids.slice(i, i + columns),
      });
    }
  }
  return rows;
}
