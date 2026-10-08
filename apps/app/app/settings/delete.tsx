import { Button, StatStrip, TextField, colors, spacing, typography } from '@atlas/design-system';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../components/Screen';
import { useUnlockState } from '../../features/map/hooks/useUnlockState';
import { usePhotoLibrary } from '../../features/photos/store/PhotoLibraryProvider';
import { useSettings } from '../../features/settings/store/SettingsProvider';
import { useTrips } from '../../features/trips/hooks/useTrips';
import { EMPTY_EDITS } from '../../features/trips/services/tripEdits';
import { useTripEdits } from '../../features/trips/store/TripEditsProvider';

const WORD = 'borrar';

/** M10.7b · Confirmar borrado: escribir "borrar" para que nunca pase por accidente. */
export default function DeleteScreen() {
  const [typed, setTyped] = useState('');
  const [busy, setBusy] = useState(false);
  const { state } = useUnlockState();
  const { trips } = useTrips();
  const { forget } = usePhotoLibrary();
  const { saveBases, setOnboarded, saveMarks } = useSettings();
  const { update } = useTripEdits();
  const ready = typed.trim().toLowerCase() === WORD;

  const erase = async () => {
    setBusy(true);
    await forget();
    await update(() => EMPTY_EDITS);
    await saveBases([]);
    await saveMarks([]);
    await setOnboarded(false);
    router.dismissAll();
    router.replace('/welcome');
  };

  return (
    <Screen title="¿Borrar todo?" back>
      <Text style={styles.body}>Esto desaparece de este móvil para siempre:</Text>
      <StatStrip
        stats={[
          { value: String(trips.length), label: trips.length === 1 ? 'viaje' : 'viajes' },
          { value: String(state.totals.countries), label: 'países' },
          { value: String(state.totals.cities), label: 'ciudades' },
        ]}
      />
      <Text style={styles.body}>
        Tu mapa y tu pasaporte vuelven a la niebla. Las fotos de tu carrete no se borran: siguen en
        tu móvil y puedes volver a leerlas cuando quieras.
      </Text>
      <TextField label={`Escribe "${WORD}" para confirmar`} value={typed} onChangeText={setTyped} />
      <View style={styles.actions}>
        <Button
          block
          variant="danger"
          disabled={!ready}
          loading={busy}
          onPress={() => void erase()}
        >
          Borrar todo
        </Button>
        <Button block variant="secondary" onPress={() => router.replace('/settings/data')}>
          Exportar antes mis datos
        </Button>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { ...typography.body, color: colors.inkMuted },
  actions: { gap: spacing[2] },
});
