import { describe, expect, it } from 'vitest';
import { addMark, markKey, parseMarks, removeMark, yearToDate } from '../services/marks';

describe('marcas a mano', () => {
  it('lee solo marcas válidas', () => {
    expect(
      parseMarks([
        { level: 'country', countryCode: 'PE', visitedAt: 5 },
        { level: 'region', countryCode: 'JP', regionId: 'JP-26' },
        { level: 'region', countryCode: 'JP' },
        { level: 'planet', countryCode: 'XX' },
        'basura',
      ]),
    ).toEqual([
      { level: 'country', countryCode: 'PE', visitedAt: 5 },
      { level: 'region', countryCode: 'JP', regionId: 'JP-26', visitedAt: null },
    ]);
    expect(parseMarks(null)).toEqual([]);
  });

  it('añade sin duplicar y quita por clave', () => {
    const pe = { level: 'country', countryCode: 'PE', visitedAt: null } as const;
    const marks = addMark(addMark([], pe), { ...pe, visitedAt: 1 });
    expect(marks).toEqual([{ ...pe, visitedAt: 1 }]);
    expect(markKey(pe)).toBe('country:PE');
    expect(removeMark(marks, 'country:PE')).toEqual([]);
  });

  it('un año se guarda como mitad de año', () => {
    expect(new Date(yearToDate(2019) ?? 0).getFullYear()).toBe(2019);
    expect(yearToDate(null)).toBeNull();
  });
});
