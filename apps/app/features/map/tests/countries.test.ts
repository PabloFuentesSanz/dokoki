import { describe, expect, it } from 'vitest';
import {
  countryAreas,
  countryCount,
  countryName,
  countryResolver,
  searchCountries,
  toCountryCollection,
} from '../services/countries';

describe('countries', () => {
  it('carga los países con código ISO, nombre y continente', () => {
    expect(countryAreas.features.length).toBeGreaterThan(200);
    expect(countryName('JP')).toBe('Japón');
    expect(countryName('XX')).toBe('XX');
  });

  it('el catálogo no cuenta la Antártida ni el mar abierto', () => {
    expect(countryCount).toBeLessThan(countryAreas.features.length);
    expect(countryCount).toBeGreaterThan(200);
  });

  it('resuelve el país de un punto sin red', () => {
    expect(countryResolver.resolve({ lat: 35.0116, lng: 135.7681 })).toEqual({
      countryCode: 'JP',
      regionId: null,
      cityId: null,
      placeId: null,
    });
    expect(countryResolver.resolve({ lat: 40.4168, lng: -3.7038 })?.countryCode).toBe('ES');
    expect(countryResolver.resolve({ lat: -12.0464, lng: -77.0428 })?.countryCode).toBe('PE');
    expect(countryResolver.resolve({ lat: 40, lng: -40 })).toBeNull();
  });

  it('rechaza datos que no son una colección de países', () => {
    expect(() =>
      toCountryCollection({ type: 'FeatureCollection', features: [{ type: 'Feature' }] }),
    ).toThrow();
    expect(() => toCountryCollection(null)).toThrow();
  });
});

describe('searchCountries', () => {
  it('busca por el principio del nombre, sin tildes ni mayúsculas', () => {
    expect(searchCountries('japon')).toEqual([{ code: 'JP', name: 'Japón' }]);
    expect(searchCountries('  ')).toEqual([]);
  });

  it('si nada empieza así, busca dentro del nombre', () => {
    expect(searchCountries('landia').map((c) => c.code)).toContain('FI');
  });
});
