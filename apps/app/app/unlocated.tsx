import {
  Button,
  EmptyState,
  IconButton,
  Paper,
  Reveal,
  colors,
  spacing,
  typography,
} from '@atlas/design-system';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Sheet } from '../components/Sheet';
import { cityName } from '../features/map/services/cities';
import { countryName } from '../features/map/services/countries';
import { CityPicker } from '../features/map/ui/CityPicker';
import {
  groupByDay,
  suggestionFor,
  type DayGroup,
  type Suggestion,
} from '../features/photos/services/unlocatedGroups';
import { usePhotoLibrary } from '../features/photos/store/PhotoLibraryProvider';
import { photoLabel } from '../features/photos/ui/photoLabel';
import { PhotoThumb } from '../features/photos/ui/PhotoThumb';

const THUMBS = 8;
const COLUMNS = 4;
const GAP = 3;

const dayTitle = (key: string): string =>
  new Date(`${key}T12:00:00`).toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

const hours = (ms: number): string => {
  const h = Math.round(ms / 3_600_000);
  return h < 1 ? 'menos de 1 h' : `${h} h`;
};

const fotos = (n: number): string => `${n.toLocaleString('es-ES')} ${n === 1 ? 'foto' : 'fotos'}`;

/**
 * M3.5 · Fotos sin ubicación (HU-19). Agrupadas por día, con la ubicación de la foto con GPS
 * más cercana en el tiempo como sugerencia. Lo asignado se guarda como ubicación manual.
 * Tocar miniaturas elige solo esas fotos del día; "Descartar" las oculta (no se borran).
 */
export default function UnlocatedScreen() {
  const { unlocated, photos, assignments, assignLocations, hidePhotos } = usePhotoLibrary();
  const [picking, setPicking] = useState<{ group: DayGroup; ids: string[] } | null>(null);
  // Fotos elegidas a mano dentro de cada día (vacío: el día entero).
  const [chosen, setChosen] = useState<Readonly<Record<string, readonly string[]>>>({});
  const [width, setWidth] = useState(0);
  const cell = (width - GAP * (COLUMNS - 1)) / COLUMNS;

  const groups = useMemo(() => groupByDay(unlocated), [unlocated]);
  const takenAt = useMemo(() => new Map(unlocated.map((u) => [u.id, u.takenAt])), [unlocated]);
  const placeOf = useMemo(() => new Map(assignments.map((a) => [a.photoId, a])), [assignments]);
  const suggestions = useMemo(() => {
    const map = new Map<string, Suggestion>();
    for (const group of groups) {
      const suggestion = suggestionFor(group, photos);
      if (suggestion) map.set(group.key, suggestion);
    }
    return map;
  }, [groups, photos]);

  const label = (s: Suggestion): string => {
    const place = placeOf.get(s.photoId);
    if (!place) return 'el lugar de una foto cercana';
    return place.cityId
      ? `${cityName(place.cityId)}, ${countryName(place.countryCode)}`
      : countryName(place.countryCode);
  };

  const idsOf = (group: DayGroup): string[] => {
    const some = chosen[group.key];
    return some && some.length > 0 ? [...some] : group.ids;
  };
  const toggle = (group: DayGroup, id: string) =>
    setChosen((c) => {
      const current = c[group.key] ?? [];
      const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
      return { ...c, [group.key]: next };
    });
  const clear = (group: DayGroup) =>
    setChosen((c) => Object.fromEntries(Object.entries(c).filter(([k]) => k !== group.key)));

  const withSuggestion = groups.filter((g) => suggestions.has(g.key));
  const assignAll = () =>
    void assignLocations(
      withSuggestion.flatMap((g) => {
        const s = suggestions.get(g.key);
        return s ? [{ ids: g.ids, location: s.location }] : [];
      }),
    );

  return (
    <Paper>
      <SafeAreaView edges={['top']} style={styles.safe}>
        <FlatList
          data={groups}
          keyExtractor={(g) => g.key}
          contentContainerStyle={styles.content}
          initialNumToRender={6}
          windowSize={7}
          onLayout={(e) => setWidth(e.nativeEvent.layout.width - spacing[4] * 2)}
          ListHeaderComponent={
            <View style={styles.header}>
              <View style={styles.back}>
                <IconButton icon="back" label="Volver" onPress={() => router.back()} />
              </View>
              <Text role="heading" style={styles.title}>
                Fotos sin ubicación
              </Text>
              <Text style={styles.meta}>
                {`${fotos(unlocated.length)} en ${groups.length.toLocaleString('es-ES')} días. Lo que coloques se guarda solo en tu móvil.`}
              </Text>
              {withSuggestion.length > 0 ? (
                <Button icon="pin" onPress={assignAll}>
                  {`Asignar todas las sugerencias (${withSuggestion.length} días)`}
                </Button>
              ) : null}
            </View>
          }
          ListEmptyComponent={
            <EmptyState
              icon="check"
              title="Todas tus fotos tienen lugar"
              body="Cuando aparezca alguna sin ubicación, podrás colocarla aquí."
            />
          }
          renderItem={({ item: group, index }) => {
            const suggestion = suggestions.get(group.key);
            const picked = chosen[group.key] ?? [];
            const selecting = picked.length > 0;
            const target = selecting ? fotos(picked.length) : 'el día';
            return (
              <Reveal delay={Math.min(index, 4) * 50} style={styles.group}>
                <View style={styles.dayHead}>
                  <Text style={styles.day}>{dayTitle(group.key)}</Text>
                  <Text style={styles.meta}>
                    {selecting
                      ? `${picked.length} de ${group.ids.length} elegidas`
                      : fotos(group.ids.length)}
                  </Text>
                </View>
                {width > 0 ? (
                  <View style={styles.thumbs}>
                    {group.ids.slice(0, THUMBS).map((id) => (
                      <PhotoThumb
                        key={id}
                        id={id}
                        label={photoLabel(takenAt.get(id) ?? 0)}
                        style={{ width: cell, height: cell }}
                        selected={selecting ? picked.includes(id) : undefined}
                        onPress={() => toggle(group, id)}
                      />
                    ))}
                  </View>
                ) : null}
                {group.ids.length > THUMBS ? (
                  <Text
                    style={styles.meta}
                  >{`Y ${fotos(group.ids.length - THUMBS)} más del mismo día.`}</Text>
                ) : null}
                <Text style={styles.hint}>
                  {suggestion
                    ? `Sugerencia: ${label(suggestion)} (foto con GPS a ${hours(suggestion.gapMs)}).`
                    : 'Sin fotos con GPS cerca en el tiempo: elige el lugar.'}
                </Text>
                <View style={styles.actions}>
                  {suggestion ? (
                    <Button
                      size="sm"
                      onPress={() => {
                        void assignLocations([
                          { ids: idsOf(group), location: suggestion.location },
                        ]);
                        clear(group);
                      }}
                    >
                      {selecting ? `Asignar a ${target}` : 'Asignar sugerencia'}
                    </Button>
                  ) : null}
                  <Button
                    size="sm"
                    variant="secondary"
                    onPress={() => setPicking({ group, ids: idsOf(group) })}
                  >
                    Elegir lugar
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    icon="eyeOff"
                    onPress={() => {
                      void hidePhotos(idsOf(group));
                      clear(group);
                    }}
                  >
                    {selecting ? `Descartar ${target}` : 'Descartar'}
                  </Button>
                </View>
              </Reveal>
            );
          }}
        />

        <Sheet visible={picking !== null} onClose={() => setPicking(null)} label="Elegir lugar">
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.sheet}>
            <Text role="heading" style={styles.sheetTitle}>
              ¿Dónde hiciste estas fotos?
            </Text>
            {picking ? (
              <Text
                style={styles.meta}
              >{`${dayTitle(picking.group.key)}, ${fotos(picking.ids.length)}`}</Text>
            ) : null}
            <CityPicker
              onPick={(city) => {
                if (picking) {
                  void assignLocations([
                    { ids: picking.ids, location: { lat: city.lat, lng: city.lng } },
                  ]);
                  clear(picking.group);
                }
                setPicking(null);
              }}
            />
          </ScrollView>
        </Sheet>
      </SafeAreaView>
    </Paper>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: spacing[4], gap: spacing[5], paddingBottom: spacing[8] },
  header: { gap: spacing[3] },
  back: { marginLeft: -spacing[3] },
  title: { ...typography.title, color: colors.ink },
  sheetTitle: { ...typography.heading, color: colors.ink },
  dayHead: { gap: spacing[1] },
  day: { ...typography.bodyStrong, color: colors.ink },
  meta: { ...typography.data, color: colors.inkMuted },
  hint: { ...typography.bodyS, color: colors.inkMuted },
  group: {
    gap: spacing[2],
    paddingTop: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
  },
  thumbs: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  sheet: { gap: spacing[3] },
});
