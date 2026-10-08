import {
  Icon,
  colors,
  focusRingStyle,
  iconSizes,
  radii,
  spacing,
  motion,
  nativeDriver,
  useAnimatedValue,
  useFocusRing,
} from '@atlas/design-system';
import {
  Animated,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { thumbnailUri } from '../services/thumbnails';

interface PhotoThumbProps {
  id: string;
  /** Nombre accesible si se puede tocar: "Foto del 12 de abril de 2024". */
  label?: string;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  /** Mantener pulsado: empieza la selección múltiple (M3.7). */
  onLongPress?: () => void;
  /** undefined: sin selección. true/false: en modo selección, elegida o no. */
  selected?: boolean;
}

/**
 * Miniatura del carrete, leída en el momento desde el dispositivo (no se copia ni se sube).
 * El cargador nativo pide la foto al tamaño de la celda, no la original.
 */
export function PhotoThumb({ id, label, style, onPress, onLongPress, selected }: PhotoThumbProps) {
  const { focused, focusProps } = useFocusRing();
  // La miniatura se revela al cargar, sobre el papel hundido: nunca un parpadeo blanco.
  const shown = useAnimatedValue(0);
  const image = (
    <Animated.Image
      source={{ uri: thumbnailUri(id) }}
      resizeMode="cover"
      resizeMethod="resize"
      onLoad={() =>
        Animated.timing(shown, {
          toValue: 1,
          duration: motion.base,
          useNativeDriver: nativeDriver,
        }).start()
      }
      style={[styles.image, { opacity: shown }]}
    />
  );
  // Sin acción es decoración (mosaicos): ni rol ni foco.
  if (!onPress) return <View style={[styles.cell, style]}>{image}</View>;
  return (
    <Pressable
      role={selected === undefined ? 'button' : 'checkbox'}
      aria-label={label}
      aria-checked={selected}
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={350}
      {...focusProps}
      style={({ pressed }) => [
        styles.cell,
        style,
        pressed && styles.pressed,
        focused && focusRingStyle,
      ]}
    >
      {image}
      {selected !== undefined ? (
        <View style={[styles.check, selected && styles.checkOn]} aria-hidden>
          {selected ? <Icon name="check" size={iconSizes.tag} color={colors.onStamp} /> : null}
        </View>
      ) : null}
      {selected ? <View style={styles.selectedRing} aria-hidden /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cell: { backgroundColor: colors.paperSunk, overflow: 'hidden' },
  pressed: { opacity: 0.8 },
  image: { width: '100%', height: '100%' },
  check: {
    position: 'absolute',
    top: spacing[1],
    right: spacing[1],
    width: spacing[5],
    height: spacing[5],
    borderRadius: radii.round,
    borderWidth: 1.5,
    borderColor: colors.paperPhoto,
    backgroundColor: 'rgba(59, 47, 36, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkOn: { backgroundColor: colors.stampBlue, borderColor: colors.paperPhoto },
  selectedRing: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderWidth: 3,
    borderColor: colors.stampBlue,
  },
});
