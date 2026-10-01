import { colors } from '@atlas/design-system/tokens';
import { describe, expect, it } from 'vitest';
import {
  ATLAS_SOURCES,
  initialCamera,
  overlayLayers,
  REGION_ZOOM,
  readAreaPress,
  readClusterId,
  toClusterCollection,
  toFogMask,
  toRouteCollection,
} from './overlays';

describe('toRouteCollection', () => {
  it('convierte cada ruta en una línea [lng, lat] con su tipo', () => {
    const collection = toRouteCollection([
      {
        id: 'jp-2024',
        kind: 'traveled',
        path: [
          { lat: 35.01, lng: 135.77 },
          { lat: 34.68, lng: 135.8 },
        ],
      },
      { id: 'solo', kind: 'planned', path: [{ lat: 0, lng: 0 }] },
    ]);
    expect(collection.features).toEqual([
      {
        type: 'Feature',
        properties: { id: 'jp-2024', kind: 'traveled' },
        geometry: {
          type: 'LineString',
          coordinates: [
            [135.77, 35.01],
            [135.8, 34.68],
          ],
        },
      },
    ]);
  });
});

describe('toClusterCollection', () => {
  it('convierte cada grupo en un punto con su número de fotos', () => {
    expect(
      toClusterCollection([{ id: 'c1', count: 48, center: { lat: 34.97, lng: 135.77 } }])
        .features[0],
    ).toEqual({
      type: 'Feature',
      properties: { id: 'c1', count: 48 },
      geometry: { type: 'Point', coordinates: [135.77, 34.97] },
    });
  });
});

describe('overlayLayers', () => {
  it('la niebla es un velo casi opaco sobre el mundo; las áreas son tocables pero invisibles', () => {
    const layers = overlayLayers();
    const fog = layers.find((l) => l.id === 'atlas-fog');
    expect(fog).toMatchObject({
      type: 'fill',
      source: ATLAS_SOURCES.fogMask,
      paint: { 'fill-color': colors.paperRaised },
    });
    expect(fog?.type === 'fill' && fog.paint['fill-opacity']).toBeGreaterThan(0.9);
    expect(layers.find((l) => l.id === 'atlas-countries')).toMatchObject({
      type: 'fill',
      paint: { 'fill-opacity': 0 },
    });
  });

  it('el borde de lo descubierto se difumina con una línea borrosa del color de la niebla', () => {
    const edge = overlayLayers().find((l) => l.id === 'atlas-fog-edge');
    expect(edge).toMatchObject({ type: 'line', paint: { 'line-color': colors.paperRaised } });
    expect(edge?.type === 'line' && edge.paint['line-blur']).toBeTruthy();
  });

  it('una capa de línea por tipo de ruta: roja continua, azul discontinua, punteada', () => {
    const routes = overlayLayers().filter((l) => l.id.startsWith('atlas-route-'));
    expect(routes.map((l) => l.id)).toEqual([
      'atlas-route-traveled',
      'atlas-route-planned',
      'atlas-route-unexplored',
    ]);
    expect(routes[0]).toMatchObject({ paint: { 'line-color': colors.stampRed } });
    expect(routes[0]?.paint).not.toHaveProperty('line-dasharray');
    expect(routes[1]).toMatchObject({ paint: { 'line-color': colors.stampBlue } });
    expect(routes[1]?.paint).toHaveProperty('line-dasharray');
  });

  it('al acercarse, la niebla vuelve sobre las regiones no visitadas de los países visitados', () => {
    const layers = overlayLayers();
    expect(layers.find((l) => l.id === 'atlas-region-fog')).toMatchObject({
      minzoom: REGION_ZOOM,
      filter: ['all', ['==', ['get', 'level'], 'region'], ['==', ['get', 'unlocked'], false]],
    });
    expect(layers.find((l) => l.id === 'atlas-regions')).toMatchObject({ minzoom: REGION_ZOOM });
    expect(layers.find((l) => l.id === 'atlas-countries')).toMatchObject({ maxzoom: REGION_ZOOM });
  });

  it('oculta las capas desactivadas', () => {
    const layers = overlayLayers({ fog: false, routes: false });
    const visibility = Object.fromEntries(layers.map((l) => [l.id, l.layout?.visibility]));
    expect(visibility['atlas-fog']).toBe('none');
    expect(visibility['atlas-route-planned']).toBe('none');
    expect(visibility['atlas-fog-edge']).toBe('none');
    expect(visibility['atlas-countries']).toBe('visible');
    expect(visibility['atlas-photos']).toBe('visible');
  });
});

describe('toFogMask', () => {
  const square = (x: number): number[][] => [
    [x, 0],
    [x + 1, 0],
    [x + 1, 1],
    [x, 1],
    [x, 0],
  ];
  it('un velo del tamaño del mundo con un agujero por cada parte de cada país visitado', () => {
    const mask = toFogMask({
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: { type: 'Polygon', coordinates: [square(0)] },
          properties: { id: 'ES', level: 'country', unlocked: true },
        },
        {
          type: 'Feature',
          geometry: { type: 'MultiPolygon', coordinates: [[square(10)], [square(20)]] },
          properties: { id: 'JP', level: 'country', unlocked: true },
        },
        {
          type: 'Feature',
          geometry: { type: 'Polygon', coordinates: [square(30)] },
          properties: { id: 'PE', level: 'country', unlocked: false },
        },
        {
          type: 'Feature',
          geometry: { type: 'Polygon', coordinates: [square(40)] },
          properties: { id: 'JP-26', level: 'region', unlocked: true },
        },
      ],
    });
    const rings = mask.features[0]?.geometry.coordinates ?? [];
    expect(rings).toHaveLength(4);
    expect(rings[0]).toContainEqual([180, 85]);
    expect(rings.slice(1)).toEqual([square(0), square(10), square(20)]);
  });

  it('sin nada visitado, el velo cubre todo', () => {
    expect(
      toFogMask({ type: 'FeatureCollection', features: [] }).features[0]?.geometry.coordinates,
    ).toHaveLength(1);
  });
});

describe('readAreaPress / readClusterId', () => {
  it('lee id y nivel de las propiedades de un área tocada', () => {
    expect(readAreaPress({ id: 'JP', level: 'country', unlocked: true })).toEqual({
      id: 'JP',
      level: 'country',
    });
  });

  it('descarta propiedades que no son de un área', () => {
    expect(readAreaPress(null)).toBeNull();
    expect(readAreaPress({ id: 3, level: 'country' })).toBeNull();
    expect(readAreaPress({ id: 'JP', level: 'continent' })).toBeNull();
  });

  it('lee el id de un grupo de fotos', () => {
    expect(readClusterId({ id: 'c1', count: 4 })).toBe('c1');
    expect(readClusterId({ count: 4 })).toBeNull();
  });
});

describe('initialCamera', () => {
  it('por defecto muestra el mundo', () => {
    expect(initialCamera()).toEqual({ center: [10, 25], zoom: 1 });
  });

  it('acepta centro y zoom o una caja', () => {
    expect(initialCamera({ center: { lat: 36, lng: 138 }, zoom: 4 })).toEqual({
      center: [138, 36],
      zoom: 4,
    });
    expect(initialCamera({ bounds: { west: 129, south: 31, east: 146, north: 46 } })).toEqual({
      bounds: [129, 31, 146, 46],
    });
  });
});
