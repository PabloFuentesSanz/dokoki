import type { Feature, FeatureCollection, MultiPolygon, Polygon } from 'geojson';
import { describe, expect, it } from 'vitest';
import { createAreaIndex, pointInGeometry } from './areas';

const square = (x: number, y: number, size: number): number[][] => [
  [x, y],
  [x + size, y],
  [x + size, y + size],
  [x, y + size],
  [x, y],
];

/** Cuadrado 0–10 con un agujero 4–6 (como un lago o un enclave). */
const withHole: Polygon = { type: 'Polygon', coordinates: [square(0, 0, 10), square(4, 4, 2)] };
/** Dos islas. */
const islands: MultiPolygon = {
  type: 'MultiPolygon',
  coordinates: [[square(20, 0, 2)], [square(30, 0, 2)]],
};

describe('pointInGeometry', () => {
  it('dentro, fuera y dentro del agujero de un polígono', () => {
    expect(pointInGeometry({ lat: 1, lng: 1 }, withHole)).toBe(true);
    expect(pointInGeometry({ lat: 5, lng: 5 }, withHole)).toBe(false);
    expect(pointInGeometry({ lat: 11, lng: 1 }, withHole)).toBe(false);
  });

  it('cualquiera de las partes de un multipolígono', () => {
    expect(pointInGeometry({ lat: 1, lng: 31 }, islands)).toBe(true);
    expect(pointInGeometry({ lat: 1, lng: 25 }, islands)).toBe(false);
  });
});

describe('createAreaIndex', () => {
  const feature = (
    id: string,
    geometry: Polygon | MultiPolygon,
  ): Feature<Polygon | MultiPolygon, { id: string }> => ({
    type: 'Feature',
    geometry,
    properties: { id },
  });
  const areas: FeatureCollection<Polygon | MultiPolygon, { id: string }> = {
    type: 'FeatureCollection',
    features: [
      feature('AA', withHole),
      feature('BB', islands),
      feature('CC', { type: 'Polygon', coordinates: [square(4, 4, 2)] }),
    ],
  };
  const index = createAreaIndex(areas);

  it('devuelve el área que contiene el punto', () => {
    expect(index.find({ lat: 1, lng: 1 })?.properties.id).toBe('AA');
    expect(index.find({ lat: 1, lng: 21 })?.properties.id).toBe('BB');
  });

  it('un enclave gana a quien lo rodea', () => {
    expect(index.find({ lat: 5, lng: 5 })?.properties.id).toBe('CC');
  });

  it('fuera de todo (mar) no devuelve nada', () => {
    expect(index.find({ lat: 50, lng: 50 })).toBeNull();
    expect(index.find({ lat: 1, lng: 15 })).toBeNull();
    expect(index.find({ lat: 50, lng: 5 })).toBeNull();
    expect(index.find({ lat: -5, lng: 5 })).toBeNull();
  });

  it('dentro de la caja de un área pero fuera de su forma (entre islas) no devuelve nada', () => {
    expect(index.find({ lat: 1, lng: 25 })).toBeNull();
  });
});
