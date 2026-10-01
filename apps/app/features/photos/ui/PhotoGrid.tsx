import { breakpoints, colors, spacing, typography } from '@atlas/design-system';
import type { PlaceAssignment } from '@atlas/domain';
import { router } from 'expo-router';
import { useMemo, useState, type ReactElement } from 'react';
import { FlatList, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useGutter } from '../../../components/Screen';
import { gridRows, monthSections, type GridRow } from '../services/gallery';
import { photoLabel } from './photoLabel';
import { PhotoThumb } from './PhotoThumb';

const GAP = 3;

interface PhotoGridProps {
  /** Fotos ya ordenadas (las más recientes primero). */
  photos: readonly PlaceAssignment[];
  /** Ámbito para el detalle (`country:JP`...): al deslizar se recorren las mismas fotos. */
  scope: string;
  /** Va encima de la rejilla y hace scroll con ella. */
  header?: ReactElement;
}

/** M3.2 · Fotos por tiempo: rejilla virtualizada por meses (aguanta 30.000 fotos). */
export function PhotoGrid({ photos, scope, header }: PhotoGridProps) {
  const { width } = useWindowDimensions();
  const gutter = useGutter();
  const columns = width >= breakpoints.doubleView ? 8 : width >= breakpoints.sideNav ? 6 : 4;
  const [listWidth, setListWidth] = useState(width);
  const cell = (listWidth - gutter * 2 - GAP * (columns - 1)) / columns;

  const takenAt = useMemo(() => new Map(photos.map((p) => [p.photoId, p.takenAt])), [photos]);
  const rows = useMemo(() => gridRows(monthSections(photos), columns), [photos, columns]);

  const renderRow = ({ item }: { item: GridRow }) =>
    item.type === 'header' ? (
      <View style={[styles.header, { paddingHorizontal: gutter }]}>
        <Text role="heading" style={styles.month}>
          {item.title}
        </Text>
        <Text style={styles.count}>{`${item.count.toLocaleString('es-ES')} fotos`}</Text>
      </View>
    ) : (
      <View style={[styles.row, { paddingHorizontal: gutter }]}>
        {item.ids.map((id) => (
          <PhotoThumb
            key={id}
            id={id}
            label={photoLabel(takenAt.get(id) ?? 0)}
            style={{ width: cell, height: cell }}
            onPress={() => router.push({ pathname: '/photo/[id]', params: { id, scope } })}
          />
        ))}
      </View>
    );

  return (
    <FlatList
      data={rows}
      keyExtractor={(row) => row.key}
      renderItem={renderRow}
      onLayout={(e) => setListWidth(e.nativeEvent.layout.width)}
      ListHeaderComponent={
        header ? <View style={{ paddingHorizontal: gutter }}>{header}</View> : null
      }
      contentContainerStyle={styles.content}
      initialNumToRender={12}
      maxToRenderPerBatch={12}
      windowSize={7}
      removeClippedSubviews
    />
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: spacing[6] },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingTop: spacing[5],
    paddingBottom: spacing[2],
  },
  month: { ...typography.heading, color: colors.ink },
  count: { ...typography.data, color: colors.inkMuted },
  row: { flexDirection: 'row', gap: GAP, marginBottom: GAP },
});
