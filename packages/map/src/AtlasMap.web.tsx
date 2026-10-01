import 'maplibre-gl/dist/maplibre-gl.css';
import { Map as MapLibreMap, type GeoJSONSource } from 'maplibre-gl';
import { useEffect, useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  ATLAS_SOURCES,
  ATLAS_STYLE_URL,
  initialCamera,
  overlayLayers,
  readAreaPress,
  readClusterId,
  toClusterCollection,
  toFogMask,
  toRouteCollection,
} from './overlays';
import type { AtlasMapProps, FogLayer } from './types';

const EMPTY: FogLayer = { type: 'FeatureCollection', features: [] };

/** Mapa de Atlas en web (visor de escritorio) con maplibre-gl. */
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
  const container = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const handlers = useRef({ onPressArea, onPressCluster });

  const data = useMemo(
    () => ({
      [ATLAS_SOURCES.fog]: fog ?? EMPTY,
      [ATLAS_SOURCES.fogMask]: fog
        ? toFogMask(fog)
        : { type: 'FeatureCollection' as const, features: [] },
      [ATLAS_SOURCES.routes]: toRouteCollection(routes),
      [ATLAS_SOURCES.photos]: toClusterCollection(photoClusters),
    }),
    [fog, routes, photoClusters],
  );
  const dataRef = useRef(data);
  const specs = useMemo(() => overlayLayers(layers), [layers]);
  const specsRef = useRef(specs);

  // Los manejadores del mapa leen siempre lo último sin recrear el mapa.
  useEffect(() => {
    handlers.current = { onPressArea, onPressCluster };
    dataRef.current = data;
    specsRef.current = specs;
  });

  // Crea el mapa una vez por estilo; los datos y capas se actualizan en los efectos de abajo.
  useEffect(() => {
    if (!container.current) return undefined;
    const camera = initialCamera(initialView);
    const map = new MapLibreMap({
      container: container.current,
      style: styleUrl,
      interactive,
      attributionControl: { compact: true },
      ...('bounds' in camera
        ? { bounds: camera.bounds }
        : { center: camera.center, zoom: camera.zoom }),
    });
    mapRef.current = map;

    map.on('load', () => {
      for (const [id, collection] of Object.entries(dataRef.current)) {
        map.addSource(id, { type: 'geojson', data: collection });
      }
      for (const spec of specsRef.current) map.addLayer(spec);
    });
    for (const layer of [
      'atlas-fog',
      'atlas-unlocked',
      'atlas-region-fog',
      'atlas-region-unlocked',
    ]) {
      map.on('click', layer, (event) => {
        const area = readAreaPress(event.features?.[0]?.properties);
        if (area) handlers.current.onPressArea?.(area);
      });
    }
    map.on('click', 'atlas-photos', (event) => {
      const id = readClusterId(event.features?.[0]?.properties);
      if (id) handlers.current.onPressCluster?.(id);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // La vista inicial solo se aplica al crear el mapa.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [styleUrl, interactive]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map?.isStyleLoaded()) return;
    for (const [id, collection] of Object.entries(data))
      map.getSource<GeoJSONSource>(id)?.setData(collection);
  }, [data]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map?.isStyleLoaded()) return;
    for (const spec of specs) {
      if (map.getLayer(spec.id))
        map.setLayoutProperty(spec.id, 'visibility', spec.layout?.visibility ?? 'visible');
    }
  }, [specs]);

  return (
    <View style={[styles.map, style]} role="region" aria-label={accessibilityLabel}>
      <div ref={container} style={{ position: 'absolute', inset: 0 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1, overflow: 'hidden' },
});
