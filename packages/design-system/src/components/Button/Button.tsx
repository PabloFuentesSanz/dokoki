import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { focusRingStyle, useFocusRing } from '../../internal/useFocusRing';
import { colors, iconSizes, radii, spacing, touchTarget, typography } from '../../tokens';
import { Icon, type IconName } from '../Icon/Icon';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export interface ButtonProps {
  /** El texto dice exactamente lo que pasa: "Planificar viaje", "Saldar", "Guardar gasto". */
  children: string;
  /** primary: la acción principal, una por pantalla. secondary: alternativas. ghost: terciarias en línea. danger: borrar o salir. */
  variant?: ButtonVariant;
  /** md (44 px) por defecto; sm (36 px) solo dentro de filas en escritorio. */
  size?: 'md' | 'sm';
  /** Icono delante del texto. */
  icon?: IconName;
  /** Muestra el giro y bloquea el botón. */
  loading?: boolean;
  /** Ancho completo. */
  block?: boolean;
  disabled?: boolean;
  onPress?: () => void;
}

const FG: Record<ButtonVariant, string> = {
  primary: colors.onStamp,
  secondary: colors.ink,
  ghost: colors.ink,
  danger: colors.stampRedText,
};

/** Botón de texto en serif negrita con 4 variantes; el primario es el rojo de sello. */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  block = false,
  disabled = false,
  onPress,
}: ButtonProps) {
  const { focused, focusProps } = useFocusRing();
  const inactive = disabled || loading;
  const fg = inactive ? colors.inkMuted : FG[variant];

  return (
    <Pressable
      role="button"
      aria-disabled={inactive}
      aria-busy={loading}
      disabled={inactive}
      onPress={onPress}
      {...focusProps}
      style={({ pressed }) => [
        styles.base,
        size === 'sm' && styles.sm,
        styles[variant],
        block && styles.block,
        pressed && !inactive && pressedStyles[variant],
        inactive && styles.disabled,
        focused && focusRingStyle,
      ]}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="small" color={fg} aria-hidden />
        ) : icon ? (
          <Icon name={icon} size={iconSizes.button} color={fg} />
        ) : null}
        <Text
          style={[
            styles.label,
            size === 'sm' && styles.labelSm,
            { color: fg },
            variant === 'ghost' && styles.ghostLabel,
          ]}
        >
          {children}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: touchTarget,
    paddingHorizontal: spacing[5],
    borderWidth: 1,
    borderColor: colors.ink,
    borderRadius: radii.sm,
    backgroundColor: 'transparent',
    alignSelf: 'flex-start',
    justifyContent: 'center',
  },
  sm: { minHeight: 36, paddingHorizontal: spacing[4] },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
  },
  primary: { backgroundColor: colors.stampRed, borderColor: colors.stampRed },
  secondary: {},
  ghost: { borderColor: 'transparent' },
  danger: { borderColor: colors.stampRedText },
  block: { alignSelf: 'stretch' },
  disabled: { backgroundColor: colors.paperSunk, borderColor: colors.paperSunk },
  label: { ...typography.bodyStrong, lineHeight: 20 },
  labelSm: { fontSize: 14 },
  ghostLabel: { textDecorationLine: 'underline', textDecorationStyle: 'dashed' },
});

const pressedStyles = StyleSheet.create({
  primary: { backgroundColor: colors.stampRedText, borderColor: colors.stampRedText },
  secondary: { backgroundColor: colors.paperRaised },
  ghost: { backgroundColor: colors.paperRaised },
  danger: { backgroundColor: colors.paperRaised },
});
