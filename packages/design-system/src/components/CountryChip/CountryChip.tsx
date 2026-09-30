import { Pressable, StyleSheet, Text, View } from 'react-native';
import { focusRingStyle, useFocusRing } from '../../internal/useFocusRing';
import { colors, radii, spacing, typography } from '../../tokens';

export interface CountryChipProps {
  /** ISO 3166 alfa-2. Nunca banderas emoji. */
  code: string;
  name: string;
  /** Discontinuo: aún no desbloqueado. */
  pending?: boolean;
  /** Si navega (a la ficha del país). */
  onPress?: () => void;
}

/** País con su código ISO en una cajita a máquina en lugar de bandera. */
export function CountryChip({ code, name, pending = false, onPress }: CountryChipProps) {
  const { focused, focusProps } = useFocusRing();
  const content = (
    <>
      <View style={styles.codeBox} aria-hidden>
        <Text style={[styles.code, pending && styles.muted]}>{code.toUpperCase()}</Text>
      </View>
      <Text style={[styles.name, pending && styles.muted]}>{name}</Text>
    </>
  );
  const chipStyle = [styles.chip, pending && styles.pending, focused && focusRingStyle];
  if (!onPress) return <View style={chipStyle}>{content}</View>;
  return (
    <Pressable role="link" aria-label={name} onPress={onPress} {...focusProps} style={chipStyle}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing[2],
    height: 36,
    paddingLeft: 6,
    paddingRight: spacing[3],
    borderWidth: 1,
    borderColor: colors.ink,
    borderRadius: radii.sm,
    backgroundColor: colors.paperRaised,
  },
  pending: { borderStyle: 'dashed', backgroundColor: 'transparent' },
  codeBox: {
    borderWidth: 1,
    borderColor: colors.ink,
    borderRadius: 2,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  code: {
    ...typography.dataStrong,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.5,
    color: colors.ink,
  },
  name: { ...typography.bodyStrong, fontSize: 14, color: colors.ink },
  muted: { color: colors.inkMuted },
});
