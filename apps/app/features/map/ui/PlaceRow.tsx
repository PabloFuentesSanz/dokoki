import {
  Tag,
  colors,
  focusRingStyle,
  spacing,
  touchTarget,
  typography,
  useFocusRing,
} from '@atlas/design-system';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface PlaceRowProps {
  name: string;
  meta: string;
  visited: boolean;
  /** Femenino para ciudades y regiones: "Visitada". */
  feminine?: boolean;
  onPress: () => void;
}

/** Fila de lugar (búsqueda, ficha de región): nombre, dato a máquina y estado con palabra. */
export function PlaceRow({ name, meta, visited, feminine = false, onPress }: PlaceRowProps) {
  const { focused, focusProps } = useFocusRing();
  return (
    <Pressable
      role="link"
      aria-label={`${name}, ${meta}`}
      onPress={onPress}
      {...focusProps}
      style={({ pressed }) => [styles.row, pressed && styles.pressed, focused && focusRingStyle]}
    >
      <View style={styles.text}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.meta}>{meta}</Text>
      </View>
      <Tag tone={visited ? 'visited' : 'unexplored'}>
        {visited ? (feminine ? 'Visitada' : 'Visitado') : 'Por descubrir'}
      </Tag>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    minHeight: touchTarget,
    paddingVertical: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
  },
  pressed: { backgroundColor: colors.paperRaised },
  text: { flex: 1 },
  name: { ...typography.bodyStrong, color: colors.ink },
  meta: { ...typography.data, color: colors.inkMuted },
});
