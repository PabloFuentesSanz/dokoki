import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, typography } from '../../tokens';

export interface AvatarProps {
  /** Nombre completo. */
  name: string;
  /** 36 por defecto. */
  size?: number;
}

export function initials(name: string): string {
  const letters = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase());
  return letters.slice(0, 2).join('') || '?';
}

/** Iniciales en círculo de papel; se solapan en grupos. */
export function Avatar({ name, size = 36 }: AvatarProps) {
  return (
    <View role="img" aria-label={name} style={[styles.avatar, { width: size, height: size }]}>
      <Text
        style={[
          styles.text,
          { fontSize: Math.round(size * 0.38), lineHeight: Math.round(size * 0.5) },
        ]}
      >
        {initials(name)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    borderRadius: radii.round,
    backgroundColor: colors.paperSunk,
    borderWidth: 1,
    borderColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { fontFamily: typography.bodyStrong.fontFamily, color: colors.ink },
});
