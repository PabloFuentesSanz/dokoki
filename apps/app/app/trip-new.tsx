import { Button, EmptyState, TextField, colors, typography } from '@atlas/design-system';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { Screen } from '../components/Screen';
import { useTrips } from '../features/trips/hooks/useTrips';

/** "2024-04-10" → medianoche local de ese día; null si no es una fecha válida. */
function parseDay(text: string): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text.trim());
  if (!match) return null;
  const [, y, m, d] = match;
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  return Number.isNaN(date.getTime()) ? null : date.getTime();
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** M4.4 · Crear un viaje a mano (HU-22): todas tus fotos con lugar entre dos fechas. */
export default function NewTripScreen() {
  const { tripPhotos, create } = useTrips();
  const [name, setName] = useState('');
  const [fromText, setFromText] = useState('');
  const [untilText, setUntilText] = useState('');

  const from = parseDay(fromText);
  const untilDay = parseDay(untilText);
  const until = untilDay === null ? null : untilDay + DAY_MS - 1;
  const count = useMemo(
    () =>
      from !== null && until !== null
        ? tripPhotos.filter((p) => p.takenAt >= from && p.takenAt <= until).length
        : 0,
    [tripPhotos, from, until],
  );

  return (
    <Screen title="Crear un viaje" back>
      <Text style={styles.body}>
        Entran todas tus fotos con lugar entre esas fechas, también las que has colocado a mano. El
        viaje queda confirmado.
      </Text>
      <TextField
        label="Nombre (opcional)"
        value={name}
        onChangeText={setName}
        placeholder="Japón con Lucía"
      />
      <TextField
        label="Desde"
        value={fromText}
        onChangeText={setFromText}
        placeholder="AAAA-MM-DD"
        hint="Por ejemplo, 2024-04-10"
      />
      <TextField
        label="Hasta"
        value={untilText}
        onChangeText={setUntilText}
        placeholder="AAAA-MM-DD"
      />
      {from !== null && until !== null ? (
        count > 0 ? (
          <Text
            style={styles.meta}
          >{`${count.toLocaleString('es-ES')} fotos con lugar en esas fechas`}</Text>
        ) : (
          <EmptyState
            icon="photos"
            title="No hay fotos con lugar en esas fechas"
            body="Coloca antes las fotos sin ubicación de esos días."
          />
        )
      ) : null}
      <Button
        disabled={count === 0}
        onPress={() => {
          if (from === null || until === null) return;
          void create(from, until, name.trim() || undefined).then((trip) => {
            if (trip) router.replace({ pathname: '/trip/[id]', params: { id: trip.id } });
          });
        }}
      >
        Crear viaje
      </Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { ...typography.body, color: colors.inkMuted },
  meta: { ...typography.data, color: colors.ink },
});
