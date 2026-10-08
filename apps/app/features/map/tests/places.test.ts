import { describe, expect, it } from 'vitest';
import { cityName, toCities } from '../services/cities';
import { placeResolver, placesCatalog } from '../services/places';
import { regionName, regionsOf } from '../services/regions';

describe('placeResolver', () => {
  it('resuelve país, región y ciudad de Kioto, Nara y Madrid', () => {
    const kyoto = placeResolver.resolve({ lat: 35.0116, lng: 135.7681 });
    expect(kyoto).toMatchObject({ countryCode: 'JP', regionId: 'JP-26' });
    expect(cityName(kyoto?.cityId ?? '')).toBe('Kioto');

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
    expect(results[0]?.name).toBe('Kioto');
    expect(searchCities('Cádiz', 3).some((c) => c.name === 'Cádiz' && c.country === 'ES')).toBe(
      true,
    );
  });

  it('busca por el nombre en español y por el de GeoNames', async () => {
    const { searchCities } = await import('../services/cities');
    expect(searchCities('kioto', 1)[0]?.localName).toBe('Kyoto');
    expect(searchCities('munich', 1)[0]?.name).toBe('Múnich');
    expect(searchCities('nueva york', 1)[0]?.country).toBe('US');
  });

  it('los barrios no son ciudades: el Retiro es Madrid y el Eixample, Barcelona', () => {
    expect(cityName(placeResolver.resolve({ lat: 40.4153, lng: -3.6845 })?.cityId ?? '')).toBe(
      'Madrid',
    );
    expect(cityName(placeResolver.resolve({ lat: 41.3917, lng: 2.1649 })?.cityId ?? '')).toBe(
      'Barcelona',
    );
  });

  it('withSpanishNames solo cambia las que tienen traducción', async () => {
    const { withSpanishNames } = await import('../services/cities');
    const list = [
      { id: '1', name: 'Kyoto', localName: 'Kyoto', country: 'JP', lat: 0, lng: 0, population: 1 },
    ];
    expect(withSpanishNames(list, { '1': 'Kioto' })[0]?.name).toBe('Kioto');
    expect(withSpanishNames(list, null)).toBe(list);
  });

  it('una búsqueda vacía no devuelve nada', async () => {
    const { searchCities } = await import('../services/cities');
    expect(searchCities('  ', 5)).toEqual([]);
  });
});
