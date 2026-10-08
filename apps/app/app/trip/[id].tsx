import { clusterPhotos } from '@atlas/domain';
import {
  Button,
  CountryChip,
  EmptyState,
  HandNote,
  IconButton,
  Polaroid,
  Reveal,
  RouteMarker,
  StatStrip,
  colors,
  radii,
  spacing,
  typography,
} from '@atlas/design-system';
import { AtlasMap } from '@atlas/map';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../components/Screen';
import { cityById } from '../../features/map/services/cities';
import { countryName } from '../../features/map/services/countries';
import { thumbnailUri } from '../../features/photos/services/thumbnails';
import { usePhotoLibrary } from '../../features/photos/store/PhotoLibraryProvider';
import { photoLabel } from '../../features/photos/ui/photoLabel';
import { PhotoThumb } from '../../features/photos/ui/PhotoThumb';
import { useTrips } from '../../features/trips/hooks/useTrips';
import { routeKm, tripDays } from '../../features/trips/services/tripDays';
import { NoteSheet } from '../../features/trips/ui/NoteSheet';
import { TripEditor } from '../../features/trips/ui/TripEditor';

const THUMBS_PER_DAY = 5;
const GAP = 3;

const shortDay = (ms: number): string =>
  new Date(ms).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
const range = (from: number, until: number): string => {
  const a = new Date(from);
  const b = new Date(until);
  const end = b.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  return a.toDateString() === b.toDateString() ? end : `${shortDay(from)} – ${end}`;
};

/**
 * M4.2 · Detalle de viaje: portada con celo (toque firma), cifras, ruta, nota del viaje y día a
 * día con sus fotos y notas a mano. Corregir el viaje (M4.4) queda en "Editar viaje".
 */
export default function TripScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const tripsResult = useTrips();
  const { trips, tripPhotos, notes, note } = tripsResult;
  const { photos } = usePhotoLibrary();
  const index = trips.findIndex((t) => t.id === id);
  const trip = trips[index];
  const [editing, setEditing] = useState(false);
  const [noteKey, setNoteKey] = useState<string | null>(null);
  const [rowWidth, setRowWidth] = useState(0);
  const cell = (rowWidth - GAP * (THUMBS_PER_DAY - 1)) / THUMBS_PER_DAY;

  const { clusters, route, bounds, km } = useMemo(() => {
    if (!trip) return { clusters: [], route: [], bounds: undefined, km: 0 };
    const ids = new Set(trip.photoIds);
    const points = photos.filter((p) => ids.has(p.id)).map((p) => p.location);
    const path = trip.cities.flatMap((c) => {
      const city = cityById(c.cityId);
      return city ? [{ lat: city.lat, lng: city.lng }] : [];
    });
    const lats = points.map((p) => p.lat);
    const lngs = points.map((p) => p.lng);
    const pad = 0.2;
    return {
      clusters: clusterPhotos(points, 0.02),
      route: path.length >= 2 ? [{ id: trip.id, kind: 'traveled' as const, path }] : [],
      km: routeKm(path),
      bounds:
        points.length > 0
          ? {
              west: lngs.reduce((m, v) => Math.min(m, v), Infinity) - pad,
              south: lats.reduce((m, v) => Math.min(m, v), Infinity) - pad,
              east: lngs.reduce((m, v) => Math.max(m, v), -Infinity) + pad,
              north: lats.reduce((m, v) => Math.max(m, v), -Infinity) + pad,
            }
          : undefined,
    };
  }, [trip, photos]);

  const days = useMemo(() => (trip ? tripDays(trip.photoIds, tripPhotos) : []), [trip, tripPhotos]);
  const takenAt = useMemo(() => new Map(tripPhotos.map((p) => [p.id, p.takenAt])), [tripPhotos]);

  if (!trip) {
    return (
      <Screen title="Viaje" back>
        <EmptyState
          icon="trips"
          title="No encontramos este viaje"
          body="Puede que haya cambiado al leer fotos nuevas."
        />
      </Screen>
    );
  }

  const cover = trip.photoIds[Math.floor(trip.photoIds.length / 2)];
  const scope = `trip:${trip.id}`;
  const tripNote = notes[trip.id];
  const editingDay = noteKey?.includes('@')
    ? days.find((d) => `${trip.id}@${d.key}` === noteKey)
    : undefined;

  return (
    <Screen
      title={trip.name}
      back
      eyebrow={<Text style={styles.meta}>{`Viaje N.º ${trips.length - index}`}</Text>}
      actions={
        <IconButton
          icon="share"
          label="Crear postal"
          onPress={() => router.push({ pathname: '/share', params: { kind: 'trip', id: trip.id } })}
        />
      }
    >
      <Text style={styles.dates}>
        {range(trip.startAt, trip.endAt)}
        {trip.locked ? '' : ', por revisar'}
      </Text>

      {cover ? (
        <Reveal style={styles.cover}>
          <Polaroid
            src={thumbnailUri(cover)}
            alt={`Portada de ${trip.name}`}
            caption={trip.cities[0]?.cityName ?? trip.name}
            tape
            tilt="right"
            width={220}
          />
        </Reveal>
      ) : null}

      <Reveal delay={80}>
        <StatStrip
          stats={[
            { value: String(days.length), label: days.length === 1 ? 'día' : 'días' },
            {
              value: String(trip.cities.length),
              label: trip.cities.length === 1 ? 'ciudad' : 'ciudades',
            },
            { value: km.toLocaleString('es-ES'), label: 'km' },
            { value: trip.photoIds.length.toLocaleString('es-ES'), label: 'fotos' },
          ]}
        />
      </Reveal>

      <View style={styles.map}>
        <AtlasMap
          key={trip.id}
          initialView={bounds ? { bounds } : undefined}
          photoClusters={clusters}
          routes={route}
          accessibilityLabel={`Mapa del viaje ${trip.name}`}
        />
      </View>
      <View style={styles.chips}>
        {trip.countryCodes.map((code) => (
          <CountryChip
            key={code}
            code={code}
            name={countryName(code)}
            onPress={() => router.push({ pathname: '/country/[code]', params: { code } })}
          />
        ))}
      </View>

      {tripNote ? (
        <Pressable
          role="button"
          aria-label="Editar la nota del viaje"
          onPress={() => setNoteKey(trip.id)}
        >
          <HandNote meta={range(trip.startAt, trip.endAt)}>{tripNote}</HandNote>
        </Pressable>
      ) : null}

      <View style={styles.dayHead}>
        <Text role="heading" style={styles.heading}>
          Día a día
        </Text>
        <Button size="sm" variant="ghost" icon="note" onPress={() => setNoteKey(trip.id)}>
          {tripNote ? 'Editar nota' : 'Añadir nota'}
        </Button>
      </View>

      <View onLayout={(e) => setRowWidth(e.nativeEvent.layout.width - spacing[6] - spacing[3])}>
        {days.map((day, i) => {
          const dayNote = notes[`${trip.id}@${day.key}`];
          const extra = day.photoIds.length - THUMBS_PER_DAY;
          return (
            <Reveal key={day.key} delay={Math.min(i, 6) * 50} style={styles.day}>
              <View style={styles.rail}>
                <RouteMarker n={i + 1} />
                {i < days.length - 1 ? <View style={styles.line} /> : null}
              </View>
              <View style={styles.dayBody}>
                <View>
                  <Text style={styles.dayTitle}>{day.cities.join(' → ')}</Text>
                  <Text style={styles.meta}>
                    {`${shortDay(day.date)}, ${day.photoIds.length} ${day.photoIds.length === 1 ? 'foto' : 'fotos'}`}
                  </Text>
                </View>
                {rowWidth > 0 ? (
                  <View style={styles.thumbs}>
                    {day.photoIds.slice(0, THUMBS_PER_DAY).map((pid, j) => (
                      <View key={pid}>
                        <PhotoThumb
                          id={pid}
                          label={photoLabel(takenAt.get(pid) ?? day.date)}
                          style={{ width: cell, height: cell }}
                          onPress={() =>
                            router.push({ pathname: '/photo/[id]', params: { id: pid, scope } })
                          }
                        />
                        {j === THUMBS_PER_DAY - 1 && extra > 0 ? (
                          <View style={styles.more}>
                            <Text style={styles.moreText}>{`+${extra}`}</Text>
                          </View>
                        ) : null}
                      </View>
                    ))}
                  </View>
                ) : null}
                {dayNote ? (
                  <Pressable
                    role="button"
                    aria-label={`Editar la nota del ${shortDay(day.date)}`}
                    onPress={() => setNoteKey(`${trip.id}@${day.key}`)}
                  >
                    <HandNote>{dayNote}</HandNote>
                  </Pressable>
                ) : (
                  <Pressable
                    role="button"
                    aria-label={`Añadir una nota al ${shortDay(day.date)}`}
                    onPress={() => setNoteKey(`${trip.id}@${day.key}`)}
                    style={styles.addNote}
                  >
                    <Text style={styles.addNoteText}>Añadir nota</Text>
                  </Pressable>
                )}
              </View>
            </Reveal>
          );
        })}
      </View>

      <View style={styles.actions}>
        <Button
          icon="share"
          onPress={() => router.push({ pathname: '/share', params: { kind: 'trip', id: trip.id } })}
        >
          Crear postal
        </Button>
        <Button variant="secondary" onPress={() => setEditing((e) => !e)}>
          {editing ? 'Cerrar edición' : 'Editar viaje'}
        </Button>
      </View>
      {editing ? (
        <TripEditor
          key={`${trip.id}-${trip.name}-${String(trip.locked)}`}
          trip={trip}
          previous={trips[index + 1]}
          next={index > 0 ? trips[index - 1] : undefined}
          actions={tripsResult}
        />
      ) : null}

      <NoteSheet
        visible={noteKey !== null}
        title={
          editingDay ? `${shortDay(editingDay.date)}: ${editingDay.cities.join(', ')}` : trip.name
        }
        initial={noteKey ? (notes[noteKey] ?? '') : ''}
        onClose={() => setNoteKey(null)}
        onSave={(text) => {
          if (noteKey) void note(trip, noteKey, text);
          setNoteKey(null);
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  meta: { ...typography.data, color: colors.inkMuted },
  dates: { ...typography.data, color: colors.inkMuted, marginTop: -spacing[4] },
  cover: { alignItems: 'center', paddingVertical: spacing[2] },
  map: {
    height: 240,
    borderWidth: 1,
    borderColor: colors.ink,
    borderRadius: radii.sm,
    overflow: 'hidden',
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  dayHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heading: { ...typography.heading, color: colors.ink },
  day: { flexDirection: 'row', gap: spacing[3] },
  rail: { alignItems: 'center', gap: spacing[1], width: spacing[6] },
  line: { flex: 1, width: 2, backgroundColor: colors.stampRed },
  dayBody: { flex: 1, gap: spacing[2], paddingBottom: spacing[5] },
  dayTitle: { ...typography.bodyStrong, color: colors.ink },
  thumbs: { flexDirection: 'row', gap: GAP },
  more: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(59, 47, 36, 0.45)',
    pointerEvents: 'none',
  },
  moreText: { ...typography.dataStrong, color: colors.onStamp },
  addNote: { minHeight: 44, justifyContent: 'center', alignSelf: 'flex-start' },
  addNoteText: {
    ...typography.data,
    color: colors.ink,
    textDecorationLine: 'underline',
    textDecorationStyle: 'dashed',
  },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
});
