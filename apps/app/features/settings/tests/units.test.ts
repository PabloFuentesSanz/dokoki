import { describe, expect, it } from 'vitest';
import { formatDistance, parseUnit } from '../services/units';

describe('unidades', () => {
  it('kilómetros por defecto', () => {
    expect(parseUnit('mi')).toBe('mi');
    expect(parseUnit('pies')).toBe('km');
  });

  it('formatea en km o millas', () => {
    expect(formatDistance(505, 'km')).toEqual({ value: '505', label: 'km' });
    expect(formatDistance(1609.344, 'mi')).toEqual({ value: '1000', label: 'millas' });
  });
});
