import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../../tokens';

export interface Stat {
  value: string;
  label: string;
}

export interface StatStripProps {
  /** De 2 a 4 cifras. */
  stats: readonly Stat[];
}

/** Tira de cifras entre dos líneas de tinta, como el pie de una ficha. */
export function StatStrip({ stats }: StatStripProps) {
  return (
    <View role="list" style={styles.strip}>
      {stats.slice(0, 4).map((stat) => (
        <View
          role="listitem"
          key={stat.label}
          aria-label={`${stat.value} ${stat.label}`}
          style={styles.item}
        >
          <Text style={styles.value}>{stat.value}</Text>
          <Text style={styles.label}>{stat.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  strip: {
    flexDirection: 'row',
    gap: spacing[3],
    paddingVertical: spacing[3],
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.ink,
  },
  item: { flex: 1, minWidth: 0 },
  value: { ...typography.stat, color: colors.ink },
  label: { ...typography.dataS, color: colors.inkMuted, marginTop: 2 },
});
