/**
 * Capas propias de Atlas sobre el mapa base, compartidas por el motor nativo y el web.
 * Todo es puro: aquí se decide QUÉ se pinta; AtlasMap.native/.web solo lo montan.
 */
import { colors } from '@atlas/design-system/tokens';
import type { FeatureCollection, LineString, Point, Polygon, Position } from 'geojson';
import type {
  FogLayer,
  AreaLevel,
  AreaPress,
  MapInitialView,
  MapLayerId,
  PhotoCluster,
  RouteKind,
  RouteLayer,
} from './types';

/**
 * Estilo genérico de OpenFreeMap, por si se quiere comparar. El de Atlas es `NOTEBOOK_STYLE`
 * (notebookStyle.ts), sobre las mismas teselas.
 */
export const LIBERTY_STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';

export const ATLAS_SOURCES = {
  fog: 'atlas-fog',
  fogMask: 'atlas-fog-mask',
  routes: 'atlas-routes',
  photos: 'atlas-photos',
} as const;

export function toRouteCollection(
  routes: readonly RouteLayer[],
): FeatureCollection<LineString, { id: string; kind: RouteKind }> {
  return {
    type: 'FeatureCollection',
    features: routes
      .filter((route) => route.path.length >= 2)
      .map((route) => ({
        type: 'Feature',
        properties: { id: route.id, kind: route.kind },
        geometry: { type: 'LineString', coordinates: route.path.map((p) => [p.lng, p.lat]) },
      })),
  };
}

export function toClusterCollection(
  clusters: readonly PhotoCluster[],
): FeatureCollection<Point, { id: string; count: number }> {
  return {
    type: 'FeatureCollection',
    features: clusters.map((cluster) => ({
      type: 'Feature',
      properties: { id: cluster.id, count: cluster.count },
      geometry: { type: 'Point', coordinates: [cluster.center.lng, cluster.center.lat] },
    })),
  };
}

/*
 * Tipos propios y estrechos para las capas de Atlas: un subconjunto del style-spec de MapLibre
 * que encaja tanto en maplibre-gl (web) como en maplibre-react-native (nativo), aunque cada
 * librería traiga su propia versión del style-spec.
 */
type GetExpression = ['get', string];
type EqualsFilter = ['==', GetExpression, string | boolean];
type AllFilter = ['all', EqualsFilter, EqualsFilter];
type LinearInterpolation = ['interpolate', ['linear'], GetExpression, ...number[]];
type ZoomInterpolation = ['interpolate', ['linear'], ['zoom'], ...number[]];
type Visibility = 'visible' | 'none';

interface FillOverlay {
  id: string;
  type: 'fill';
  source: string;
  filter?: AllFilter | EqualsFilter;
  minzoom?: number;
  maxzoom?: number;
  layout: { visibility: Visibility };
  paint: { 'fill-color': string; 'fill-opacity': number; 'fill-outline-color'?: string };
}

interface LineOverlay {
  id: string;
  type: 'line';
  source: string;
  filter: EqualsFilter | AllFilter;
  minzoom?: number;
  maxzoom?: number;
  layout: { visibility: Visibility; 'line-cap': 'round'; 'line-join': 'round' };
  paint: {
    'line-color': string;
    'line-width': number | ZoomInterpolation;
    'line-dasharray'?: number[];
    'line-blur'?: ZoomInterpolation;
    'line-opacity'?: number;
  };
}

interface CircleOverlay {
  id: string;
  type: 'circle';
  source: string;
  layout: { visibility: Visibility };
  paint: {
    'circle-color': string;
    'circle-radius': LinearInterpolation;
    'circle-stroke-color': string;
    'circle-stroke-width': number;
  };
}

export type OverlayLayer = FillOverlay | LineOverlay | CircleOverlay;

/** Guiones en unidades de grosor de línea (2,2 px): ≈ 7/5 px y 1,5/4 px, como RouteLine. */
const ROUTE_PAINT: Record<RouteKind, { color: string; dash?: number[] }> = {
  traveled: { color: colors.stampRed },
  planned: { color: colors.stampBlue, dash: [3.2, 2.3] },
  unexplored: { color: colors.inkMuted, dash: [0.7, 1.8] },
};

/** A partir de este zoom se ven las regiones dentro de los países visitados. */
export const REGION_ZOOM = 4.5;

/**
 * Niebla de videojuego: lo no visitado queda bajo una capa de papel casi opaca y lo visitado se
 * ve limpio, con el mapa a color debajo. El borde se difumina hacia dentro de lo descubierto,
 * así la niebla "se retira" en vez de cortarse en seco.
 */
const FOG_COLOR = colors.paperRaised;
const FOG_OPACITY = 0.95;
/** Ancho (y desenfoque) del borde difuminado según el zoom, en px. */
const FOG_EDGE: ZoomInterpolation = [
  'interpolate',
  ['linear'],
  ['zoom'],
  0,
  3,
  3,
  7,
  6,
  16,
  10,
  36,
];

type Level = 'country' | 'region';
type ZoomRange = { minzoom?: number; maxzoom?: number };

function areaFilter(level: Level, unlocked: boolean): AllFilter {
  return ['all', ['==', ['get', 'level'], level], ['==', ['get', 'unlocked'], unlocked]];
}

/** Áreas transparentes: no se ven, pero se pueden tocar para abrir su ficha. */
function touchable(id: string, level: Level, zoom: ZoomRange = {}): FillOverlay {
  return {
    id,
    type: 'fill',
    source: ATLAS_SOURCES.fog,
    filter: ['==', ['get', 'level'], level],
    ...zoom,
    layout: { visibility: 'visible' },
    paint: { 'fill-color': FOG_COLOR, 'fill-opacity': 0 },
  };
}

/** Borde de niebla difuminado alrededor de lo descubierto. */
function fogEdge(
  id: string,
  level: Level,
  visibility: Visibility,
  zoom: ZoomRange = {},
): LineOverlay {
  return {
    id,
    type: 'line',
    source: ATLAS_SOURCES.fog,
    filter: areaFilter(level, true),
    ...zoom,
    layout: { visibility, 'line-cap': 'round', 'line-join': 'round' },
    paint: {
      'line-color': FOG_COLOR,
      'line-width': FOG_EDGE,
      'line-blur': FOG_EDGE,
      'line-opacity': 0.6,
    },
  };
}

/** Rectángulo del mundo (latitudes Web Mercator). */
const WORLD_RING: Position[] = [
  [-180, -85],
  [180, -85],
  [180, 85],
  [-180, 85],
  [-180, -85],
];

/**
 * Velo de niebla sobre el mundo entero (tierra y mar) con un agujero por cada país visitado.
 * Cada parte de un país (islas incluidas) aporta su anillo exterior como agujero.
 */
export function toFogMask(fog: FogLayer): FeatureCollection<Polygon, { id: string }> {
  const holes: Position[][] = [];
  for (const feature of fog.features) {
    const { level, unlocked } = feature.properties;
    if (level !== 'country' || !unlocked) continue;
    const polygons =
      feature.geometry.type === 'Polygon'
        ? [feature.geometry.coordinates]
        : feature.geometry.coordinates;
    for (const polygon of polygons) {
      const [outer] = polygon;
      if (outer) holes.push(outer);
    }
  }
  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: { id: 'fog' },
        geometry: { type: 'Polygon', coordinates: [WORLD_RING, ...holes] },
      },
    ],
  };
}

export function overlayLayers(visible: Partial<Record<MapLayerId, boolean>> = {}): OverlayLayer[] {
  const visibility = (layer: MapLayerId): Visibility =>
    visible[layer] === false ? 'none' : 'visible';

  const routeKinds: readonly RouteKind[] = ['traveled', 'planned', 'unexplored'];
  const routeLayers: LineOverlay[] = routeKinds.map((kind) => {
    const { color, dash } = ROUTE_PAINT[kind];
    return {
      id: `atlas-route-${kind}`,
      type: 'line',
      source: ATLAS_SOURCES.routes,
      filter: ['==', ['get', 'kind'], kind],
      layout: { visibility: visibility('routes'), 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': color,
        'line-width': 2.2,
        ...(dash ? { 'line-dasharray': dash } : {}),
      },
    };
  });

  return [
    // Velo de niebla sobre todo el mundo menos los países visitados. Al acercarse, dentro de
    // esos países la niebla vuelve sobre las regiones que aún no has pisado.
    {
      id: 'atlas-fog',
      type: 'fill',
      source: ATLAS_SOURCES.fogMask,
      layout: { visibility: visibility('fog') },
      paint: { 'fill-color': FOG_COLOR, 'fill-opacity': FOG_OPACITY },
    },
    {
      id: 'atlas-region-fog',
      type: 'fill',
      source: ATLAS_SOURCES.fog,
      filter: areaFilter('region', false),
      minzoom: REGION_ZOOM,
      layout: { visibility: visibility('fog') },
      paint: { 'fill-color': FOG_COLOR, 'fill-opacity': FOG_OPACITY },
    },
    fogEdge('atlas-fog-edge', 'country', visibility('fog')),
    fogEdge('atlas-region-fog-edge', 'region', visibility('fog'), { minzoom: REGION_ZOOM }),
    touchable('atlas-countries', 'country', { maxzoom: REGION_ZOOM }),
    touchable('atlas-regions', 'region', { minzoom: REGION_ZOOM }),
    ...routeLayers,
    {
      id: 'atlas-photos',
      type: 'circle',
      source: ATLAS_SOURCES.photos,
      layout: { visibility: visibility('photos') },
      paint: {
        'circle-color': colors.stampRed,
        'circle-radius': ['interpolate', ['linear'], ['get', 'count'], 1, 5, 100, 12, 1000, 18],
        'circle-stroke-color': colors.paperRaised,
        'circle-stroke-width': 1.5,
      },
    },
  ];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

const LEVELS: readonly AreaLevel[] = ['country', 'region', 'city'];

function isLevel(value: unknown): value is AreaLevel {
  return LEVELS.some((level) => level === value);
}

/** Lee un área de las propiedades de un feature tocado (vienen sin tipo del motor). */
export function readAreaPress(properties: unknown): AreaPress | null {
  if (!isRecord(properties)) return null;
  const { id, level } = properties;
  if (typeof id !== 'string' || !isLevel(level)) return null;
  return { id, level };
}

export function readClusterId(properties: unknown): string | null {
  if (!isRecord(properties) || typeof properties.id !== 'string') return null;
  return properties.id;
}

export type CameraInit =
  { center: [number, number]; zoom: number } | { bounds: [number, number, number, number] };

/** Vista inicial en el formato [lng, lat] de MapLibre. Por defecto, el mundo entero. */
export function initialCamera(view?: MapInitialView): CameraInit {
  if (!view) return { center: [10, 25], zoom: 1 };
  if ('bounds' in view) {
    const { west, south, east, north } = view.bounds;
    return { bounds: [west, south, east, north] };
  }
  return { center: [view.center.lng, view.center.lat], zoom: view.zoom };
}
