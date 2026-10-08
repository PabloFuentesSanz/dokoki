import type { ManualMark } from '@atlas/domain';
import { isRecord } from '../../map/services/geodata';

/** Marcas a mano (M1.4c): países y regiones donde estuviste sin fotos que lo prueben. */
export function parseMarks(value: unknown): ManualMark[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((m): ManualMark[] => {
    if (!isRecord(m) || typeof m.countryCode !== 'string') return [];
    const visitedAt = typeof m.visitedAt === 'number' ? m.visitedAt : null;
    if (m.level === 'country') return [{ level: 'country', countryCode: m.countryCode, visitedAt }];
    if (m.level === 'region' && typeof m.regionId === 'string') {
      return [{ level: 'region', countryCode: m.countryCode, regionId: m.regionId, visitedAt }];
    }
    return [];
  });
}

/** Clave de una marca: un mismo país o región no se marca dos veces. */
export function markKey(mark: ManualMark): string {
  return mark.level === 'country'
    ? `country:${mark.countryCode}`
    : `${mark.level}:${mark.regionId}`;
}

/** Añade (o sustituye) una marca. */
export function addMark(marks: readonly ManualMark[], mark: ManualMark): ManualMark[] {
  return [...marks.filter((m) => markKey(m) !== markKey(mark)), mark];
}

/** Quita la marca de esa clave (`country:JP`, `region:JP-26`). */
export function removeMark(marks: readonly ManualMark[], key: string): ManualMark[] {
  return marks.filter((m) => markKey(m) !== key);
}

/** 1 de julio del año dado: fecha aproximada de una marca con solo año. */
export function yearToDate(year: number | null): number | null {
  return year === null ? null : new Date(year, 6, 1).getTime();
}
