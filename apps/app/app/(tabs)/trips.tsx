import { EmptyState } from '@atlas/design-system';
import { Screen } from '../../components/Screen';

/**
 * M4.1 · Lista de viajes. Tanda 3.
 * TODO(M4.1): viajes detectados (detectTrips de @atlas/domain/trips) con pestañas
 * Próximos, En curso y Pasados, y filtros por año y país (HU-21).
 */
export default function TripsScreen() {
  return (
    <Screen title="Tus viajes">
      <EmptyState
        icon="trips"
        title="Aún sin viajes"
        body="Los viajes se detectan solos con tus fotos: cada vez que sales de tu base."
      />
    </Screen>
  );
}
