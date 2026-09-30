import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing, typography } from '../../tokens';
import { Button } from '../Button/Button';
import { Icon, type IconName } from '../Icon/Icon';

export interface EmptyStateProps {
  icon?: IconName;
  /** Qué falta, en positivo. */
  title: string;
  /** Qué hacer. */
  body: string;
  /** Texto del botón. */
  action?: string;
  onAction?: () => void;
}

/** Estado vacío con recuadro discontinuo, que invita a actuar. Sin disculpas ni chistes. */
export function EmptyState({ icon = 'compass', title, body, action, onAction }: EmptyStateProps) {
  return (
    <View style={styles.box}>
      <Icon name={icon} size={36} />
      <Text role="heading" style={styles.title}>
        {title}
      </Text>
      <Text style={styles.body}>{body}</Text>
      {action ? <Button onPress={onAction}>{action}</Button> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    alignSelf: 'center',
    gap: spacing[3],
    maxWidth: 360,
    paddingVertical: spacing[7],
    paddingHorizontal: spacing[5],
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.ink,
    borderRadius: radii.sm,
  },
  title: { ...typography.heading, color: colors.ink, textAlign: 'center' },
  body: {
    ...typography.body,
    fontSize: 15,
    lineHeight: 24,
    color: colors.inkMuted,
    textAlign: 'center',
  },
});
