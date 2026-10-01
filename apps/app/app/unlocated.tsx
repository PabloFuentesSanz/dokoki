import {
  Button,
  EmptyState,
  IconButton,
  colors,
  radii,
  spacing,
  typography,
} from '@atlas/design-system';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Image, Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cityName } from '../features/map/services/cities';
import { countryName } from '../features/map/services/countries';
import { CityPicker } from '../features/map/ui/CityPicker';
import { thumbnailUri } from '../features/photos/services/thumbnails';
import {
  groupByDay,
  suggestionFor,
  type DayGroup,
  type Suggestion,
} from '../features/photos/services/unlocatedGroups';
import { usePhotoLibrary } from '../features/photos/store/PhotoLibraryProvider';

const THUMBS = 5;

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

/**
 * M3.5 · Fotos sin ubicación (HU-19). Agrupadas por día, con la ubicación de la foto con GPS
 * más cercana en el tiempo como sugerencia. Lo asignado se guarda como ubicación manual.
 * TODO(M3.5): elegir fotos sueltas dentro de un día, y descartar.
 */
export default function UnlocatedScreen() {
  const { unlocated, photos, assignments, assignLocations } = usePhotoLibrary();
  const [picking, setPicking] = useState<DayGroup | null>(null);

  const groups = useMemo(() => groupByDay(unlocated), [unlocated]);
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

  const withSuggestion = groups.filter((g) => suggestions.has(g.key));
  const assignAll = () =>
    void assignLocations(
      withSuggestion.flatMap((g) => {
        const s = suggestions.get(g.key);
        return s ? [{ ids: g.ids, location: s.location }] : [];
      }),
    );

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <FlatList
        data={groups}
        keyExtractor={(g) => g.key}
        contentContainerStyle={styles.content}
        initialNumToRender={8}
        windowSize={7}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.back}>
              <IconButton icon="back" label="Volver" onPress={() => router.back()} />
            </View>
            <Text role="heading" style={styles.title}>
              Fotos sin ubicación
            </Text>
            <Text style={styles.meta}>
              {`${unlocated.length.toLocaleString('es-ES')} fotos en ${groups.length.toLocaleString('es-ES')} días. Solo se guardan en tu móvil.`}
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
        renderItem={({ item: group }) => {
          const suggestion = suggestions.get(group.key);
          return (
            <View style={styles.group}>
              <Text style={styles.day}>{dayTitle(group.key)}</Text>
              <Text
                style={styles.meta}
              >{`${group.ids.length} ${group.ids.length === 1 ? 'foto' : 'fotos'}`}</Text>
              <View style={styles.thumbs}>
                {group.ids.slice(0, THUMBS).map((id) => (
                  <Image
                    key={id}
                    source={{ uri: thumbnailUri(id) }}
                    style={styles.thumb}
                    accessibilityIgnoresInvertColors
                  />
                ))}
                {group.ids.length > THUMBS ? (
                  <View style={[styles.thumb, styles.more]}>
                    <Text style={styles.meta}>{`+${group.ids.length - THUMBS}`}</Text>
                  </View>
                ) : null}
              </View>
              {suggestion ? (
                <Text style={styles.meta}>
                  {`Sugerencia: ${label(suggestion)} (foto con GPS a ${hours(suggestion.gapMs)})`}
                </Text>
              ) : (
                <Text style={styles.meta}>
                  Sin fotos con GPS cerca en el tiempo: elige el lugar.
                </Text>
              )}
              <View style={styles.actions}>
                {suggestion ? (
                  <Button
                    size="sm"
                    onPress={() =>
                      void assignLocations([{ ids: group.ids, location: suggestion.location }])
                    }
                  >
                    Asignar sugerencia
                  </Button>
                ) : null}
                <Button size="sm" variant="secondary" onPress={() => setPicking(group)}>
                  Elegir lugar
                </Button>
              </View>
            </View>
          );
        }}
      />

      <Modal
        visible={picking !== null}
        animationType="slide"
        onRequestClose={() => setPicking(null)}
      >
        <SafeAreaView style={styles.safe}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <View style={styles.back}>
              <IconButton icon="close" label="Cerrar" onPress={() => setPicking(null)} />
            </View>
            <Text role="heading" style={styles.title}>
              ¿Dónde hiciste estas fotos?
            </Text>
            {picking ? (
              <Text
                style={styles.meta}
              >{`${dayTitle(picking.key)}, ${picking.ids.length} fotos`}</Text>
            ) : null}
            <CityPicker
              onPick={(city) => {
                if (picking)
                  void assignLocations([
                    { ids: picking.ids, location: { lat: city.lat, lng: city.lng } },
                  ]);
                setPicking(null);
              }}
            />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  content: { padding: spacing[4], gap: spacing[5] },
  header: { gap: spacing[3] },
  back: { marginLeft: -spacing[3] },
  title: { ...typography.title, color: colors.ink },
  day: { ...typography.bodyStrong, color: colors.ink },
  meta: { ...typography.data, color: colors.inkMuted },
  group: {
    gap: spacing[2],
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
  },
  thumbs: { flexDirection: 'row', gap: spacing[1] },
  thumb: { width: 56, height: 56, borderRadius: radii.none, backgroundColor: colors.paperSunk },
  more: { alignItems: 'center', justifyContent: 'center' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
});
