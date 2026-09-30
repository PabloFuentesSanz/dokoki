import { clusterPhotos } from '@atlas/domain';
import { MapLegend, spacing, SyncIndicator } from '@atlas/design-system';
import { AtlasMap } from '@atlas/map';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePhotoLibrary } from '../../features/photos/store/PhotoLibraryProvider';

/** Celdas de ~5 km: suficiente para ver ciudades y barrios sin miles de puntos. */
const CLUSTER_CELL_DEGREES = 0.05;

/**
 * M1.1 · Mapa mundi. Tanda 2.
 * Pinta tus fotos con GPS agrupadas. Todo se calcula en el móvil.
 * TODO(M1.1): niebla por país, región y ciudad con computeUnlockState/buildFogLayer
 * cuando exista el PlaceResolver con límites administrativos (HU-06).
 */
export default function MapScreen() {
  const { photos, status } = usePhotoLibrary();
  const clusters = useMemo(
    () =>
      clusterPhotos(
        photos.map((photo) => photo.location),
        CLUSTER_CELL_DEGREES,
      ),
    [photos],
  );

  return (
    <View style={styles.fill}>
      <AtlasMap
        style={styles.fill}
        photoClusters={clusters}
        accessibilityLabel="Tu mapa del mundo"
      />
      <SafeAreaView edges={['top']} style={styles.overlay} pointerEvents="box-none">
        <MapLegend />
        {status === 'scanning' ? (
          <View style={styles.badge}>
            <SyncIndicator
              state="pending"
              label={`${photos.length.toLocaleString('es-ES')} fotos en el mapa`}
            />
          </View>
        ) : null}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  overlay: { position: 'absolute', top: 0, left: 0, padding: spacing[4], gap: spacing[3] },
  badge: { alignSelf: 'flex-start' },
});
