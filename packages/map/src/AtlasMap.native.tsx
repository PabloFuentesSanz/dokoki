import { Camera, GeoJSONSource, Layer, Map } from '@maplibre/maplibre-react-native';
import { File, Paths } from 'expo-file-system';
import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import {
  ATLAS_SOURCES,
  initialCamera,
  overlayLayers,
  readAreaPress,
  readClusterId,
  toClusterCollection,
  toFogMask,
  toRouteCollection,
} from './overlays';
import { NOTEBOOK_STYLE_JSON } from './notebookStyle';
import type { AtlasMapProps } from './types';

let notebookStyleUri: string | null = null;

/**
 * El estilo propio se escribe una vez por arranque en la caché y se pasa como `file://`: así el
 * motor nativo lo trata siempre como URL (en iOS un JSON en línea no es fiable).
 */
function defaultStyle(): string {
  if (notebookStyleUri) return notebookStyleUri;
  try {
    const file = new File(Paths.cache, 'atlas-notebook-style.json');
    file.write(NOTEBOOK_STYLE_JSON);
    notebookStyleUri = file.uri;
    return notebookStyleUri;
  } catch {
    return NOTEBOOK_STYLE_JSON;
  }
}

/** Mapa de Atlas en iOS y Android con maplibre-react-native. */
export function AtlasMap({
  initialView,
  styleUrl,
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
  const maskData = useMemo(
    () => toFogMask(fog ?? { type: 'FeatureCollection', features: [] }),
    [fog],
  );

  return (
    <Map
      style={[styles.map, style]}
      mapStyle={styleUrl ?? defaultStyle()}
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
        <GeoJSONSource id={ATLAS_SOURCES.fogMask} data={maskData}>
          {bySource(ATLAS_SOURCES.fogMask)}
        </GeoJSONSource>
      ) : null}
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
