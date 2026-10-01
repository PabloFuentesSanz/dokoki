import { describe, expect, it } from 'vitest';
import { createNearestIndex } from './nearest';

const cities = [
  { id: 'kyoto', country: 'JP', lat: 35.021, lng: 135.754 },
  { id: 'nara', country: 'JP', lat: 34.685, lng: 135.805 },
  { id: 'osaka', country: 'JP', lat: 34.694, lng: 135.502 },
  { id: 'reykjavik', country: 'IS', lat: 64.135, lng: -21.895 },
];

describe('createNearestIndex', () => {
  const index = createNearestIndex(cities);

  it('devuelve el punto más cercano dentro del radio', () => {
    expect(index.nearest({ lat: 34.69, lng: 135.84 }, 50)?.id).toBe('nara');
    expect(index.nearest({ lat: 35.0, lng: 135.77 }, 50)?.id).toBe('kyoto');
  });

  it('nada si el más cercano está más lejos que el radio', () => {
    expect(index.nearest({ lat: 40, lng: -40 }, 50)).toBeNull();
    expect(index.nearest({ lat: 35.5, lng: 135.754 }, 20)).toBeNull();
  });

  it('puede filtrar candidatos (p. ej. solo ciudades del mismo país)', () => {
    expect(index.nearest({ lat: 34.69, lng: 135.84 }, 100, (c) => c.id !== 'nara')?.id).toBe(
      'osaka',
    );
  });

  it('funciona en latitudes altas y cruzando celdas', () => {
    expect(index.nearest({ lat: 64.2, lng: -21.5 }, 50)?.id).toBe('reykjavik');
  });
});
