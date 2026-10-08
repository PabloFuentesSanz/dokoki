import {
  IconButton,
  Reveal,
  SegmentedTabs,
  Tag,
  colors,
  radii,
  spacing,
  typography,
} from '@atlas/design-system';
import { clusterPhotos, type LatLng } from '@atlas/domain';
import { AtlasMap, type MapInitialView } from '@atlas/map';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen, useGutter } from '../../components/Screen';
import { placeFolders, selectPhotos } from '../../features/photos/services/gallery';
import { useClusterGroup } from '../../features/photos/hooks/useClusterGroup';
import { ClusterSheet } from '../../features/photos/ui/ClusterSheet';
import { usePhotoLibrary } from '../../features/photos/store/PhotoLibraryProvider';
import { PhotoGrid } from '../../features/photos/ui/PhotoGrid';
import { PhotoLibraryPanel } from '../../features/photos/ui/PhotoLibraryPanel';
import { PlaceFolderCard } from '../../features/photos/ui/PlaceFolderCard';

type Mode = 'place' | 'time' | 'map';
const MODES: readonly { value: Mode; label: string }[] = [
  { value: 'place', label: 'Por lugar' },
  { value: 'time', label: 'Por tiempo' },
  { value: 'map', label: 'En el mapa' },
];
/** Grupos de ~1 km: se ven barrios y lugares, no solo ciudades. */
const PHOTO_MAP_CELL = 0.01;

/** Encuadre inicial: la ciudad con más fotos recientes no se sabe aquí; basta con la última foto. */
function mapView(
  photos: readonly { location: LatLng; takenAt: number }[],
): MapInitialView | undefined {
  const last = photos.reduce<{ location: LatLng; takenAt: number } | undefined>(
    (best, p) => (!best || p.takenAt > best.takenAt ? p : best),
    undefined,
  );
  return last ? { center: last.location, zoom: 11 } : undefined;
}

/** Aviso de la bandeja de fotos sin ubicación (M3.5): borde discontinuo ocre, "Pendiente". */
function UnlocatedCard({ count }: { count: number }) {
  return (
    <Pressable
      role="link"
      aria-label={`${count} fotos sin ubicación, colocarlas`}
      onPress={() => router.push('/unlocated')}
      style={({ pressed }) => [styles.unlocated, pressed && styles.pressed]}
    >
      <View style={styles.unlocatedText}>
        <Text style={styles.unlocatedTitle}>
          {`${count.toLocaleString('es-ES')} fotos sin ubicación`}
        </Text>
        <Text style={styles.meta}>Te ayudamos a colocarlas por fecha</Text>
      </View>
      <Tag tone="warning">Pendiente</Tag>
    </Pressable>
  );
}

/**
 * M3.1 · Fotos por lugar y M3.2 · Fotos por tiempo. Miniaturas leídas en el momento del carrete:
 * nada se copia ni sale del móvil. La lectura del carrete (M3.8) está en "Importación".
 * TODO(M3.1): bajar a región y ciudad dentro de cada país; pestaña "En el mapa" (M3.3).
 */
export default function PhotosScreen() {
  const { assignments, unlocated, scannedTotal, status, photos } = usePhotoLibrary();
  const [mode, setMode] = useState<Mode>('place');
  const [openCluster, setOpenCluster] = useState<string | null>(null);
  const group = useClusterGroup(openCluster, PHOTO_MAP_CELL);
  const onMap = mode === 'map';
  // Solo se agrupa con el mapa abierto: con 30.000 fotos no se recalcula en las otras pestañas.
  const clusters = useMemo(
    () =>
      onMap
        ? clusterPhotos(
            photos.map((p) => p.location),
            PHOTO_MAP_CELL,
          )
        : [],
    [photos, onMap],
  );
  const gutter = useGutter();
  const folders = useMemo(() => placeFolders(assignments), [assignments]);
  const all = useMemo(() => selectPhotos(assignments, { kind: 'all' }), [assignments]);

  const importButton = (
    <IconButton
      icon="sync"
      label="Importación del carrete"
      onPress={() => router.push('/import')}
    />
  );

  if (scannedTotal === 0 || status === 'unsupported' || status === 'denied') {
    return (
      <Screen title="Fotos" actions={importButton}>
        <PhotoLibraryPanel />
      </Screen>
    );
  }

  const header = (
    <View style={styles.header}>
      <SegmentedTabs label="Ver fotos" options={MODES} value={mode} onChange={setMode} />
      {unlocated.length > 0 ? <UnlocatedCard count={unlocated.length} /> : null}
    </View>
  );

  return (
    <Screen title="Fotos" actions={importButton} scroll={false}>
      {mode === 'map' ? (
        <View style={styles.fill}>
          <View style={{ paddingHorizontal: gutter }}>{header}</View>
          <View style={styles.mapBox}>
            <AtlasMap
              initialView={mapView(photos)}
              photoClusters={clusters}
              layers={{ fog: false, routes: false }}
              onPressCluster={setOpenCluster}
              accessibilityLabel="Mapa de tus fotos agrupadas por lugar"
            />
          </View>
          <ClusterSheet group={group} onClose={() => setOpenCluster(null)} />
        </View>
      ) : mode === 'time' ? (
        <PhotoGrid photos={all} scope="all" header={header} />
      ) : (
        <FlatList
          data={folders}
          keyExtractor={(f) => f.code}
          numColumns={2}
          ListHeaderComponent={header}
          columnWrapperStyle={styles.columns}
          contentContainerStyle={[styles.folders, { paddingHorizontal: gutter }]}
          renderItem={({ item, index }) => (
            <Reveal delay={Math.min(index, 7) * 50} style={styles.folder}>
              <PlaceFolderCard
                folder={item}
                onPress={() =>
                  router.push({ pathname: '/gallery', params: { scope: `country:${item.code}` } })
                }
              />
            </Reveal>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: spacing[4], paddingBottom: spacing[4] },
  fill: { flex: 1 },
  mapBox: { flex: 1, borderTopWidth: 1, borderTopColor: colors.ink },
  folders: { gap: spacing[5], paddingBottom: spacing[6] },
  columns: { gap: spacing[3] },
  folder: { flex: 1 },
  unlocated: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[3],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.ochre,
    borderRadius: radii.sm,
  },
  pressed: { backgroundColor: colors.paperRaised },
  unlocatedText: { flex: 1, gap: spacing[1] },
  unlocatedTitle: { ...typography.bodyStrong, color: colors.ink },
  meta: { ...typography.data, color: colors.inkMuted },
});
