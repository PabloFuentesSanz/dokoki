import { clusterPhotos } from '@atlas/domain';
import {
  CountryChip,
  EmptyState,
  RouteLine,
  StatStrip,
  colors,
  radii,
  spacing,
  typography,
} from '@atlas/design-system';
import { AtlasMap } from '@atlas/map';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../components/Screen';
import { cityById } from '../../features/map/services/cities';
import { countryName } from '../../features/map/services/countries';
import { usePhotoLibrary } from '../../features/photos/store/PhotoLibraryProvider';
import { tripMeta, useTrips } from '../../features/trips/hooks/useTrips';
import { TripEditor } from '../../features/trips/ui/TripEditor';

/**
 * M4.2 · Detalle de viaje (versión inicial): ruta entre ciudades en orden, cifras y fotos en el mapa.
 * TODO(M4.2): días, notas (HandNote), portada y compartir.
 */
export default function TripScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const tripsResult = useTrips();
  const { trips } = tripsResult;
  const { photos } = usePhotoLibrary();
  const index = trips.findIndex((t) => t.id === id);
  const trip = trips[index];

  const { clusters, route, bounds } = useMemo(() => {
    if (!trip) return { clusters: [], route: [], bounds: undefined };
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
      bounds:
        points.length > 0
          ? {
              west: Math.min(...lngs) - pad,
              south: Math.min(...lats) - pad,
              east: Math.max(...lngs) + pad,
              north: Math.max(...lats) + pad,
            }
          : undefined,
    };
  }, [trip, photos]);

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

  return (
    <Screen title={trip.name} back>
      <Text style={styles.meta}>{tripMeta(trip)}</Text>
      <View style={styles.map}>
        <AtlasMap
          key={trip.id}
          initialView={bounds ? { bounds } : undefined}
          photoClusters={clusters}
          routes={route}
          accessibilityLabel={`Mapa del viaje ${trip.name}`}
        />
      </View>
      <RouteLine kind="traveled" label="Ruta entre ciudades, en orden" />
      <StatStrip
        stats={[
          { value: String(trip.cities.length), label: 'lugares' },
          {
            value: String(trip.countryCodes.length),
            label: trip.countryCodes.length === 1 ? 'país' : 'países',
          },
          { value: String(trip.photoIds.length), label: 'fotos' },
        ]}
      />
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
      <View style={styles.list}>
        {trip.cities.map((city) => (
          <Text key={city.cityId} style={styles.item}>
            {`${city.cityName}, ${city.photoCount} fotos`}
          </Text>
        ))}
      </View>
      <TripEditor
        key={`${trip.id}-${trip.name}-${String(trip.locked)}`}
        trip={trip}
        previous={trips[index + 1]}
        next={index > 0 ? trips[index - 1] : undefined}
        actions={tripsResult}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  meta: { ...typography.data, color: colors.inkMuted, marginTop: -spacing[3] },
  map: {
    height: 280,
    borderWidth: 1,
    borderColor: colors.ink,
    borderRadius: radii.sm,
    overflow: 'hidden',
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  list: { gap: spacing[2] },
  item: { ...typography.body, color: colors.ink },
});
