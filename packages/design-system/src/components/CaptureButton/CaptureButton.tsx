import { Pressable, StyleSheet } from 'react-native';
import { focusRingStyle, useFocusRing } from '../../internal/useFocusRing';
import { colors, radii } from '../../tokens';
import { Icon } from '../Icon/Icon';

export interface CaptureButtonProps {
  /** Nombre accesible; por defecto "Captura rápida: foto, nota, gasto o lugar". */
  label?: string;
  /** Abre la hoja de captura. */
  onPress?: () => void;
}

/** El botón central de captura: redondo, rojo y con costura discontinua, como un sello a punto de estampar. */
export function CaptureButton({
  label = 'Captura rápida: foto, nota, gasto o lugar',
  onPress,
}: CaptureButtonProps) {
  const { focused, focusProps } = useFocusRing();
  return (
    <Pressable
      role="button"
      aria-label={label}
      onPress={onPress}
      {...focusProps}
      style={({ pressed }) => [styles.outer, pressed && styles.pressed, focused && focusRingStyle]}
    >
      <Icon name="plus" size={26} strokeWidth={2} color={colors.onStamp} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  outer: {
    width: 56,
    height: 56,
    borderRadius: radii.round,
    backgroundColor: colors.stampRed,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.onStamp,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { backgroundColor: colors.stampRedText },
});
