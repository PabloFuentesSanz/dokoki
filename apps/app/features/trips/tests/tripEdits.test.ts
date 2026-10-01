import type { DetectedTrip } from '@atlas/domain';
import { describe, expect, it } from 'vitest';
import {
  EMPTY_EDITS,
  hideTrip,
  lockTrips,
  parseTripEdits,
  visibleTrips,
} from '../services/tripEdits';

const trip = (id: string, name = id): DetectedTrip => ({
  id,
  startAt: 1,
  endAt: 2,
  photoIds: [`${id}-p`],
  countryCodes: ['JP'],
  cities: [{ cityId: 'kyoto', cityName: 'Kyoto', photoCount: 1 }],
  name,
  coverPhotoId: `${id}-p`,
  locked: true,
});

describe('tripEdits', () => {
  it('bloquear sustituye a los viajes indicados (renombrar, fusionar, dividir)', () => {
    let edits = lockTrips(EMPTY_EDITS, [trip('a'), trip('b')], []);
    edits = lockTrips(edits, [trip('ab', 'Japón')], ['a', 'b']);
    expect(edits.locked.map((t) => t.id)).toEqual(['ab']);
  });

  it('ocultar ("no es un viaje") lo quita de los bloqueados y lo guarda aparte', () => {
    const edits = hideTrip(lockTrips(EMPTY_EDITS, [trip('a')], []), trip('a'));
    expect(edits.locked).toEqual([]);
    expect(edits.hidden.map((t) => t.id)).toEqual(['a']);
    expect(visibleTrips([trip('a'), trip('b')], edits).map((t) => t.id)).toEqual(['b']);
  });

  it('lee lo guardado descartando viajes mal formados', () => {
    const saved: unknown = JSON.parse(JSON.stringify(lockTrips(EMPTY_EDITS, [trip('a')], [])));
    expect(parseTripEdits(saved).locked).toEqual([trip('a')]);
    expect(parseTripEdits({ locked: [{ id: 3 }], hidden: 'x' })).toEqual(EMPTY_EDITS);
    expect(parseTripEdits(null)).toEqual(EMPTY_EDITS);
  });
});
