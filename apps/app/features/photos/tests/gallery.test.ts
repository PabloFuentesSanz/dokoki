import type { PlaceAssignment } from '@atlas/domain';
import { describe, expect, it } from 'vitest';
import {
  gridRows,
  monthSections,
  parseScope,
  placeFolders,
  selectPhotos,
} from '../services/gallery';

const at = (month: number, day = 15) => Date.UTC(2024, month, day, 12);
const photo = (
  id: string,
  takenAt: number,
  countryCode: string,
  cityId: string | null = null,
): PlaceAssignment => ({
  photoId: id,
  takenAt,
  countryCode,
  regionId: null,
  cityId,
  placeId: null,
  source: 'gps',
});

const ALL = [
  photo('a', at(3, 1), 'JP', 'kyoto'),
  photo('b', at(3, 2), 'JP', 'nara'),
  photo('c', at(3, 3), 'JP', 'kyoto'),
  photo('d', at(5), 'IT', 'rome'),
  photo('e', at(6), 'FR'),
  photo('f', at(3, 4), 'JP', null),
];

describe('parseScope', () => {
  it('lee el ámbito de la ruta y cae en todas si no lo entiende', () => {
    expect(parseScope('country:JP')).toEqual({ kind: 'country', id: 'JP' });
    expect(parseScope('city:123')).toEqual({ kind: 'city', id: '123' });
    expect(parseScope('trip:t-1:2')).toEqual({ kind: 'trip', id: 't-1:2' });
    expect(parseScope(undefined)).toEqual({ kind: 'all' });
    expect(parseScope('planeta:x')).toEqual({ kind: 'all' });
  });
});

describe('selectPhotos', () => {
  it('filtra por país, ciudad o ids de un viaje, de la más reciente a la más antigua', () => {
    expect(selectPhotos(ALL, { kind: 'country', id: 'JP' }).map((p) => p.photoId)).toEqual([
      'f',
      'c',
      'b',
      'a',
    ]);
    expect(selectPhotos(ALL, { kind: 'city', id: 'kyoto' }).map((p) => p.photoId)).toEqual([
      'c',
      'a',
    ]);
    expect(
      selectPhotos(ALL, { kind: 'trip', id: 't' }, new Set(['a', 'd'])).map((p) => p.photoId),
    ).toEqual(['d', 'a']);
    expect(selectPhotos(ALL, { kind: 'all' })).toHaveLength(6);
  });
});

describe('placeFolders', () => {
  it('una carpeta por país, con más fotos primero, sus ciudades y tres portadas recientes', () => {
    expect(placeFolders(ALL)).toEqual([
      { code: 'JP', count: 4, cityCount: 2, coverIds: ['f', 'c', 'b'] },
      { code: 'IT', count: 1, cityCount: 1, coverIds: ['d'] },
      { code: 'FR', count: 1, cityCount: 0, coverIds: ['e'] },
    ]);
  });
});

describe('monthSections y gridRows', () => {
  it('agrupa por mes y parte cada mes en filas de N columnas con su cabecera', () => {
    const sections = monthSections(selectPhotos(ALL, { kind: 'all' }));
    expect(sections.map((s) => [s.key, s.ids])).toEqual([
      ['2024-07', ['e']],
      ['2024-06', ['d']],
      ['2024-04', ['f', 'c', 'b', 'a']],
    ]);
    expect(sections[2]?.title).toBe('abril de 2024');

    const rows = gridRows(sections.slice(2), 3);
    expect(rows).toEqual([
      { type: 'header', key: 'h-2024-04', title: 'abril de 2024', count: 4 },
      { type: 'photos', key: '2024-04-0', ids: ['f', 'c', 'b'] },
      { type: 'photos', key: '2024-04-1', ids: ['a'] },
    ]);
  });
});
