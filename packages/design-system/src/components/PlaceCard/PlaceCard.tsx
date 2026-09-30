import { Pressable, StyleSheet, Text, View } from 'react-native';
import { focusRingStyle, useFocusRing } from '../../internal/useFocusRing';
import { colors, radii, spacing, typography } from '../../tokens';
import { Coordinate } from '../Coordinate/Coordinate';
import { Icon, type IconName } from '../Icon/Icon';
import { Tag } from '../Tag/Tag';

export type PlaceStatus = 'visited' | 'planned' | 'wish';

export interface PlaceCardProps {
  name: string;
  /** Barrio o ciudad. */
  area: string;
  status?: PlaceStatus;
  /** Día del plan si está planificado. */
  day?: string;
  /** Tus fotos allí. */
  photos?: number;
  lat?: number;
  lng?: number;
  /** Símbolo del tipo de lugar. */
  icon?: IconName;
  onPress?: () => void;
}

/** Tarjeta de lugar con miniatura, zona y estado. */
export function PlaceCard({
  name,
  area,
  status = 'visited',
  day,
  photos,
  lat,
  lng,
  icon = 'pin',
  onPress,
}: PlaceCardProps) {
  const { focused, focusProps } = useFocusRing();
  const tag =
    status === 'visited' ? (
      <Tag tone="visited">Visitado</Tag>
    ) : status === 'planned' ? (
      <Tag tone="planned">{day ?? 'Planificado'}</Tag>
    ) : (
      <Tag tone="unexplored">Quiero ir</Tag>
    );

  return (
    <Pressable
      role="link"
      aria-label={`${name}, ${area}`}
      onPress={onPress}
      {...focusProps}
      style={({ pressed }) => [
        styles.card,
        status === 'planned' && styles.planned,
        pressed && styles.pressed,
        focused && focusRingStyle,
      ]}
    >
      <View style={[styles.thumb, status !== 'visited' && styles.thumbPending]}>
        <Icon name={icon} size={26} />
      </View>
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.area} numberOfLines={1}>
          {area}
        </Text>
        <View style={styles.foot}>
          {tag}
          {photos ? (
            <Text style={styles.count}>{`${photos} fotos`}</Text>
          ) : lat !== undefined && lng !== undefined ? (
            <Coordinate lat={lat} lng={lng} />
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: spacing[3],
    padding: spacing[3],
    maxWidth: 340,
    backgroundColor: colors.paperRaised,
    borderWidth: 1,
    borderColor: colors.ink,
    borderRadius: radii.sm,
  },
  planned: { borderStyle: 'dashed', borderColor: colors.stampBlue },
  pressed: { backgroundColor: colors.paper },
  thumb: {
    width: 72,
    height: 72,
    backgroundColor: colors.landVisited,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbPending: { backgroundColor: colors.paperSunk },
  body: { flex: 1, minWidth: 0, gap: 2 },
  name: { ...typography.bodyStrong, color: colors.ink },
  area: { ...typography.bodyS, lineHeight: 20, color: colors.inkMuted },
  foot: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[2],
    marginTop: 4,
  },
  count: { ...typography.dataS, color: colors.inkMuted },
});
