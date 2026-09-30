/**
 * Capas propias de Atlas sobre el mapa base, compartidas por el motor nativo y el web.
 * Todo es puro: aquí se decide QUÉ se pinta; AtlasMap.native/.web solo lo montan.
 */
import { colors } from '@atlas/design-system/tokens';
import type { FeatureCollection, LineString, Point } from 'geojson';
import type {
  AreaLevel,
  AreaPress,
  MapInitialView,
  MapLayerId,
  PhotoCluster,
  RouteKind,
  RouteLayer,
} from './types';

/**
 * Estilo base: OpenFreeMap (gratis, sin claves, uso comercial permitido).
 * TODO(M1.1): sustituir por el estilo propio "Cuaderno de explorador" hecho en Maputnik
 * (tierra paper, agua water, etiquetas en serif) y servirlo desde Cloudflare.
 */
export const ATLAS_STYLE_URL = 'https://tiles.openfreemap.org/styles/positron';

export const ATLAS_SOURCES = {
  fog: 'atlas-fog',
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
type LinearInterpolation = ['interpolate', ['linear'], GetExpression, ...number[]];
type Visibility = 'visible' | 'none';

interface FillOverlay {
  id: string;
  type: 'fill';
  source: string;
  filter: EqualsFilter;
  layout: { visibility: Visibility };
  paint: { 'fill-color': string; 'fill-opacity': number; 'fill-outline-color'?: string };
}

interface LineOverlay {
  id: string;
  type: 'line';
  source: string;
  filter: EqualsFilter;
  layout: { visibility: Visibility; 'line-cap': 'round'; 'line-join': 'round' };
  paint: { 'line-color': string; 'line-width': number; 'line-dasharray'?: number[] };
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
    {
      id: 'atlas-unlocked',
      type: 'fill',
      source: ATLAS_SOURCES.fog,
      filter: ['==', ['get', 'unlocked'], true],
      layout: { visibility: visibility('unlocked') },
      paint: { 'fill-color': colors.landVisited, 'fill-opacity': 0.55 },
    },
    {
      id: 'atlas-fog',
      type: 'fill',
      source: ATLAS_SOURCES.fog,
      filter: ['==', ['get', 'unlocked'], false],
      layout: { visibility: visibility('fog') },
      // La niebla no se comunica solo con color: el borde punteado también la distingue.
      paint: {
        'fill-color': colors.paperSunk,
        'fill-opacity': 0.92,
        'fill-outline-color': colors.inkMuted,
      },
    },
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
