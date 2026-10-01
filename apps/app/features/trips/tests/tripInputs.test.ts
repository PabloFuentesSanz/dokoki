import type { PlaceAssignment } from '@atlas/domain';
import { describe, expect, it } from 'vitest';
import { homeBaseFrom, toTripPhotos } from '../services/tripInputs';

const photo = (id: string, lat: number, lng: number) => ({
  id,
  takenAt: Number(id.slice(1)),
  location: { lat, lng },
});
const at = (
  photoId: string,
  countryCode: string,
  cityId: string | null,
  regionId: string | null = null,
): PlaceAssignment => ({
  photoId,
  takenAt: Number(photoId.slice(1)),
  countryCode,
  regionId,
  cityId,
  placeId: null,
  source: 'gps',
});

describe('toTripPhotos', () => {
  const names = {
    city: (id: string) => `ciudad ${id}`,
    region: (id: string) => `región ${id}`,
    country: (c: string) => `país ${c}`,
  };

  it('usa la ciudad; si no hay, la región; si no, el país', () => {
    const photos = [photo('p1', 1, 1), photo('p2', 2, 2), photo('p3', 3, 3), photo('p4', 4, 4)];
    const result = toTripPhotos(
      photos,
      [at('p1', 'JP', 'kyoto'), at('p2', 'JP', null, 'JP-29'), at('p3', 'IS', null)],
      names,
    );
    expect(result.map((p) => [p.id, p.cityId, p.cityName])).toEqual([
      ['p1', 'kyoto', 'ciudad kyoto'],
      ['p2', 'JP-29', 'región JP-29'],
      ['p3', 'IS', 'país IS'],
    ]);
  });
});

describe('homeBaseFrom', () => {
  it('propone como base la ciudad con más fotos (HU-04), en su centro', () => {
    const photos = [photo('p1', 40.4, -3.7), photo('p2', 40.42, -3.68), photo('p3', 35, 135.7)];
    const assignments = [
      at('p1', 'ES', 'madrid'),
      at('p2', 'ES', 'madrid'),
      at('p3', 'JP', 'kyoto'),
    ];
    const home = homeBaseFrom(photos, assignments);
    expect(home?.cityId).toBe('madrid');
    expect(home?.location.lat).toBeCloseTo(40.41, 5);
  });

  it('sin fotos con ciudad no hay base', () => {
    expect(homeBaseFrom([photo('p1', 1, 1)], [at('p1', 'IS', null)])).toBeNull();
  });
});
