import type { FeatureCollection, MultiPolygon, Polygon } from 'geojson';
import type { StyleProp, ViewStyle } from 'react-native';

/** Punto WGS-84. */
export interface LatLng {
  lat: number;
  lng: number;
}

/** Caja geográfica en grados. */
export interface BoundingBox {
  west: number;
  south: number;
  east: number;
  north: number;
}

export type AreaLevel = 'country' | 'region' | 'city';

/** Niebla: cada área con `unlocked`. Compatible con `buildFogLayer` de @atlas/domain/fog. */
export type FogLayer = FeatureCollection<
  Polygon | MultiPolygon,
  { id: string; level: AreaLevel; unlocked: boolean }
>;

/** El trazo informa: continua = recorrido, discontinua = planificado, punteada = por descubrir. */
export type RouteKind = 'traveled' | 'planned' | 'unexplored';

export interface RouteLayer {
  id: string;
  kind: RouteKind;
  /** Ciudades del viaje en orden (HU-23). */
  path: readonly LatLng[];
}

/**
 * Grupo de fotos en el mapa. Se calcula y se pinta en el dispositivo: sus coordenadas
 * nunca se envían a ningún servidor.
 */
export interface PhotoCluster {
  id: string;
  center: LatLng;
  count: number;
}

/** Capas del MVP (HU-10): desbloqueado, niebla, fotos y rutas de viajes. */
export type MapLayerId = 'unlocked' | 'fog' | 'photos' | 'routes';

export type MapInitialView = { center: LatLng; zoom: number } | { bounds: BoundingBox };

export interface AreaPress {
  id: string;
  level: AreaLevel;
}

export interface AtlasMapProps {
  /** Vista inicial. Por defecto, el mundo entero. */
  initialView?: MapInitialView;
  /** Estilo MapLibre (URL; en nativo también JSON). Por defecto, "Cuaderno de explorador". */
  styleUrl?: string;
  fog?: FogLayer;
  routes?: readonly RouteLayer[];
  photoClusters?: readonly PhotoCluster[];
  /** Visibilidad de cada capa; todas visibles por defecto. */
  layers?: Partial<Record<MapLayerId, boolean>>;
  /** Tocar un país, región o ciudad abre su ficha (HU-11). */
  onPressArea?: (area: AreaPress) => void;
  /** Tocar un grupo de fotos lo abre (M3.3). */
  onPressCluster?: (clusterId: string) => void;
  /** false para miniaturas estáticas (tarjetas, detalle de foto). */
  interactive?: boolean;
  style?: StyleProp<ViewStyle>;
  /** Nombre accesible del mapa. */
  accessibilityLabel?: string;
}
