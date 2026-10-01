import { colors, focusRingStyle, useFocusRing } from '@atlas/design-system';
import { Image, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { thumbnailUri } from '../services/thumbnails';

interface PhotoThumbProps {
  id: string;
  /** Nombre accesible si se puede tocar: "Foto del 12 de abril de 2024". */
  label?: string;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}

/**
 * Miniatura del carrete, leída en el momento desde el dispositivo (no se copia ni se sube).
 * El cargador nativo pide la foto al tamaño de la celda, no la original.
 */
export function PhotoThumb({ id, label, style, onPress }: PhotoThumbProps) {
  const { focused, focusProps } = useFocusRing();
  const image = (
    <Image
      source={{ uri: thumbnailUri(id) }}
      resizeMode="cover"
      resizeMethod="resize"
      style={styles.image}
    />
  );
  // Sin acción es decoración (mosaicos): ni rol ni foco.
  if (!onPress) return <View style={[styles.cell, style]}>{image}</View>;
  return (
    <Pressable
      role="button"
      aria-label={label}
      onPress={onPress}
      {...focusProps}
      style={({ pressed }) => [
        styles.cell,
        style,
        pressed && styles.pressed,
        focused && focusRingStyle,
      ]}
    >
      {image}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cell: { backgroundColor: colors.paperSunk, overflow: 'hidden' },
  pressed: { opacity: 0.8 },
  image: { width: '100%', height: '100%' },
});
