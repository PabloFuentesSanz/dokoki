import type { TripPhoto } from '@atlas/domain';
import { describe, expect, it } from 'vitest';
import { routeKm, tripDays } from '../services/tripDays';

const at = (d: number, h: number) => new Date(2024, 3, d, h).getTime();
const photo = (id: string, takenAt: number, cityName: string): TripPhoto => ({
  id,
  takenAt,
  location: { lat: 0, lng: 0 },
  countryCode: 'JP',
  cityId: cityName,
  cityName,
});

describe('tripDays', () => {
  it('agrupa por día con las ciudades en orden y sin repetir', () => {
    const photos = [
      photo('c', at(12, 18), 'Nara'),
      photo('a', at(11, 9), 'Kioto'),
      photo('b', at(12, 9), 'Kioto'),
      photo('d', at(12, 20), 'Kioto'),
    ];
    const days = tripDays(['a', 'b', 'c', 'd', 'perdida'], photos);
    expect(days.map((d) => [d.key, d.cities, d.photoIds])).toEqual([
      ['2024-04-11', ['Kioto'], ['a']],
      ['2024-04-12', ['Kioto', 'Nara'], ['b', 'c', 'd']],
    ]);
  });
});

describe('routeKm', () => {
  it('suma los tramos entre ciudades', () => {
    expect(
      routeKm([
        { lat: 40.4168, lng: -3.7038 },
        { lat: 41.3874, lng: 2.1686 },
      ]),
    ).toBe(505);
    expect(routeKm([])).toBe(0);
  });
});
