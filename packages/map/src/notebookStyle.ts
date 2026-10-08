/**
 * Estilo base "Cuaderno de explorador" sobre las teselas vectoriales de OpenFreeMap (esquema
 * OpenMapTiles): tierra de papel, agua gris verdosa, fronteras en tinta discontinua y nombres
 * en español cuando existen. Sin claves ni límites de uso. Se entrega como JSON: el motor nativo
 * lo recibe tal cual y la web como data URL.
 */
import { colors } from '@atlas/design-system/tokens';

const NAME = ['coalesce', ['get', 'name:es'], ['get', 'name:latin'], ['get', 'name']];
const FONT = ['Noto Sans Regular'];
const FONT_BOLD = ['Noto Sans Bold'];
const FONT_ITALIC = ['Noto Sans Italic'];

const zoomed = (stops: number[]) => ['interpolate', ['linear'], ['zoom'], ...stops];

export const NOTEBOOK_STYLE = {
  version: 8,
  name: 'Atlas · Cuaderno de explorador',
  glyphs: 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',
  sources: {
    openmaptiles: { type: 'vector', url: 'https://tiles.openfreemap.org/planet' },
  },
  layers: [
    { id: 'paper', type: 'background', paint: { 'background-color': colors.paper } },
    {
      id: 'landcover',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'landcover',
      filter: ['in', ['get', 'class'], ['literal', ['wood', 'grass', 'farmland']]],
      paint: { 'fill-color': colors.paperSunk, 'fill-opacity': 0.35 },
    },
    {
      id: 'park',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'park',
      paint: { 'fill-color': colors.paperSunk, 'fill-opacity': 0.45 },
    },
    {
      id: 'residential',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'landuse',
      minzoom: 9,
      filter: ['in', ['get', 'class'], ['literal', ['residential', 'suburb', 'neighbourhood']]],
      paint: { 'fill-color': colors.paperSunk, 'fill-opacity': 0.3 },
    },
    {
      id: 'water',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'water',
      paint: { 'fill-color': colors.water },
    },
    {
      id: 'waterway',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'waterway',
      minzoom: 7,
      paint: { 'line-color': colors.water, 'line-width': zoomed([7, 0.6, 14, 2.5]) },
    },
    {
      id: 'building',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'building',
      minzoom: 14,
      paint: { 'fill-color': colors.paperSunk, 'fill-outline-color': colors.hairline },
    },
    {
      id: 'roads-minor',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      minzoom: 12,
      filter: ['in', ['get', 'class'], ['literal', ['minor', 'service', 'tertiary']]],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': colors.paperRaised, 'line-width': zoomed([12, 0.8, 16, 6]) },
    },
    {
      id: 'roads-major',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      minzoom: 5,
      filter: ['in', ['get', 'class'], ['literal', ['motorway', 'trunk', 'primary', 'secondary']]],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': colors.hairline,
        'line-width': zoomed([5, 0.4, 10, 1.4, 16, 8]),
      },
    },
    {
      id: 'rail',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      minzoom: 10,
      filter: ['==', ['get', 'class'], 'rail'],
      paint: { 'line-color': colors.inkMuted, 'line-width': 0.8, 'line-dasharray': [3, 3] },
    },
    {
      id: 'regions',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'boundary',
      minzoom: 3,
      filter: ['all', ['==', ['get', 'admin_level'], 4], ['!=', ['get', 'maritime'], 1]],
      paint: {
        'line-color': colors.ink,
        'line-opacity': 0.3,
        'line-width': 0.6,
        'line-dasharray': [1, 3],
      },
    },
    {
      id: 'countries',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'boundary',
      filter: ['all', ['==', ['get', 'admin_level'], 2], ['!=', ['get', 'maritime'], 1]],
      paint: {
        'line-color': colors.ink,
        'line-opacity': 0.55,
        'line-width': zoomed([1, 0.6, 6, 1.2]),
        'line-dasharray': [4, 2],
      },
    },
    {
      id: 'water-names',
      type: 'symbol',
      source: 'openmaptiles',
      'source-layer': 'water_name',
      layout: {
        'text-field': NAME,
        'text-font': FONT_ITALIC,
        'text-size': 12,
        'text-letter-spacing': 0.1,
      },
      paint: {
        'text-color': colors.inkMuted,
        'text-halo-color': colors.water,
        'text-halo-width': 1,
      },
    },
    {
      id: 'towns',
      type: 'symbol',
      source: 'openmaptiles',
      'source-layer': 'place',
      minzoom: 9,
      filter: ['in', ['get', 'class'], ['literal', ['town', 'village', 'suburb']]],
      layout: { 'text-field': NAME, 'text-font': FONT, 'text-size': zoomed([9, 11, 14, 14]) },
      paint: {
        'text-color': colors.inkMuted,
        'text-halo-color': colors.paper,
        'text-halo-width': 1.2,
      },
    },
    {
      id: 'cities',
      type: 'symbol',
      source: 'openmaptiles',
      'source-layer': 'place',
      minzoom: 4,
      filter: ['==', ['get', 'class'], 'city'],
      layout: {
        'text-field': NAME,
        'text-font': FONT,
        'text-size': zoomed([4, 11, 10, 16]),
      },
      paint: { 'text-color': colors.ink, 'text-halo-color': colors.paper, 'text-halo-width': 1.4 },
    },
    {
      id: 'country-names',
      type: 'symbol',
      source: 'openmaptiles',
      'source-layer': 'place',
      maxzoom: 7,
      filter: ['==', ['get', 'class'], 'country'],
      layout: {
        'text-field': NAME,
        'text-font': FONT_BOLD,
        'text-size': zoomed([1, 9, 5, 14]),
        'text-transform': 'uppercase',
        'text-letter-spacing': 0.15,
        'text-max-width': 8,
      },
      paint: {
        'text-color': colors.ink,
        'text-opacity': 0.75,
        'text-halo-color': colors.paper,
        'text-halo-width': 1.4,
      },
    },
  ],
};

/** El estilo como JSON (lo que acepta el motor nativo). */
export const NOTEBOOK_STYLE_JSON = JSON.stringify(NOTEBOOK_STYLE);

/** El estilo como data URL (lo que acepta maplibre-gl como `style`). */
export const NOTEBOOK_STYLE_URL = `data:application/json;charset=utf-8,${encodeURIComponent(NOTEBOOK_STYLE_JSON)}`;
