import { describe, expect, it, vi } from 'vitest';
import {
  assignPhotosToBatch,
  clusterCellId,
  clusterPhotos,
  nearestInTime,
  suggestPlaceByTime,
  type PhotoMeta,
  type PlaceAssignment,
  type PlaceResolver,
  type ResolvedPlace,
} from './index';

const KIOTO: ResolvedPlace = {
  countryCode: 'JP',
  regionId: 'JP-26',
  cityId: 'jp-kyoto',
  placeId: 'fushimi-inari',
};
const NARA: ResolvedPlace = {
  countryCode: 'JP',
  regionId: 'JP-29',
  cityId: 'jp-nara',
  placeId: null,
};

const DAY = 24 * 60 * 60 * 1000;
const T0 = Date.UTC(2024, 3, 10, 9);

function photo(
  id: string,
  takenAt: number,
  location: PhotoMeta['location'],
  hidden = false,
): PhotoMeta {
  return { id, takenAt, location, hidden };
}

/** Resolver de prueba: Kioto al norte de 34,8° y Nara al sur; el mar (lng > 136) no es de nadie. */
function fakeResolver(): PlaceResolver & { resolve: ReturnType<typeof vi.fn> } {
  const resolve = vi.fn((p: { lat: number; lng: number }): ResolvedPlace | null => {
    if (p.lng > 136) return null;
    return p.lat > 34.8 ? KIOTO : NARA;
  });
  return { resolve };
}

describe('assignPhotosToBatch', () => {
  it('asigna país › región › ciudad › lugar a cada foto con GPS', () => {
    const resolver = fakeResolver();
    const result = assignPhotosToBatch(
      [
        photo('a', T0, { lat: 34.967, lng: 135.772 }),
        photo('b', T0 + 1, { lat: 34.685, lng: 135.805 }),
      ],
      resolver,
    );

    expect(result.assignments).toEqual<PlaceAssignment[]>([
      { photoId: 'a', takenAt: T0, ...KIOTO, source: 'gps' },
      { photoId: 'b', takenAt: T0 + 1, ...NARA, source: 'gps' },
    ]);
    expect(result.unlocated).toEqual([]);
  });

  it('manda a "Sin ubicación" las fotos sin GPS, con (0, 0) o fuera de cualquier territorio', () => {
    const result = assignPhotosToBatch(
      [
        photo('sin-gps', T0, null),
        photo('isla-nula', T0, { lat: 0, lng: 0 }),
        photo('mar', T0, { lat: 34.5, lng: 137.2 }),
      ],
      fakeResolver(),
    );

    expect(result.assignments).toEqual([]);
    expect(result.unlocated).toEqual(['sin-gps', 'isla-nula', 'mar']);
  });

  it('ignora las fotos ocultas: no cuentan ni para el mapa ni para la bandeja', () => {
    const result = assignPhotosToBatch(
      [photo('oculta', T0, { lat: 34.967, lng: 135.772 }, true)],
      fakeResolver(),
    );
    expect(result.assignments).toEqual([]);
    expect(result.unlocated).toEqual([]);
  });

  it('cachea por celda (~110 m) para no repetir búsquedas con ráfagas de fotos', () => {
    const resolver = fakeResolver();
    assignPhotosToBatch(
      [
        photo('1', T0, { lat: 34.96712, lng: 135.77231 }),
        photo('2', T0 + 1, { lat: 34.96738, lng: 135.77249 }),
        photo('3', T0 + 2, { lat: 34.96701, lng: 135.77201 }),
      ],
      resolver,
    );
    expect(resolver.resolve).toHaveBeenCalledTimes(1);
  });

  it('reutiliza la caché entre lotes si se le pasa', () => {
    const resolver = fakeResolver();
    const cache = new Map<string, ResolvedPlace | null>();
    assignPhotosToBatch([photo('1', T0, { lat: 34.9671, lng: 135.7723 })], resolver, { cache });
    assignPhotosToBatch([photo('2', T0, { lat: 34.9671, lng: 135.7723 })], resolver, { cache });
    expect(resolver.resolve).toHaveBeenCalledTimes(1);
  });

  it('las correcciones del usuario mandan sobre el GPS', () => {
    const result = assignPhotosToBatch(
      [photo('a', T0, { lat: 34.967, lng: 135.772 })],
      fakeResolver(),
      {
        overrides: new Map([['a', NARA]]),
      },
    );
    expect(result.assignments).toEqual([{ photoId: 'a', takenAt: T0, ...NARA, source: 'manual' }]);
  });

  it('una corrección también rescata fotos sin GPS', () => {
    const result = assignPhotosToBatch([photo('a', T0, null)], fakeResolver(), {
      overrides: new Map([['a', KIOTO]]),
    });
    expect(result.assignments).toEqual([{ photoId: 'a', takenAt: T0, ...KIOTO, source: 'manual' }]);
    expect(result.unlocated).toEqual([]);
  });
});

describe('suggestPlaceByTime', () => {
  const located: PlaceAssignment[] = [
    { photoId: 'k1', takenAt: T0, ...KIOTO, source: 'gps' },
    { photoId: 'n1', takenAt: T0 + 2 * DAY, ...NARA, source: 'gps' },
  ];

  it('sugiere el lugar de la foto con GPS más cercana en el tiempo', () => {
    expect(suggestPlaceByTime(T0 + 3 * 60 * 60 * 1000, located)).toEqual(KIOTO);
    expect(suggestPlaceByTime(T0 + 2 * DAY - 60_000, located)).toEqual(NARA);
  });

  it('no sugiere nada si la foto más cercana está a más de la ventana (12 h por defecto)', () => {
    expect(suggestPlaceByTime(T0 + DAY, located)).toBeNull();
    expect(suggestPlaceByTime(T0 + DAY, located, { windowMs: DAY })).toEqual(KIOTO);
  });

  it('no sugiere nada sin fotos localizadas', () => {
    expect(suggestPlaceByTime(T0, [])).toBeNull();
  });
});

describe('suggestPlaceByTime (desempate)', () => {
  it('a igual distancia gana la foto anterior, sin depender del orden de entrada', () => {
    const later: PlaceAssignment = { photoId: 'n1', takenAt: T0 + 2 * DAY, ...NARA, source: 'gps' };
    const earlier: PlaceAssignment = { photoId: 'k1', takenAt: T0, ...KIOTO, source: 'gps' };
    expect(suggestPlaceByTime(T0 + DAY, [later, earlier], { windowMs: DAY })).toEqual(KIOTO);
  });
});

describe('clusterPhotos', () => {
  it('agrupa por celda con el centro medio y el número de fotos', () => {
    const clusters = clusterPhotos(
      [
        { lat: 35.011, lng: 135.768 },
        { lat: 35.013, lng: 135.77 },
        { lat: 34.685, lng: 135.805 },
      ],
      0.1,
    );
    expect(clusters).toHaveLength(2);
    const kyoto = clusters.find((c) => c.count === 2);
    expect(kyoto?.center.lat).toBeCloseTo(35.012, 5);
    expect(kyoto?.center.lng).toBeCloseTo(135.769, 5);
    expect(clusters.find((c) => c.count === 1)?.center).toEqual({ lat: 34.685, lng: 135.805 });
    // El id de cada grupo es la celda de sus fotos: así se sabe qué fotos abre (M3.3).
    expect(kyoto?.id).toBe(clusterCellId({ lat: 35.011, lng: 135.768 }, 0.1));
  });

  it('usa ids estables por celda y descarta coordenadas no válidas', () => {
    const clusters = clusterPhotos(
      [
        { lat: 0, lng: 0 },
        { lat: 40.42, lng: -3.7 },
      ],
      0.5,
    );
    expect(clusters).toEqual([{ id: '80:-8', center: { lat: 40.42, lng: -3.7 }, count: 1 }]);
  });

  it('sin fotos no hay grupos', () => {
    expect(clusterPhotos([], 0.1)).toEqual([]);
  });
});

describe('nearestInTime', () => {
  const sorted = [
    { id: 'a', takenAt: 100 },
    { id: 'b', takenAt: 200 },
    { id: 'c', takenAt: 400 },
  ];

  it('encuentra el elemento más cercano en el tiempo (lista ordenada)', () => {
    expect(nearestInTime(190, sorted, 1000)?.id).toBe('b');
    expect(nearestInTime(320, sorted, 1000)?.id).toBe('c');
    expect(nearestInTime(0, sorted, 1000)?.id).toBe('a');
    expect(nearestInTime(999, sorted, 1000)?.id).toBe('c');
  });

  it('a igual distancia gana el anterior', () => {
    expect(nearestInTime(300, sorted, 1000)?.id).toBe('b');
  });

  it('nada fuera de la ventana o con la lista vacía', () => {
    expect(nearestInTime(1000, sorted, 100)).toBeNull();
    expect(nearestInTime(100, [], 100)).toBeNull();
  });
});
