import { EmptyState, IconButton, Reveal, spacing } from '@atlas/design-system';
import type { DetectedTrip } from '@atlas/domain';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Screen } from '../../components/Screen';
import { stampDate } from '../../features/sharing/services/stampDate';
import { tripMeta, useTrips } from '../../features/trips/hooks/useTrips';
import { TripCard } from '../../features/trips/ui/TripCard';

/** Portada: una foto de mitad del viaje (suele ser más representativa que la primera). */
const coverOf = (trip: DetectedTrip): string | undefined =>
  trip.photoIds[Math.floor(trip.photoIds.length / 2)];

/** Ciudad con más fotos del viaje: la del sello. */
const topCity = (trip: DetectedTrip): string | undefined =>
  [...trip.cities].sort((a, b) => b.photoCount - a.photoCount)[0]?.cityName;

/**
 * M4.1 · Lista de viajes. Tanda 3. Viajes detectados solos con tus fotos (HU-21), con su portada.
 * Toque firma: el sello del viaje más reciente.
 * TODO(M4.1): pestañas Próximos, En curso y Pasados (con el planificador), y filtros por año.
 */
export default function TripsScreen() {
  const { trips, needsBase } = useTrips();
  const latestCity = trips[0] ? topCity(trips[0]) : undefined;
  return (
    <Screen
      title="Viajes"
      actions={
        <IconButton icon="plus" label="Crear un viaje" onPress={() => router.push('/trip-new')} />
      }
    >
      {needsBase ? (
        <EmptyState
          icon="pin"
          title="Elige tu base para ver tus viajes"
          body="Un viaje es todo lo que haces lejos de casa. Dinos dónde vives (o has vivido) y los detectamos solos."
          action="Elegir mi base"
          onAction={() => router.push('/bases')}
        />
      ) : trips.length === 0 ? (
        <EmptyState
          icon="trips"
          title="Aún sin viajes"
          body="Los viajes se detectan solos con tus fotos: cada vez que sales de tu base."
          action="Leer mis fotos"
          onAction={() => router.navigate('/photos')}
        />
      ) : (
        <View style={styles.list}>
          {trips.map((trip, i) => (
            <Reveal key={trip.id} delay={Math.min(i, 5) * 70}>
              <TripCard
                n={trips.length - i}
                title={trip.name}
                meta={trip.locked ? tripMeta(trip) : `${tripMeta(trip)}, por revisar`}
                coverId={coverOf(trip)}
                stamp={
                  i === 0 && latestCity
                    ? { label: latestCity, date: stampDate(trip.endAt) }
                    : undefined
                }
                onPress={() => router.push({ pathname: '/trip/[id]', params: { id: trip.id } })}
              />
            </Reveal>
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing[6] },
});
