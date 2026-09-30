import { Pressable, StyleSheet } from 'react-native';
import { focusRingStyle, useFocusRing } from '../../internal/useFocusRing';
import { colors, iconSizes, radii, touchTarget } from '../../tokens';
import { Icon, type IconName } from '../Icon/Icon';

export interface IconButtonProps {
  icon: IconName;
  /** Obligatorio: lo que hace ("Volver", "Compartir Japón"). */
  label: string;
  /** Con borde, para usar sobre el mapa. */
  outline?: boolean;
  disabled?: boolean;
  onPress?: () => void;
}

/** Botón solo de icono de 44 × 44 px, con nombre accesible obligatorio. */
export function IconButton({
  icon,
  label,
  outline = false,
  disabled = false,
  onPress,
}: IconButtonProps) {
  const { focused, focusProps } = useFocusRing();
  return (
    <Pressable
      role="button"
      aria-label={label}
      aria-disabled={disabled}
      disabled={disabled}
      onPress={onPress}
      {...focusProps}
      style={({ pressed }) => [
        styles.base,
        outline && styles.outline,
        pressed && styles.pressed,
        focused && focusRingStyle,
      ]}
    >
      <Icon name={icon} size={iconSizes.nav} color={disabled ? colors.inkMuted : colors.ink} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    width: touchTarget,
    height: touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: radii.sm,
  },
  outline: { borderColor: colors.ink, backgroundColor: colors.paperRaised },
  pressed: { backgroundColor: colors.paperRaised },
});
