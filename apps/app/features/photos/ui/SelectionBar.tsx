import {
  Icon,
  colors,
  iconSizes,
  radii,
  spacing,
  typography,
  type IconName,
} from '@atlas/design-system';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export interface SelectionAction {
  icon: IconName;
  label: string;
  onPress: () => void;
}

/** M3.7 · Barra de acciones de la selección múltiple, en tinta, sobre la rejilla. */
export function SelectionBar({ count, actions }: { count: number; actions: SelectionAction[] }) {
  return (
    <View
      role="toolbar"
      aria-label={`Acciones para ${count} ${count === 1 ? 'foto' : 'fotos'}`}
      style={styles.bar}
    >
      {actions.map((a) => (
        <Pressable
          key={a.label}
          role="button"
          aria-label={a.label}
          aria-disabled={count === 0}
          disabled={count === 0}
          onPress={a.onPress}
          style={({ pressed }) => [
            styles.action,
            pressed && styles.pressed,
            count === 0 && styles.off,
          ]}
        >
          <Icon name={a.icon} size={iconSizes.nav} color={colors.onStamp} />
          <Text style={styles.label}>{a.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: spacing[3],
    right: spacing[3],
    bottom: spacing[5],
    flexDirection: 'row',
    padding: spacing[2],
    backgroundColor: colors.ink,
    borderRadius: radii.sm,
  },
  action: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[1],
    minHeight: 56,
    borderRadius: radii.sm,
  },
  pressed: { backgroundColor: colors.inkMuted },
  off: { opacity: 0.5 },
  label: { ...typography.bodyS, fontSize: 13, lineHeight: 16, color: colors.onStamp },
});
