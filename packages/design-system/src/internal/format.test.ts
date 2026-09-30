import { describe, expect, it } from 'vitest';
import { formatCoordinate, formatMoney } from './format';

describe('formatCoordinate', () => {
  it('usa coma decimal y hemisferios en español', () => {
    expect(formatCoordinate(34.9671, 135.7727)).toBe('34,97° N  135,77° E');
    expect(formatCoordinate(-12.0464, -77.0428)).toBe('12,05° S  77,04° O');
  });
});

describe('formatMoney', () => {
  it('formatea en español con el código ISO detrás', () => {
    expect(formatMoney(1234.5, 'EUR')).toBe('1.234,50 EUR');
    expect(formatMoney(42)).toBe('42,00 EUR');
  });

  it('el yen no lleva decimales', () => {
    expect(formatMoney(4200, 'JPY')).toBe('4.200 JPY');
  });
});
