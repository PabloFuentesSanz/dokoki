import { colors, spacing } from '@atlas/design-system';
import { StyleSheet, View } from 'react-native';

/** Rayas de progreso de la bienvenida: la actual, más larga y roja (no solo por color). */
export function StepDots({ index, total, label }: { index: number; total: number; label: string }) {
  return (
    <View aria-label={`${label} ${index + 1} de ${total}`} role="progressbar" style={styles.row}>
      {Array.from({ length: total }, (_, i) => (
        <View key={i} style={[styles.dash, i === index && styles.current]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing[1], alignItems: 'center' },
  dash: { width: spacing[4], height: 3, backgroundColor: colors.ink, opacity: 0.35 },
  current: { width: spacing[6], backgroundColor: colors.stampRed, opacity: 1 },
});
