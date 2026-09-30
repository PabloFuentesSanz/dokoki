import { StyleSheet, Text, View } from 'react-native';
import { colors, iconSizes, radii, typography } from '../../tokens';
import { Icon, type IconName } from '../Icon/Icon';

export type TagTone = 'neutral' | 'visited' | 'planned' | 'settled' | 'warning' | 'unexplored';

export interface TagProps {
  /** visited: borde continuo rojo. planned: discontinuo azul. unexplored: punteado. settled: oliva. warning: ocre. */
  tone?: TagTone;
  /** Siempre una palabra: nunca solo color. */
  children: string;
}

const TONES: Record<
  TagTone,
  {
    border: string;
    text: string;
    style: 'solid' | 'dashed' | 'dotted';
    bg: string;
    icon?: IconName;
  }
> = {
  neutral: { border: colors.ink, text: colors.ink, style: 'solid', bg: colors.paperRaised },
  visited: {
    border: colors.stampRed,
    text: colors.stampRedText,
    style: 'solid',
    bg: colors.paperRaised,
    icon: 'check',
  },
  planned: {
    border: colors.stampBlue,
    text: colors.stampBlue,
    style: 'dashed',
    bg: 'transparent',
    icon: 'calendar',
  },
  settled: {
    border: colors.olive,
    text: colors.oliveText,
    style: 'solid',
    bg: colors.paperRaised,
    icon: 'check',
  },
  warning: {
    border: colors.ochre,
    text: colors.ochre,
    style: 'solid',
    bg: colors.paperRaised,
    icon: 'sync',
  },
  unexplored: { border: colors.ink, text: colors.inkMuted, style: 'dotted', bg: 'transparent' },
};

/** Etiqueta de estado a máquina de escribir; el tipo de borde también informa. */
export function Tag({ tone = 'neutral', children }: TagProps) {
  const t = TONES[tone];
  return (
    <View
      style={[styles.tag, { borderColor: t.border, borderStyle: t.style, backgroundColor: t.bg }]}
    >
      {t.icon ? <Icon name={t.icon} size={iconSizes.tag} color={t.text} /> : null}
      <Text style={[styles.text, { color: t.text }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    height: 26,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderRadius: radii.sm,
  },
  text: { ...typography.data },
});
