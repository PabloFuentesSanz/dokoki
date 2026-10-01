import type { DetectedTrip } from '@atlas/domain';
import { Button, Tag, TextField, colors, radii, spacing, typography } from '@atlas/design-system';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { TripActions } from '../hooks/useTrips';

const DAY_MS = 24 * 60 * 60 * 1000;

/** Inicio (medianoche local) de cada día del viaje, a partir del segundo: posibles cortes. */
function splitDays(trip: DetectedTrip): number[] {
  const first = new Date(trip.startAt);
  first.setHours(0, 0, 0, 0);
  const days: number[] = [];
  for (let t = first.getTime() + DAY_MS; t <= trip.endAt; t += DAY_MS) days.push(t);
  return days;
}

const shortDay = (ms: number): string =>
  new Date(ms).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });

interface TripEditorProps {
  trip: DetectedTrip;
  /** Viaje anterior y siguiente en el tiempo, para unir. */
  previous?: DetectedTrip;
  next?: DetectedTrip;
  actions: TripActions;
}

/** M4.4 · Editar viaje (HU-22): todo lo que se corrige queda bloqueado. */
export function TripEditor({ trip, previous, next, actions }: TripEditorProps) {
  const [name, setName] = useState(trip.name);
  const days = splitDays(trip);

  return (
    <View style={styles.box}>
      <View style={styles.row}>
        <Text role="heading" style={styles.heading}>
          Corregir el viaje
        </Text>
        {trip.locked ? <Tag tone="settled">Confirmado</Tag> : <Tag tone="planned">Por revisar</Tag>}
      </View>

      <TextField label="Nombre" value={name} onChangeText={setName} />
      <View style={styles.row}>
        <Button
          size="sm"
          disabled={name.trim() === '' || name === trip.name}
          onPress={() => void actions.rename(trip, name.trim())}
        >
          Guardar nombre
        </Button>
        {trip.locked ? null : (
          <Button
            size="sm"
            variant="secondary"
            icon="check"
            onPress={() => void actions.confirm(trip)}
          >
            Confirmar viaje
          </Button>
        )}
      </View>

      {previous || next ? (
        <View style={styles.block}>
          <Text style={styles.label}>Unir con otro viaje</Text>
          <View style={styles.row}>
            {previous ? (
              <Button
                size="sm"
                variant="secondary"
                onPress={() => void actions.merge(previous, trip)}
              >
                {`Con el anterior: ${previous.name}`}
              </Button>
            ) : null}
            {next ? (
              <Button size="sm" variant="secondary" onPress={() => void actions.merge(trip, next)}>
                {`Con el siguiente: ${next.name}`}
              </Button>
            ) : null}
          </View>
        </View>
      ) : null}

      {days.length > 0 ? (
        <View style={styles.block}>
          <Text style={styles.label}>Dividir: el viaje nuevo empieza el…</Text>
          <ScrollView
            horizontal
            contentContainerStyle={styles.row}
            showsHorizontalScrollIndicator={false}
          >
            {days.map((day) => (
              <Button
                key={day}
                size="sm"
                variant="secondary"
                onPress={() => void actions.split(trip, day)}
              >
                {shortDay(day)}
              </Button>
            ))}
          </ScrollView>
        </View>
      ) : null}

      <Button
        size="sm"
        variant="danger"
        onPress={() => {
          void actions.dismiss(trip);
          router.back();
        }}
      >
        No es un viaje
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    gap: spacing[3],
    padding: spacing[4],
    backgroundColor: colors.paperRaised,
    borderWidth: 1,
    borderColor: colors.ink,
    borderRadius: radii.sm,
  },
  heading: { ...typography.heading, color: colors.ink },
  label: { ...typography.data, color: colors.inkMuted },
  block: { gap: spacing[2] },
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing[2] },
});
