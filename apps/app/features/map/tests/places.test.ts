import { describe, expect, it } from 'vitest';
import { cityName, toCities } from '../services/cities';
import { placeResolver, placesCatalog } from '../services/places';
import { regionName, regionsOf } from '../services/regions';

describe('placeResolver', () => {
  it('resuelve país, región y ciudad de Kioto, Nara y Madrid', () => {
    const kyoto = placeResolver.resolve({ lat: 35.0116, lng: 135.7681 });
    expect(kyoto).toMatchObject({ countryCode: 'JP', regionId: 'JP-26' });
    expect(cityName(kyoto?.cityId ?? '')).toBe('Kyoto');

    const nara = placeResolver.resolve({ lat: 34.6851, lng: 135.8048 });
    expect(nara?.regionId).toBe('JP-29');
    expect(cityName(nara?.cityId ?? '')).toBe('Nara');

    const madrid = placeResolver.resolve({ lat: 40.4168, lng: -3.7038 });
    expect(madrid?.countryCode).toBe('ES');
    expect(regionName(madrid?.regionId ?? '')).toMatch(/Madrid/);
    expect(cityName(madrid?.cityId ?? '')).toBe('Madrid');
  });

  it('en mitad del océano no hay lugar; lejos de ciudades, sin ciudad', () => {
    expect(placeResolver.resolve({ lat: 40, lng: -40 })).toBeNull();
    const sahara = placeResolver.resolve({ lat: 23.5, lng: 12.5 });
    expect(sahara?.cityId).toBeNull();
  });

  it('el catálogo conoce las 47 prefecturas de Japón', () => {
    expect(placesCatalog.regionCountByCountry.JP).toBe(47);
    expect(regionsOf('JP')).toHaveLength(47);
  });

  it('rechaza ciudades mal formadas', () => {
    expect(() => toCities({ rows: [['1', 'X', 'ES', 'no', 0, 0]] })).toThrow();
    expect(() => toCities({})).toThrow();
  });
});

describe('searchCities', () => {
  it('encuentra por prefijo sin tildes ni mayúsculas, las más pobladas primero', async () => {
    const { searchCities } = await import('../services/cities');
    const results = searchCities('kyo', 5);
    expect(results[0]?.name).toBe('Kyoto');
    expect(searchCities('Cádiz', 3).some((c) => c.name === 'Cadiz' && c.country === 'ES')).toBe(
      true,
    );
  });

  it('una búsqueda vacía no devuelve nada', async () => {
    const { searchCities } = await import('../services/cities');
    expect(searchCities('  ', 5)).toEqual([]);
  });
});
