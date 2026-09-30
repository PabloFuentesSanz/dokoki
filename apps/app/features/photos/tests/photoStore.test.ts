import type { PlaceAssignment } from '@atlas/domain';
import { describe, expect, it } from 'vitest';
import { toAssignments, withPlaces } from '../services/photoRecords';

const photo = (id: string, takenAt: number) => ({ id, takenAt, location: { lat: 35, lng: 135 } });

describe('withPlaces / toAssignments', () => {
  const assignments: PlaceAssignment[] = [
    {
      photoId: 'a',
      takenAt: 1,
      countryCode: 'JP',
      regionId: 'JP-26',
      cityId: 'kyoto',
      placeId: null,
      source: 'gps',
    },
  ];

  it('une cada foto con su lugar; sin lugar queda en null', () => {
    expect(withPlaces([photo('a', 1), photo('b', 2)], assignments)).toEqual([
      { ...photo('a', 1), countryCode: 'JP', regionId: 'JP-26', cityId: 'kyoto' },
      { ...photo('b', 2), countryCode: null, regionId: null, cityId: null },
    ]);
  });

  it('reconstruye las asignaciones desde lo guardado, sin las fotos sin país', () => {
    expect(toAssignments(withPlaces([photo('a', 1), photo('b', 2)], assignments))).toEqual(
      assignments,
    );
  });
});
