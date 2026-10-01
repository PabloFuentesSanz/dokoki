import { EmptyState, TripRow } from '@atlas/design-system';
import { router } from 'expo-router';
import { View } from 'react-native';
import { Screen } from '../../components/Screen';
import { tripMeta, useTrips } from '../../features/trips/hooks/useTrips';

/**
 * M4.1 · Lista de viajes. Tanda 3. Viajes detectados solos con tus fotos (HU-21).
 * TODO(M4.1): pestañas Próximos, En curso y Pasados, y filtros por año y país.
 */
export default function TripsScreen() {
  const { trips } = useTrips();
  return (
    <Screen title="Tus viajes">
      {trips.length === 0 ? (
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
              meta={tripMeta(trip)}
              onPress={() => router.push({ pathname: '/trip/[id]', params: { id: trip.id } })}
            />
          ))}
        </View>
      )}
    </Screen>
  );
}
