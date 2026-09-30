import type { FeatureCollection, MultiPolygon, Polygon } from 'geojson';
import { describe, expect, it } from 'vitest';
import {
  buildFogLayer,
  computeUnlockState,
  type AreaProperties,
  type UnlockCatalog,
  type VisitedPhoto,
} from './index';

const T2019 = Date.UTC(2019, 6, 1);
const T2022 = Date.UTC(2022, 3, 1);
const T2024 = Date.UTC(2024, 3, 10);

const catalog: UnlockCatalog = {
  countryCount: 200,
  regionCountByCountry: { JP: 47, PT: 7, ES: 17 },
};

const photos: VisitedPhoto[] = [
  { countryCode: 'PT', regionId: 'PT-11', cityId: 'pt-lisbon', takenAt: T2019 },
  { countryCode: 'JP', regionId: 'JP-26', cityId: 'jp-kyoto', takenAt: T2024 },
  { countryCode: 'JP', regionId: 'JP-26', cityId: 'jp-kyoto', takenAt: T2024 - 1000 },
  { countryCode: 'JP', regionId: 'JP-29', cityId: 'jp-nara', takenAt: T2024 + 1000 },
];

describe('computeUnlockState', () => {
  it('desbloquea país, región y ciudad de cada foto, con la fecha de la primera', () => {
    const state = computeUnlockState(photos, { catalog });

    expect(state.countries.JP).toEqual({
      id: 'JP',
      firstVisitedAt: T2024 - 1000,
      photoCount: 3,
      source: 'photos',
    });
    expect(state.regions['JP-26']).toEqual({
      id: 'JP-26',
      firstVisitedAt: T2024 - 1000,
      photoCount: 2,
      source: 'photos',
    });
    expect(state.cities['jp-nara']).toEqual({
      id: 'jp-nara',
      firstVisitedAt: T2024 + 1000,
      photoCount: 1,
      source: 'photos',
    });
    expect(state.totals).toEqual({ countries: 2, regions: 3, cities: 3 });
  });

  it('calcula el porcentaje del mundo (1 decimal) y el de regiones por país (entero)', () => {
    const state = computeUnlockState(photos, { catalog });
    expect(state.worldPercent).toBe(1);
    expect(state.regionPercentByCountry).toEqual({ JP: 4, PT: 14 });
  });

  it('no calcula porcentaje de regiones si el catálogo no conoce el país', () => {
    const state = computeUnlockState(
      [{ countryCode: 'IS', regionId: 'IS-1', cityId: 'is-rvk', takenAt: T2022 }],
      {
        catalog,
      },
    );
    expect(state.regionPercentByCountry).toEqual({});
  });

  it('con `until` (viaje en el tiempo, M1.3) solo cuenta lo visitado hasta esa fecha', () => {
    const state = computeUnlockState(photos, { catalog, until: T2022 });
    expect(Object.keys(state.countries)).toEqual(['PT']);
    expect(state.totals).toEqual({ countries: 1, regions: 1, cities: 1 });
  });

  it('las marcas a mano desbloquean su nivel y los superiores, y se distinguen de las fotos', () => {
    const state = computeUnlockState(photos, {
      catalog,
      manual: [
        {
          level: 'city',
          countryCode: 'JP',
          regionId: 'JP-27',
          cityId: 'jp-osaka',
          visitedAt: T2022,
        },
        { level: 'country', countryCode: 'PE', visitedAt: null },
        { level: 'region', countryCode: 'PT', regionId: 'PT-11', visitedAt: T2019 - 1000 },
      ],
    });

    expect(state.cities['jp-osaka']).toEqual({
      id: 'jp-osaka',
      firstVisitedAt: T2022,
      photoCount: 0,
      source: 'manual',
    });
    expect(state.regions['JP-27']?.source).toBe('manual');
    expect(state.countries.JP).toMatchObject({
      source: 'both',
      firstVisitedAt: T2022,
      photoCount: 3,
    });
    expect(state.countries.PE).toEqual({
      id: 'PE',
      firstVisitedAt: null,
      photoCount: 0,
      source: 'manual',
    });
    expect(state.regions['PT-11']).toMatchObject({ source: 'both', firstVisitedAt: T2019 - 1000 });
  });

  it('una marca sin fecha se ve siempre en el viaje en el tiempo; una con fecha, solo desde ella', () => {
    const state = computeUnlockState([], {
      catalog,
      until: T2019,
      manual: [
        { level: 'country', countryCode: 'PE', visitedAt: null },
        { level: 'country', countryCode: 'MX', visitedAt: T2024 },
      ],
    });
    expect(Object.keys(state.countries)).toEqual(['PE']);
  });

  it('una marca sin fecha no borra la fecha que ya daban las fotos', () => {
    const state = computeUnlockState(photos, {
      catalog,
      manual: [{ level: 'country', countryCode: 'PT', visitedAt: null }],
    });
    expect(state.countries.PT).toMatchObject({ firstVisitedAt: T2019, source: 'both' });
  });

  it('una marca con fecha completa la fecha de otra marca que no la tenía', () => {
    const state = computeUnlockState([], {
      catalog,
      manual: [
        { level: 'country', countryCode: 'PE', visitedAt: null },
        { level: 'region', countryCode: 'PE', regionId: 'PE-LIM', visitedAt: T2022 },
      ],
    });
    expect(state.countries.PE).toMatchObject({ firstVisitedAt: T2022, source: 'manual' });
  });

  it('una foto resuelta solo a nivel de país desbloquea solo el país', () => {
    const state = computeUnlockState(
      [{ countryCode: 'PE', regionId: null, cityId: null, takenAt: T2022 }],
      { catalog },
    );
    expect(state.totals).toEqual({ countries: 1, regions: 0, cities: 0 });
    expect(state.countries.PE?.photoCount).toBe(1);
  });

  it('sin nada visitado todo está a cero', () => {
    const state = computeUnlockState([], { catalog });
    expect(state.totals).toEqual({ countries: 0, regions: 0, cities: 0 });
    expect(state.worldPercent).toBe(0);
  });
});

describe('buildFogLayer', () => {
  const square = (x: number): Polygon => ({
    type: 'Polygon',
    coordinates: [
      [
        [x, 0],
        [x + 1, 0],
        [x + 1, 1],
        [x, 1],
        [x, 0],
      ],
    ],
  });
  const areas: FeatureCollection<Polygon | MultiPolygon, AreaProperties> = {
    type: 'FeatureCollection',
    features: [
      { type: 'Feature', geometry: square(0), properties: { id: 'JP', level: 'country' } },
      { type: 'Feature', geometry: square(1), properties: { id: 'KR', level: 'country' } },
      { type: 'Feature', geometry: square(2), properties: { id: 'JP-26', level: 'region' } },
      { type: 'Feature', geometry: square(3), properties: { id: 'jp-nara', level: 'city' } },
    ],
  };

  it('marca cada área como desbloqueada o con niebla, sin tocar su geometría', () => {
    const layer = buildFogLayer(computeUnlockState(photos, { catalog }), areas);
    expect(layer.type).toBe('FeatureCollection');
    expect(layer.features.map((f) => [f.properties.id, f.properties.unlocked])).toEqual([
      ['JP', true],
      ['KR', false],
      ['JP-26', true],
      ['jp-nara', true],
    ]);
    expect(layer.features[0]?.geometry).toBe(areas.features[0]?.geometry);
  });

  it('puede filtrar por nivel para dibujar solo países, regiones o ciudades', () => {
    const layer = buildFogLayer(computeUnlockState(photos, { catalog }), areas, {
      level: 'region',
    });
    expect(layer.features.map((f) => f.properties.id)).toEqual(['JP-26']);
  });
});
