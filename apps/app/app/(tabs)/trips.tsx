import { Button, EmptyState, TripRow } from '@atlas/design-system';
import { router } from 'expo-router';
import { View } from 'react-native';
import { Screen } from '../../components/Screen';
import { tripMeta, useTrips } from '../../features/trips/hooks/useTrips';

/**
 * M4.1 · Lista de viajes. Tanda 3. Viajes detectados solos con tus fotos (HU-21).
 * TODO(M4.1): pestañas Próximos, En curso y Pasados, y filtros por año y país.
 */
export default function TripsScreen() {
  const { trips, needsBase } = useTrips();
  return (
    <Screen title="Tus viajes">
      <Button variant="secondary" icon="plus" onPress={() => router.push('/trip-new')}>
        Crear un viaje
      </Button>
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
        <View>
          {trips.map((trip, i) => (
            <TripRow
              key={trip.id}
              n={trips.length - i}
              title={trip.name}
              meta={trip.locked ? tripMeta(trip) : `${tripMeta(trip)}, por revisar`}
              onPress={() => router.push({ pathname: '/trip/[id]', params: { id: trip.id } })}
            />
          ))}
        </View>
      )}
    </Screen>
  );
}
