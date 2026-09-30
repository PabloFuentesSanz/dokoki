import { describe, expect, it } from 'vitest';
import { haversineKm, isValidCoordinate } from './index';

describe('isValidCoordinate', () => {
  it('acepta coordenadas reales', () => {
    expect(isValidCoordinate({ lat: 34.97, lng: 135.77 })).toBe(true);
    expect(isValidCoordinate({ lat: -90, lng: 180 })).toBe(true);
  });

  it('rechaza valores fuera de rango o no finitos', () => {
    expect(isValidCoordinate({ lat: 91, lng: 0 })).toBe(false);
    expect(isValidCoordinate({ lat: 10, lng: -181 })).toBe(false);
    expect(isValidCoordinate({ lat: Number.NaN, lng: 3 })).toBe(false);
  });

  it('rechaza la "isla nula" (0, 0), típica de EXIF vacío', () => {
    expect(isValidCoordinate({ lat: 0, lng: 0 })).toBe(false);
  });
});

describe('haversineKm', () => {
  it('es 0 para el mismo punto', () => {
    expect(haversineKm({ lat: 40.4168, lng: -3.7038 }, { lat: 40.4168, lng: -3.7038 })).toBe(0);
  });

  it('Madrid → Barcelona ≈ 505 km', () => {
    const km = haversineKm({ lat: 40.4168, lng: -3.7038 }, { lat: 41.3874, lng: 2.1686 });
    expect(km).toBeGreaterThan(495);
    expect(km).toBeLessThan(515);
  });
});
