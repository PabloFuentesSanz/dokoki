import { EmptyState, colors, radii, spacing, typography } from '@atlas/design-system';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { cityName } from '../features/map/services/cities';
import { useGallery } from '../features/photos/hooks/useGallery';
import { PhotoGrid } from '../features/photos/ui/PhotoGrid';

/** Ciudades con más fotos del ámbito, para bajar de país a ciudad (M3.1). */
function CityStrip({ counts }: { counts: [string, number][] }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.strip}
      accessibilityLabel="Ciudades con fotos"
    >
      {counts.map(([id, n]) => (
        <Pressable
          key={id}
          role="link"
          aria-label={`${cityName(id)}, ${n} fotos`}
          onPress={() => router.push({ pathname: '/city/[id]', params: { id } })}
          style={({ pressed }) => [styles.city, pressed && styles.pressed]}
        >
          <Text style={styles.cityName}>{cityName(id)}</Text>
          <Text style={styles.count}>{n.toLocaleString('es-ES')}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

/**
 * Galería de un país, una región, una ciudad o un viaje: rejilla por meses. En países y regiones,
 * arriba, sus ciudades con más fotos para bajar un nivel (M3.1).
 */
export default function GalleryScreen() {
  const { scope = 'all' } = useLocalSearchParams<{ scope: string }>();
  const { title, photos, scope: parsed } = useGallery(scope);
  const counts = useMemo(() => {
    if (parsed.kind !== 'country' && parsed.kind !== 'region') return [];
    const map = new Map<string, number>();
    for (const p of photos) if (p.cityId !== null) map.set(p.cityId, (map.get(p.cityId) ?? 0) + 1);
    return [...map].sort((a, b) => b[1] - a[1]).slice(0, 12);
  }, [photos, parsed.kind]);

  return (
    <Screen title={title} back scroll={photos.length === 0}>
      {photos.length === 0 ? (
        <EmptyState icon="photos" title="Sin fotos aquí" body="Aún no hay fotos con este lugar." />
      ) : (
        <PhotoGrid
          photos={photos}
          scope={scope}
          header={
            counts.length > 1 ? (
              <View>
                <CityStrip counts={counts} />
              </View>
            ) : undefined
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  strip: { gap: spacing[2], paddingBottom: spacing[2] },
  city: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing[2],
    minHeight: 44,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderWidth: 1,
    borderColor: colors.ink,
    borderRadius: radii.sm,
    backgroundColor: colors.paperRaised,
  },
  pressed: { backgroundColor: colors.paper },
  cityName: { ...typography.bodyStrong, color: colors.ink },
  count: { ...typography.data, color: colors.inkMuted },
});
