import { colors } from '@atlas/design-system/tokens';
import { describe, expect, it } from 'vitest';
import {
  ATLAS_SOURCES,
  initialCamera,
  overlayLayers,
  readAreaPress,
  readClusterId,
  toClusterCollection,
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
  it('pinta la niebla en paper-sunk y lo desbloqueado en land-visited', () => {
    const layers = overlayLayers();
    const fog = layers.find((l) => l.id === 'atlas-fog');
    const unlocked = layers.find((l) => l.id === 'atlas-unlocked');
    expect(fog).toMatchObject({
      type: 'fill',
      source: ATLAS_SOURCES.fog,
      paint: { 'fill-color': colors.paperSunk },
    });
    expect(unlocked).toMatchObject({ type: 'fill', paint: { 'fill-color': colors.landVisited } });
  });

  it('una capa de línea por tipo de ruta: roja continua, azul discontinua, punteada', () => {
    const routes = overlayLayers().filter((l) => l.type === 'line');
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

  it('oculta las capas desactivadas', () => {
    const layers = overlayLayers({ fog: false, routes: false });
    const visibility = Object.fromEntries(layers.map((l) => [l.id, l.layout?.visibility]));
    expect(visibility['atlas-fog']).toBe('none');
    expect(visibility['atlas-route-planned']).toBe('none');
    expect(visibility['atlas-unlocked']).toBe('visible');
    expect(visibility['atlas-photos']).toBe('visible');
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
