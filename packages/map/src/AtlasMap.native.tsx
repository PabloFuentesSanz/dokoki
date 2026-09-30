import { Camera, GeoJSONSource, Layer, Map } from '@maplibre/maplibre-react-native';
import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import {
  ATLAS_SOURCES,
  ATLAS_STYLE_URL,
  initialCamera,
  overlayLayers,
  readAreaPress,
  readClusterId,
  toClusterCollection,
  toRouteCollection,
} from './overlays';
import type { AtlasMapProps } from './types';

/** Mapa de Atlas en iOS y Android con maplibre-react-native. */
export function AtlasMap({
  initialView,
  styleUrl = ATLAS_STYLE_URL,
  fog,
  routes = [],
  photoClusters = [],
  layers,
  onPressArea,
  onPressCluster,
  interactive = true,
  style,
  accessibilityLabel = 'Mapa',
}: AtlasMapProps) {
  const specs = useMemo(() => overlayLayers(layers), [layers]);
  const bySource = (source: string) =>
    specs.filter((spec) => spec.source === source).map((spec) => <Layer key={spec.id} {...spec} />);

  const routeData = useMemo(() => toRouteCollection(routes), [routes]);
  const clusterData = useMemo(() => toClusterCollection(photoClusters), [photoClusters]);

  return (
    <Map
      style={[styles.map, style]}
      mapStyle={styleUrl}
      accessibilityLabel={accessibilityLabel}
      logo={false}
      compass={false}
      attribution
      dragPan={interactive}
      touchZoom={interactive}
      doubleTapZoom={interactive}
      touchRotate={false}
      touchPitch={false}
    >
      <Camera initialViewState={initialCamera(initialView)} />
      {fog ? (
        <GeoJSONSource
          id={ATLAS_SOURCES.fog}
          data={fog}
          onPress={(event) => {
            const area = readAreaPress(event.nativeEvent.features[0]?.properties);
            if (area) onPressArea?.(area);
          }}
        >
          {bySource(ATLAS_SOURCES.fog)}
        </GeoJSONSource>
      ) : null}
      <GeoJSONSource id={ATLAS_SOURCES.routes} data={routeData}>
        {bySource(ATLAS_SOURCES.routes)}
      </GeoJSONSource>
      <GeoJSONSource
        id={ATLAS_SOURCES.photos}
        data={clusterData}
        onPress={(event) => {
          const id = readClusterId(event.nativeEvent.features[0]?.properties);
          if (id) onPressCluster?.(id);
        }}
      >
        {bySource(ATLAS_SOURCES.photos)}
      </GeoJSONSource>
    </Map>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1 },
});
