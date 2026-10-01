import { describe, expect, it } from 'vitest';
import {
  detectTrips,
  isAtHome,
  mergeTrips,
  splitTrip,
  tripFromPhotos,
  type HomeBase,
  type TripPhoto,
} from './index';

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const T0 = Date.UTC(2024, 3, 10, 9);

const MADRID: HomeBase = { location: { lat: 40.4168, lng: -3.7038 } };

const CITIES = {
  madrid: {
    countryCode: 'ES',
    cityId: 'es-madrid',
    cityName: 'Madrid',
    location: { lat: 40.42, lng: -3.7 },
  },
  kioto: {
    countryCode: 'JP',
    cityId: 'jp-kyoto',
    cityName: 'Kioto',
    location: { lat: 35.01, lng: 135.77 },
  },
  nara: {
    countryCode: 'JP',
    cityId: 'jp-nara',
    cityName: 'Nara',
    location: { lat: 34.68, lng: 135.8 },
  },
  osaka: {
    countryCode: 'JP',
    cityId: 'jp-osaka',
    cityName: 'Osaka',
    location: { lat: 34.69, lng: 135.5 },
  },
  seul: {
    countryCode: 'KR',
    cityId: 'kr-seoul',
    cityName: 'Seúl',
    location: { lat: 37.57, lng: 126.98 },
  },
  lisboa: {
    countryCode: 'PT',
    cityId: 'pt-lisbon',
    cityName: 'Lisboa',
    location: { lat: 38.72, lng: -9.14 },
  },
} as const;

function p(id: string, takenAt: number, city: keyof typeof CITIES): TripPhoto {
  return { id, takenAt, ...CITIES[city] };
}

/** Japón en abril: Kioto (3 fotos), Nara (1), Osaka (2), con fotos en casa antes y después. */
const japan: TripPhoto[] = [
  p('home-1', T0 - 3 * DAY, 'madrid'),
  p('k1', T0, 'kioto'),
  p('k2', T0 + 2 * HOUR, 'kioto'),
  p('n1', T0 + DAY, 'nara'),
  p('k3', T0 + DAY + 8 * HOUR, 'kioto'),
  p('o1', T0 + 2 * DAY, 'osaka'),
  p('o2', T0 + 2 * DAY + HOUR, 'osaka'),
  p('home-2', T0 + 5 * DAY, 'madrid'),
];

describe('detectTrips', () => {
  it('agrupa en un viaje las fotos hechas lejos de la base', () => {
    const [trip, ...rest] = detectTrips(japan, MADRID);
    expect(rest).toEqual([]);
    expect(trip).toMatchObject({
      id: `trip-${T0}`,
      startAt: T0,
      endAt: T0 + 2 * DAY + HOUR,
      photoIds: ['k1', 'k2', 'n1', 'k3', 'o1', 'o2'],
      countryCodes: ['JP'],
      locked: false,
    });
  });

  it('propone nombre con las 3 ciudades con más fotos, en orden de llegada', () => {
    const [trip] = detectTrips(japan, MADRID);
    expect(trip?.name).toBe('Kioto, Nara y Osaka');
    expect(trip?.cities).toEqual([
      { cityId: 'jp-kyoto', cityName: 'Kioto', photoCount: 3 },
      { cityId: 'jp-nara', cityName: 'Nara', photoCount: 1 },
      { cityId: 'jp-osaka', cityName: 'Osaka', photoCount: 2 },
    ]);
  });

  it('usa como portada la primera foto de la ciudad con más fotos', () => {
    const [trip] = detectTrips(japan, MADRID);
    expect(trip?.coverPhotoId).toBe('k1');
  });

  it('ordena la entrada por fecha antes de detectar', () => {
    const shuffled = [...japan].reverse();
    expect(detectTrips(shuffled, MADRID)).toEqual(detectTrips(japan, MADRID));
  });

  it('un hueco de más de 2 días sin fotos corta el viaje', () => {
    const photos = [
      p('k1', T0, 'kioto'),
      p('s1', T0 + 2 * DAY + HOUR, 'seul'),
      p('s2', T0 + 3 * DAY, 'seul'),
    ];
    const trips = detectTrips(photos, MADRID);
    expect(trips.map((t) => t.photoIds)).toEqual([['k1'], ['s1', 's2']]);
    expect(trips.map((t) => t.name)).toEqual(['Kioto', 'Seúl']);
  });

  it('el hueco máximo es configurable', () => {
    const photos = [p('k1', T0, 'kioto'), p('k2', T0 + 3 * DAY, 'kioto')];
    expect(detectTrips(photos, MADRID, { maxGapDays: 4 })).toHaveLength(1);
  });

  it('volver a casa corta el viaje aunque no haya hueco', () => {
    const photos = [
      p('l1', T0, 'lisboa'),
      p('h', T0 + HOUR * 20, 'madrid'),
      p('l2', T0 + DAY, 'lisboa'),
    ];
    expect(detectTrips(photos, MADRID).map((t) => t.photoIds)).toEqual([['l1'], ['l2']]);
  });

  it('descarta viajes con menos fotos que el mínimo', () => {
    const photos = [
      p('l1', T0, 'lisboa'),
      p('k1', T0 + 10 * DAY, 'kioto'),
      p('k2', T0 + 10 * DAY + HOUR, 'kioto'),
    ];
    expect(detectTrips(photos, MADRID, { minPhotos: 2 }).map((t) => t.photoIds)).toEqual([
      ['k1', 'k2'],
    ]);
  });

  it('nombra con "y" cuando hay dos ciudades y registra varios países', () => {
    const photos = [p('k1', T0, 'kioto'), p('s1', T0 + DAY, 'seul')];
    const [trip] = detectTrips(photos, MADRID);
    expect(trip?.name).toBe('Kioto y Seúl');
    expect(trip?.countryCodes).toEqual(['JP', 'KR']);
  });

  it('no toca los viajes corregidos por el usuario (bloqueados) ni sus fotos', () => {
    const [detected] = detectTrips(japan, MADRID);
    if (!detected) throw new Error('falta el viaje');
    const locked = { ...detected, name: 'Japón con Lucía', locked: true };
    const later = [...japan, p('l1', T0 + 20 * DAY, 'lisboa')];

    const trips = detectTrips(later, MADRID, { locked: [locked] });
    expect(trips.map((t) => t.name)).toEqual(['Japón con Lucía', 'Lisboa']);
  });

  it('con varias bases, estar cerca de cualquiera es estar en casa', () => {
    const LISBOA: HomeBase = { location: CITIES.lisboa.location };
    const photos = [p('l1', T0, 'lisboa'), p('k1', T0 + 3 * DAY, 'kioto')];
    expect(detectTrips(photos, [MADRID, LISBOA]).map((t) => t.photoIds)).toEqual([['k1']]);
  });

  it('las bases tienen periodo: Lisboa fue base hasta T0, después es un viaje', () => {
    const bases: HomeBase[] = [MADRID, { location: CITIES.lisboa.location, until: T0 }];
    const photos = [p('l1', T0 - DAY, 'lisboa'), p('l2', T0 + 10 * DAY, 'lisboa')];
    expect(detectTrips(photos, bases).map((t) => t.photoIds)).toEqual([['l2']]);
    expect(
      isAtHome({ location: CITIES.lisboa.location, takenAt: T0 - DAY }, [
        { location: CITIES.lisboa.location, from: T0 },
      ]),
    ).toBe(false);
  });

  it('sin bases no se detectan viajes (salvo los ya bloqueados)', () => {
    expect(detectTrips(japan, [])).toEqual([]);
  });

  it('sin fotos no hay viajes', () => {
    expect(detectTrips([], MADRID)).toEqual([]);
  });
});

describe('mergeTrips', () => {
  const photos = [p('k1', T0, 'kioto'), p('k2', T0 + HOUR, 'kioto'), p('s1', T0 + 5 * DAY, 'seul')];
  const [kioto, seul] = detectTrips(photos, MADRID);

  it('fusiona viajes en uno bloqueado, con cifras y nombre recalculados', () => {
    if (!kioto || !seul) throw new Error('faltan viajes');
    const merged = mergeTrips([seul, kioto]);
    expect(merged).toEqual({
      id: kioto.id,
      startAt: T0,
      endAt: T0 + 5 * DAY,
      photoIds: ['k1', 'k2', 's1'],
      countryCodes: ['JP', 'KR'],
      cities: [
        { cityId: 'jp-kyoto', cityName: 'Kioto', photoCount: 2 },
        { cityId: 'kr-seoul', cityName: 'Seúl', photoCount: 1 },
      ],
      name: 'Kioto y Seúl',
      coverPhotoId: 'k1',
      locked: true,
    });
  });

  it('suma las fotos de una misma ciudad repetida en ambos viajes', () => {
    const again = detectTrips([p('k9', T0 + 9 * DAY, 'kioto')], MADRID);
    if (!kioto || !again[0]) throw new Error('faltan viajes');
    expect(mergeTrips([kioto, again[0]]).cities).toEqual([
      { cityId: 'jp-kyoto', cityName: 'Kioto', photoCount: 3 },
    ]);
  });

  it('toma la portada del viaje con más fotos', () => {
    const bigger = detectTrips(
      [
        p('s7', T0 + 9 * DAY, 'seul'),
        p('s8', T0 + 9 * DAY + HOUR, 'seul'),
        p('s9', T0 + 9 * DAY + 2 * HOUR, 'seul'),
      ],
      MADRID,
    );
    if (!kioto || !bigger[0]) throw new Error('faltan viajes');
    expect(mergeTrips([kioto, bigger[0]]).coverPhotoId).toBe('s7');
  });

  it('necesita al menos dos viajes', () => {
    if (!kioto) throw new Error('falta el viaje');
    expect(() => mergeTrips([kioto])).toThrow(RangeError);
  });
});

describe('splitTrip', () => {
  const [trip] = detectTrips(japan, MADRID);

  it('divide un viaje en dos por un instante, ambos bloqueados', () => {
    if (!trip) throw new Error('falta el viaje');
    const [first, second] = splitTrip(trip, japan, T0 + 2 * DAY);
    expect(first).toMatchObject({
      photoIds: ['k1', 'k2', 'n1', 'k3'],
      name: 'Kioto y Nara',
      locked: true,
    });
    expect(second).toMatchObject({
      photoIds: ['o1', 'o2'],
      name: 'Osaka',
      locked: true,
      startAt: T0 + 2 * DAY,
    });
  });

  it('solo usa las fotos que pertenecen al viaje', () => {
    if (!trip) throw new Error('falta el viaje');
    const [first] = splitTrip(trip, japan, T0 + DAY);
    expect(first.photoIds).not.toContain('home-1');
  });

  it('rechaza un corte que deja una mitad vacía', () => {
    if (!trip) throw new Error('falta el viaje');
    expect(() => splitTrip(trip, japan, T0)).toThrow(RangeError);
    expect(() => splitTrip(trip, japan, T0 + 30 * DAY)).toThrow(RangeError);
  });
});

describe('tripFromPhotos', () => {
  it('crea un viaje bloqueado con nombre propuesto o propio', () => {
    const photos = [p('o1', T0 + DAY, 'osaka'), p('k1', T0, 'kioto')];
    expect(tripFromPhotos(photos)).toMatchObject({
      photoIds: ['k1', 'o1'],
      name: 'Kioto y Osaka',
      locked: true,
    });
    expect(tripFromPhotos(photos, 'Japón con Lucía').name).toBe('Japón con Lucía');
  });

  it('sin fotos no hay viaje', () => {
    expect(() => tripFromPhotos([])).toThrow(RangeError);
  });
});
