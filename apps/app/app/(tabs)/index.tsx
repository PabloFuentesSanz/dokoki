import { clusterPhotos } from '@atlas/domain';
import {
  Button,
  Icon,
  IconButton,
  MapLegend,
  TimeSlider,
  Toggle,
  colors,
  iconSizes,
  radii,
  shadows,
  spacing,
  touchTarget,
  typography,
} from '@atlas/design-system';
import { AtlasMap, type MapLayerId, type RouteLayer } from '@atlas/map';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUnlockState } from '../../features/map/hooks/useUnlockState';
import { cityById } from '../../features/map/services/cities';
import { regionCountry } from '../../features/map/services/regions';
import { usePhotoLibrary } from '../../features/photos/store/PhotoLibraryProvider';
import { useTrips } from '../../features/trips/hooks/useTrips';

/** Celdas de ~5 km: suficiente para ver ciudades y barrios sin miles de puntos. */
const CLUSTER_CELL_DEGREES = 0.05;
const PLAY_STEP_MS = 1200;

const endOfYear = (year: number): number => new Date(year + 1, 0, 1).getTime() - 1;

/**
 * M1.1 · Mapa mundi, con búsqueda (M1.8), capas (M1.2) y viaje en el tiempo (M1.3).
 * Niebla sobre lo no visitado, tus fotos agrupadas y las rutas de tus viajes. Todo en el móvil.
 */
export default function MapScreen() {
  const { photos } = usePhotoLibrary();
  const { trips } = useTrips();
  const [layers, setLayers] = useState<Record<Exclude<MapLayerId, 'unlocked'>, boolean>>({
    fog: true,
    photos: true,
    routes: true,
  });
  const [layersOpen, setLayersOpen] = useState(false);

  // Viaje en el tiempo: null = hoy.
  const currentYear = new Date().getFullYear();
  const firstYear = useMemo(
    () =>
      // reduce y no Math.min(...): con 30.000 fotos el spread puede desbordar la pila.
      photos.length > 0
        ? new Date(photos.reduce((min, p) => Math.min(min, p.takenAt), Infinity)).getFullYear()
        : currentYear,
    [photos, currentYear],
  );
  const [year, setYear] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const until = year === null ? undefined : endOfYear(year);

  useEffect(() => {
    if (!playing) return undefined;
    const timer = setInterval(() => {
      setYear((y) => {
        const next = (y ?? firstYear - 1) + 1;
        if (next >= currentYear) setPlaying(false);
        return Math.min(next, currentYear);
      });
    }, PLAY_STEP_MS);
    return () => clearInterval(timer);
  }, [playing, firstYear, currentYear]);

  const { state, fog } = useUnlockState({ until });
  const clusters = useMemo(
    () =>
      clusterPhotos(
        photos.filter((p) => until === undefined || p.takenAt <= until).map((p) => p.location),
        CLUSTER_CELL_DEGREES,
      ),
    [photos, until],
  );
  const routes = useMemo<RouteLayer[]>(
    () =>
      trips
        .filter((t) => until === undefined || t.startAt <= until)
        .map((t) => ({
          id: t.id,
          kind: 'traveled',
          path: t.cities.flatMap((c) => {
            const city = cityById(c.cityId);
            return city ? [{ lat: city.lat, lng: city.lng }] : [];
          }),
        })),
    [trips, until],
  );

  return (
    <View style={styles.fill}>
      <AtlasMap
        style={styles.fill}
        fog={fog}
        photoClusters={clusters}
        routes={routes}
        layers={layers}
        onPressArea={(area) => {
          const code = area.level === 'region' ? regionCountry(area.id) : area.id;
          if (code) router.push({ pathname: '/country/[code]', params: { code } });
        }}
        accessibilityLabel="Tu mapa del mundo"
      />

      <SafeAreaView edges={['top']} style={styles.top} pointerEvents="box-none">
        <View style={styles.searchRow}>
          <Pressable
            role="button"
            aria-label="Buscar país o ciudad"
            onPress={() => router.push('/search')}
            style={({ pressed }) => [styles.search, pressed && styles.pressed]}
          >
            <Icon name="search" size={iconSizes.nav} color={colors.inkMuted} />
            <Text style={styles.searchText}>Buscar país o ciudad</Text>
          </Pressable>
          <View style={styles.toolButton}>
            <IconButton
              icon="layers"
              label="Capas y leyenda"
              outline
              onPress={() => setLayersOpen(true)}
            />
          </View>
        </View>
        <Pressable
          role="link"
          aria-label={`${state.totals.countries} países, ${state.worldPercent} % del mundo${
            year === null ? '' : ` en ${year}`
          }. Abrir pasaporte`}
          onPress={() => router.push('/passport')}
          style={({ pressed }) => [styles.chip, pressed && styles.pressed]}
        >
          <Text style={styles.chipStrong}>
            {`${state.totals.countries} ${state.totals.countries === 1 ? 'país' : 'países'}`}
          </Text>
          <Text style={styles.chipData}>
            {`${state.worldPercent} % del mundo${year === null ? '' : ` en ${year}`}`}
          </Text>
        </Pressable>
      </SafeAreaView>

      {/* M1.3 · Viaje en el tiempo: siempre a mano sobre la barra, como en el lienzo. */}
      <View style={[styles.card, styles.bottom]}>
        <TimeSlider
          min={Math.min(firstYear, currentYear)}
          max={currentYear}
          value={year ?? currentYear}
          onChange={(y) => {
            setPlaying(false);
            setYear(y);
          }}
        />
        {year !== null || playing ? (
          <View style={styles.row}>
            <Button
              size="sm"
              icon={playing ? 'close' : 'compass'}
              onPress={() => {
                if (!playing && (year ?? currentYear) >= currentYear) setYear(firstYear);
                setPlaying(!playing);
              }}
            >
              {playing ? 'Parar' : 'Reproducir'}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onPress={() => {
                setPlaying(false);
                setYear(null);
              }}
            >
              Volver a hoy
            </Button>
          </View>
        ) : (
          <View style={styles.row}>
            <Button
              size="sm"
              variant="ghost"
              icon="compass"
              onPress={() => {
                setYear(firstYear);
                setPlaying(true);
              }}
            >
              Reproducir tus años
            </Button>
          </View>
        )}
      </View>

      <Modal
        visible={layersOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setLayersOpen(false)}
      >
        <Pressable
          style={styles.scrim}
          onPress={() => setLayersOpen(false)}
          aria-label="Cerrar capas"
        />
        <SafeAreaView edges={['bottom']} style={styles.sheet}>
          <Text role="heading" style={styles.heading}>
            Capas
          </Text>
          <Toggle
            label="Niebla"
            checked={layers.fog}
            onChange={(fog) => setLayers((l) => ({ ...l, fog }))}
          />
          <Toggle
            label="Tus fotos"
            checked={layers.photos}
            onChange={(v) => setLayers((l) => ({ ...l, photos: v }))}
          />
          <Toggle
            label="Rutas de tus viajes"
            checked={layers.routes}
            onChange={(v) => setLayers((l) => ({ ...l, routes: v }))}
          />
          <MapLegend />
          <Button variant="secondary" onPress={() => setLayersOpen(false)}>
            Listo
          </Button>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  top: { position: 'absolute', top: 0, left: 0, right: 0, padding: spacing[4], gap: spacing[3] },
  card: {
    padding: spacing[3],
    backgroundColor: colors.paperRaised,
    borderWidth: 1,
    borderColor: colors.ink,
    borderRadius: radii.sm,
  },
  searchRow: { flexDirection: 'row', gap: spacing[2] },
  search: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    minHeight: 48,
    paddingHorizontal: spacing[4],
    backgroundColor: colors.paperRaised,
    borderWidth: 1,
    borderColor: colors.ink,
    borderRadius: radii.sm,
  },
  searchText: { ...typography.body, color: colors.inkMuted },
  pressed: { backgroundColor: colors.paper },
  chip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing[2],
    minHeight: touchTarget,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    backgroundColor: colors.paperRaised,
    borderWidth: 1,
    borderColor: colors.ink,
    borderRadius: radii.sm,
  },
  chipStrong: { ...typography.bodyStrong, color: colors.ink },
  chipData: { ...typography.data, color: colors.ink },
  toolButton: { backgroundColor: colors.paperRaised, borderRadius: radii.sm },
  bottom: {
    position: 'absolute',
    left: spacing[4],
    right: spacing[4],
    bottom: spacing[4],
    gap: spacing[3],
  },
  row: { flexDirection: 'row', gap: spacing[2] },
  scrim: { flex: 1, backgroundColor: colors.ink, opacity: 0.3 },
  sheet: {
    gap: spacing[3],
    padding: spacing[5],
    backgroundColor: colors.paperRaised,
    borderTopLeftRadius: radii.sm,
    borderTopRightRadius: radii.sm,
    boxShadow: shadows.sheet,
  },
  heading: { ...typography.heading, color: colors.ink },
});
