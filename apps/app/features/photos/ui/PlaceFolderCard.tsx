import {
  colors,
  focusRingStyle,
  radii,
  spacing,
  typography,
  useFocusRing,
} from '@atlas/design-system';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { countryName } from '../../map/services/countries';
import type { PlaceFolder } from '../services/gallery';
import { PhotoThumb } from './PhotoThumb';

const GAP = 3;

interface PlaceFolderCardProps {
  folder: PlaceFolder;
  onPress: () => void;
}

/** M3.1 · Carpeta de un país: mosaico de tres fotos (una grande y dos pequeñas), ISO y nombre. */
export function PlaceFolderCard({ folder, onPress }: PlaceFolderCardProps) {
  const { focused, focusProps } = useFocusRing();
  const name = countryName(folder.code);
  const [big, top, bottom] = folder.coverIds;
  const meta = `${folder.count.toLocaleString('es-ES')} ${folder.count === 1 ? 'foto' : 'fotos'}${
    folder.cityCount > 0
      ? `, ${folder.cityCount} ${folder.cityCount === 1 ? 'ciudad' : 'ciudades'}`
      : ''
  }`;
  const tile = (id: string | undefined) =>
    id ? <PhotoThumb id={id} style={styles.fill} /> : <View style={[styles.fill, styles.empty]} />;
  return (
    <Pressable
      role="link"
      aria-label={`${name}, ${meta}`}
      onPress={onPress}
      {...focusProps}
      style={({ pressed }) => [styles.card, pressed && styles.pressed, focused && focusRingStyle]}
    >
      <View style={styles.mosaic} aria-hidden>
        <View style={styles.big}>{tile(big)}</View>
        <View style={styles.side}>
          {tile(top)}
          {tile(bottom)}
        </View>
      </View>
      <View style={styles.titleRow}>
        <Text style={styles.iso}>{folder.code}</Text>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
      </View>
      <Text style={styles.meta}>{meta}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, gap: spacing[2] },
  pressed: { opacity: 0.85 },
  mosaic: { flexDirection: 'row', gap: GAP, aspectRatio: 1 },
  big: { flex: 2 },
  side: { flex: 1, gap: GAP },
  fill: { flex: 1 },
  empty: { backgroundColor: colors.paperSunk },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  iso: {
    ...typography.dataS,
    fontFamily: typography.dataStrong.fontFamily,
    color: colors.ink,
    borderWidth: 1,
    borderColor: colors.ink,
    borderRadius: radii.sm,
    paddingHorizontal: spacing[1],
  },
  name: { ...typography.bodyStrong, color: colors.ink, flexShrink: 1 },
  meta: { ...typography.data, color: colors.inkMuted },
});
