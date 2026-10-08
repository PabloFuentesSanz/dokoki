import { describe, expect, it } from 'vitest';
import { cityById } from '../services/cities';
import { citiesInRegion, regionOfCity } from '../services/regionCities';

describe('citiesInRegion', () => {
  it('Kioto (JP-26) empieza por la ciudad de Kioto e incluye Uji, no Osaka', () => {
    const names = citiesInRegion('JP-26').map((c) => c.name);
    expect(names[0]).toBe('Kioto');
    expect(names).toContain('Uji');
    expect(names).not.toContain('Osaka');
    expect(citiesInRegion('JP-26')).toBe(citiesInRegion('JP-26'));
  });

  it('sin región conocida no hay ciudades', () => {
    expect(citiesInRegion('XX-1')).toEqual([]);
  });

  it('sabe en qué región está una ciudad', () => {
    const kyoto = cityById('1857910');
    expect(kyoto && regionOfCity(kyoto)).toBe('JP-26');
  });
});
