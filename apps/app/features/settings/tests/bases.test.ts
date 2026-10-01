import { describe, expect, it } from 'vitest';
import { basePeriod, toHomeBases, type Base } from '../services/bases';

const base = (fromYear: number | null, untilYear: number | null): Base => ({
  id: 'b',
  cityId: 'madrid',
  name: 'Madrid',
  countryCode: 'ES',
  lat: 40.4,
  lng: -3.7,
  fromYear,
  untilYear,
});

describe('bases', () => {
  it('convierte los años en un periodo de fechas para la detección de viajes', () => {
    expect(toHomeBases([base(2015, 2019)])).toEqual([
      {
        location: { lat: 40.4, lng: -3.7 },
        from: Date.UTC(2015, 0, 1),
        until: Date.UTC(2020, 0, 1) - 1,
      },
    ]);
    expect(toHomeBases([base(null, null)])).toEqual([{ location: { lat: 40.4, lng: -3.7 } }]);
  });

  it('describe el periodo en palabras', () => {
    expect(basePeriod(base(2015, 2019))).toBe('2015–2019');
    expect(basePeriod(base(2019, null))).toBe('desde 2019');
    expect(basePeriod(base(null, 2018))).toBe('hasta 2018');
    expect(basePeriod(base(null, null))).toBe('siempre');
  });
});

describe('parseBases', () => {
  it('lee las bases válidas y descarta el resto', async () => {
    const { parseBases } = await import('../services/bases');
    expect(parseBases([base(2015, null), { id: 'x' }, 'basura'])).toEqual([base(2015, null)]);
    expect(parseBases(null)).toEqual([]);
  });
});
