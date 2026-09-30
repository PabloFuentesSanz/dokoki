import { MapLegend, spacing } from '@atlas/design-system';
import { AtlasMap } from '@atlas/map';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * M1.1 · Mapa mundi. Tanda 2.
 * TODO(M1.1): niebla con computeUnlockState/buildFogLayer (@atlas/domain/fog) a partir de
 * las fotos importadas (features/map), contador de progreso y capas (M1.2).
 */
export default function MapScreen() {
  return (
    <View style={styles.fill}>
      <AtlasMap style={styles.fill} accessibilityLabel="Tu mapa del mundo" />
      <SafeAreaView edges={['top']} style={styles.legend} pointerEvents="box-none">
        <MapLegend />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  legend: { position: 'absolute', top: 0, left: 0, padding: spacing[4] },
});
