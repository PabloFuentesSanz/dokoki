import { StyleSheet, Text, View } from 'react-native';
import { colors, shadows, spacing, tilts, typography } from '../../tokens';

export interface HandNoteProps {
  /** El texto que escribió el usuario. */
  children: string;
  /** Dónde y cuándo, a máquina. */
  meta?: string;
}

/**
 * Nota escrita a mano sobre papel; la ÚNICA pieza con letra manuscrita.
 * Solo para notas personales del usuario: nunca textos de la app, títulos, botones ni avisos.
 */
export function HandNote({ children, meta }: HandNoteProps) {
  return (
    <View style={styles.note}>
      <Text style={styles.hand}>{children}</Text>
      {meta ? <Text style={styles.meta}>{meta}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  note: {
    alignSelf: 'flex-start',
    maxWidth: 280,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    backgroundColor: colors.paperPhoto,
    boxShadow: shadows.photo,
    transform: [{ rotate: tilts.note }],
  },
  hand: { ...typography.hand, color: colors.stampBlue },
  meta: { ...typography.dataS, color: colors.inkMuted, marginTop: 6 },
});
