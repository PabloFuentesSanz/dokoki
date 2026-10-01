import {
  RouteMarker,
  Stamp,
  colors,
  focusRingStyle,
  spacing,
  typography,
  useFocusRing,
} from '@atlas/design-system';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { PhotoThumb } from '../../photos/ui/PhotoThumb';

interface TripCardProps {
  n: number;
  title: string;
  meta: string;
  /** Foto de portada (del carrete, en el móvil). */
  coverId?: string;
  /** Sello que asoma sobre la portada: el toque firma de la pantalla, solo en una tarjeta. */
  stamp?: { label: string; date: string };
  onPress: () => void;
}

/** M4.1 · Tarjeta de viaje: portada enmarcada en tinta, número de ruta, título y datos a máquina. */
export function TripCard({ n, title, meta, coverId, stamp, onPress }: TripCardProps) {
  const { focused, focusProps } = useFocusRing();
  return (
    <Pressable
      role="link"
      aria-label={`${title}, ${meta}`}
      onPress={onPress}
      {...focusProps}
      style={({ pressed }) => [styles.card, pressed && styles.pressed, focused && focusRingStyle]}
    >
      <View style={styles.cover}>
        {coverId ? <PhotoThumb id={coverId} style={styles.fill} /> : null}
        {stamp ? (
          <View style={styles.stamp} aria-hidden>
            <Stamp kind="city" label={stamp.label} date={stamp.date} size={84} />
          </View>
        ) : null}
      </View>
      <View style={styles.row}>
        <RouteMarker n={n} />
        <View style={styles.text}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          <Text style={styles.meta}>{meta}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing[3] },
  pressed: { opacity: 0.85 },
  cover: {
    height: 180,
    borderWidth: 1,
    borderColor: colors.ink,
    backgroundColor: colors.water,
  },
  fill: { flex: 1 },
  stamp: { position: 'absolute', right: -spacing[2], top: -spacing[4] },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  text: { flex: 1 },
  title: { ...typography.heading, color: colors.ink },
  meta: { ...typography.data, color: colors.inkMuted },
});
