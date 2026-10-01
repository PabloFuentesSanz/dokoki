import { clusterPhotos } from '@atlas/domain';
import { colors, MapLegend, ProgressBar, radii, spacing } from '@atlas/design-system';
import { AtlasMap } from '@atlas/map';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUnlockState } from '../../features/map/hooks/useUnlockState';
import { countryCount } from '../../features/map/services/countries';
import { usePhotoLibrary } from '../../features/photos/store/PhotoLibraryProvider';

/** Celdas de ~5 km: suficiente para ver ciudades y barrios sin miles de puntos. */
const CLUSTER_CELL_DEGREES = 0.05;

/**
 * M1.1 · Mapa mundi. Tanda 2.
 * Niebla por país (lo visitado se desbloquea) y tus fotos agrupadas. Todo se calcula en el móvil.
 * TODO(M1.1): niebla por región y ciudad cuando existan esos límites (HU-06).
 */
export default function MapScreen() {
  const { photos } = usePhotoLibrary();
  const { state, fog } = useUnlockState();
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
        fog={fog}
        photoClusters={clusters}
        accessibilityLabel="Tu mapa del mundo"
      />
      <SafeAreaView edges={['top']} style={styles.overlay} pointerEvents="box-none">
        <View style={styles.progress}>
          <ProgressBar
            label="Tu mundo"
            value={state.worldPercent}
            detail={`${state.totals.countries} de ${countryCount} países`}
          />
        </View>
        <MapLegend />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  overlay: { position: 'absolute', top: 0, left: 0, padding: spacing[4], gap: spacing[3] },
  progress: {
    padding: spacing[3],
    backgroundColor: colors.paperRaised,
    borderWidth: 1,
    borderColor: colors.ink,
    borderRadius: radii.sm,
  },
});
