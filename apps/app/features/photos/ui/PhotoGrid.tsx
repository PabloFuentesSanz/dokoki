import { Button, breakpoints, colors, spacing, typography } from '@atlas/design-system';
import type { PlaceAssignment } from '@atlas/domain';
import { router } from 'expo-router';
import { useMemo, useState, type ReactElement } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useGutter } from '../../../components/Screen';
import { Sheet } from '../../../components/Sheet';
import { CityPicker } from '../../map/ui/CityPicker';
import { useTrips } from '../../trips/hooks/useTrips';
import { usePhotoLibrary } from '../store/PhotoLibraryProvider';
import { SelectionBar } from './SelectionBar';
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

/**
 * M3.2 · Fotos por tiempo: rejilla virtualizada por meses (aguanta 30.000 fotos).
 * M3.7 · Mantén pulsada una foto para elegir varias: moverlas, ocultarlas o hacer un viaje.
 */
export function PhotoGrid({ photos, scope, header }: PhotoGridProps) {
  const { width } = useWindowDimensions();
  const gutter = useGutter();
  const columns = width >= breakpoints.doubleView ? 8 : width >= breakpoints.sideNav ? 6 : 4;
  const [listWidth, setListWidth] = useState(width);
  const cell = (listWidth - gutter * 2 - GAP * (columns - 1)) / columns;

  const takenAt = useMemo(() => new Map(photos.map((p) => [p.photoId, p.takenAt])), [photos]);
  const rows = useMemo(() => gridRows(monthSections(photos), columns), [photos, columns]);

  const { assignLocations, hidePhotos } = usePhotoLibrary();
  const { create } = useTrips();
  // null: sin selección. Un conjunto (aunque vacío): en modo selección.
  const [selected, setSelected] = useState<ReadonlySet<string> | null>(null);
  const [sheet, setSheet] = useState<'move' | 'hide' | null>(null);
  const count = selected?.size ?? 0;
  const toggle = (id: string) =>
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const done = () => {
    setSheet(null);
    setSelected(null);
  };
  const makeTrip = async () => {
    const times = [...(selected ?? [])].flatMap((id) => {
      const t = takenAt.get(id);
      return t === undefined ? [] : [t];
    });
    if (times.length === 0) return;
    const trip = await create(Math.min(...times), Math.max(...times));
    done();
    if (trip) router.push({ pathname: '/trip/[id]', params: { id: trip.id } });
  };

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
            selected={selected ? selected.has(id) : undefined}
            onPress={() =>
              selected
                ? toggle(id)
                : router.push({ pathname: '/photo/[id]', params: { id, scope } })
            }
            onLongPress={() => setSelected((s) => s ?? new Set([id]))}
          />
        ))}
      </View>
    );

  return (
    <View style={styles.fill}>
      {selected ? (
        <View style={[styles.selectHead, { paddingHorizontal: gutter }]}>
          <Text style={styles.month} aria-live="polite">
            {count === 0 ? 'Elige fotos' : `${count} ${count === 1 ? 'elegida' : 'elegidas'}`}
          </Text>
          <Button size="sm" variant="ghost" onPress={() => setSelected(null)}>
            Cancelar
          </Button>
        </View>
      ) : null}
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
        extraData={selected}
      />
      {selected ? (
        <SelectionBar
          count={count}
          actions={[
            { icon: 'pin', label: 'Mover', onPress: () => setSheet('move') },
            { icon: 'eyeOff', label: 'Ocultar', onPress: () => setSheet('hide') },
            { icon: 'trips', label: 'Hacer viaje', onPress: () => void makeTrip() },
          ]}
        />
      ) : null}

      <Sheet visible={sheet === 'move'} onClose={() => setSheet(null)} label="Mover fotos">
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.sheetBody}>
          <Text role="heading" style={styles.month}>
            {`¿Dónde hiciste ${count === 1 ? 'esta foto' : `estas ${count} fotos`}?`}
          </Text>
          <Text style={styles.count}>
            Se guarda solo en tu móvil, como ubicación puesta a mano.
          </Text>
          <CityPicker
            onPick={(city) => {
              void assignLocations([
                { ids: [...(selected ?? [])], location: { lat: city.lat, lng: city.lng } },
              ]);
              done();
            }}
          />
        </ScrollView>
      </Sheet>

      <Sheet visible={sheet === 'hide'} onClose={() => setSheet(null)} label="Ocultar fotos">
        <Text role="heading" style={styles.month}>
          {`¿Ocultar ${count === 1 ? 'esta foto' : `${count} fotos`}?`}
        </Text>
        <Text style={styles.body}>
          Dejan de salir en tu mapa, en tus viajes y al compartir. No se borran de tu carrete. Si
          son las únicas de un lugar, ese lugar vuelve a la niebla. Las recuperas en Ajustes.
        </Text>
        <Button
          block
          onPress={() => {
            void hidePhotos([...(selected ?? [])]);
            done();
          }}
        >
          {`Ocultar ${count === 1 ? 'foto' : `${count} fotos`}`}
        </Button>
        <Button block variant="ghost" onPress={() => setSheet(null)}>
          Cancelar
        </Button>
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  selectHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: spacing[2],
  },
  sheetBody: { gap: spacing[3] },
  body: { ...typography.body, color: colors.inkMuted },
  content: { paddingBottom: 120 },
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
