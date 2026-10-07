import {
  Icon,
  colors,
  focusRingStyle,
  radii,
  iconSizes,
  spacing,
  typography,
  useFocusRing,
  type IconName,
} from '@atlas/design-system';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface SettingsRowProps {
  title: string;
  detail?: string;
  icon?: IconName;
  onPress: () => void;
}

/** Fila de ajustes (M10): título, detalle a máquina y flecha. 60 px de alto. */
export function SettingsRow({ title, detail, icon, onPress }: SettingsRowProps) {
  const { focused, focusProps } = useFocusRing();
  return (
    <Pressable
      role="link"
      aria-label={detail ? `${title}. ${detail}` : title}
      onPress={onPress}
      {...focusProps}
      style={({ pressed }) => [styles.row, pressed && styles.pressed, focused && focusRingStyle]}
    >
      {icon ? (
        <View style={styles.icon}>
          <Icon name={icon} size={iconSizes.button} color={colors.ink} />
        </View>
      ) : null}
      <View style={styles.text}>
        <Text style={styles.title}>{title}</Text>
        {detail ? <Text style={styles.detail}>{detail}</Text> : null}
      </View>
      <Text aria-hidden style={styles.chevron}>
        ›
      </Text>
    </Pressable>
  );
}

/** Grupo de filas con la línea de tinta arriba, como en el lienzo. */
export function SettingsGroup({ children }: { children: ReactNode }) {
  return <View style={styles.group}>{children}</View>;
}

const styles = StyleSheet.create({
  group: { borderTopWidth: 1, borderTopColor: colors.ink },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    minHeight: 60,
    paddingVertical: spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
  },
  pressed: { backgroundColor: colors.paperRaised },
  icon: {
    width: 36,
    height: 36,
    borderRadius: radii.round,
    borderWidth: 1,
    borderColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1, gap: 2 },
  title: { ...typography.bodyStrong, color: colors.ink },
  detail: { ...typography.data, color: colors.inkMuted },
  chevron: { ...typography.heading, color: colors.inkMuted },
});
