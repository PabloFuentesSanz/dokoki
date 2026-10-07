import type { DetectedTrip, UnlockState } from '@atlas/domain';
import { describe, expect, it } from 'vitest';
import { buildExport } from '../services/exportData';

const state: UnlockState = {
  countries: {
    JP: { id: 'JP', firstVisitedAt: Date.UTC(2024, 3, 10), photoCount: 12, source: 'photos' },
  },
  regions: { 'JP-26': { id: 'JP-26', firstVisitedAt: 0, photoCount: 12, source: 'photos' } },
  cities: { '1857910': { id: '1857910', firstVisitedAt: 0, photoCount: 12, source: 'photos' } },
  totals: { countries: 1, regions: 1, cities: 1 },
  worldPercent: 0.4,
  regionPercentByCountry: { JP: 2 },
};
const trip: DetectedTrip = {
  id: 'trip-1',
  startAt: Date.UTC(2024, 3, 10),
  endAt: Date.UTC(2024, 3, 18),
  photoIds: ['a', 'b', 'c'],
  countryCodes: ['JP'],
  cities: [{ cityId: '1857910', cityName: 'Kyoto', photoCount: 3 }],
  name: 'Kioto',
  coverPhotoId: 'a',
  locked: true,
};

describe('buildExport', () => {
  const out = buildExport({
    bases: [
      {
        id: 'b1',
        cityId: '3117735',
        name: 'Madrid',
        countryCode: 'ES',
        lat: 40.4,
        lng: -3.7,
        fromYear: 2015,
        untilYear: null,
      },
    ],
    trips: [trip],
    state,
    names: { country: () => 'Japón', city: () => 'Kioto' },
    now: Date.UTC(2026, 9, 7),
  });

  it('exporta viajes, lugares y bases legibles', () => {
    expect(out.trips[0]).toEqual({
      name: 'Kioto',
      from: '2024-04-10',
      until: '2024-04-18',
      countries: ['JP'],
      cities: ['Kyoto'],
      photos: 3,
      confirmed: true,
    });
    expect(out.countries).toEqual([
      { code: 'JP', name: 'Japón', firstVisit: '2024-04-10', photos: 12 },
    ]);
    expect(out.cities).toEqual(['Kioto']);
    expect(out.bases).toEqual([{ city: 'Madrid', country: 'ES', from: 2015, until: null }]);
  });

  it('nunca incluye coordenadas', () => {
    expect(JSON.stringify(out)).not.toMatch(/"(lat|lng|location)"/);
  });
});
