import { Button, Reveal, colors, spacing, typography } from '@atlas/design-system';
import { router } from 'expo-router';
import { useState } from 'react';
import { Share, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../components/Screen';
import { useUnlockState } from '../../features/map/hooks/useUnlockState';
import { cityName } from '../../features/map/services/cities';
import { countryName } from '../../features/map/services/countries';
import { buildExport } from '../../features/settings/services/exportData';
import { useSettings } from '../../features/settings/store/SettingsProvider';
import { useTrips } from '../../features/trips/hooks/useTrips';

/** M10.7 · Tus datos: exportar (sin coordenadas) o borrar todo lo que Atlas guarda en el móvil. */
export default function DataScreen() {
  const { bases } = useSettings();
  const { trips } = useTrips();
  const { state } = useUnlockState();
  const [exported, setExported] = useState<string | null>(null);

  const exportData = async () => {
    const data = buildExport({
      bases,
      trips,
      state,
      names: { country: countryName, city: cityName },
      now: Date.now(),
    });
    const result = await Share.share({
      title: 'Atlas: tus datos',
      message: JSON.stringify(data, null, 2),
    });
    if (result.action === Share.sharedAction) {
      setExported(new Date().toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' }));
    }
  };

  return (
    <Screen title="Tus datos" back>
      <Reveal>
        <View style={styles.block}>
          <Text role="heading" style={styles.heading}>
            Exportar tus datos
          </Text>
          <Text style={styles.body}>
            Un archivo de texto (JSON) con tus viajes, países, regiones, ciudades y bases. Las fotos
            no van dentro: ya están en tu móvil. Tampoco las coordenadas.
          </Text>
          <Button variant="secondary" icon="share" onPress={() => void exportData()}>
            Exportar mis datos
          </Button>
          <Text style={styles.meta}>
            {exported ? `Exportado el ${exported}.` : 'Aún no has exportado nunca.'}
          </Text>
        </View>
      </Reveal>
      <Reveal delay={80}>
        <View style={styles.block}>
          <Text role="heading" style={styles.heading}>
            Borrar todo de este móvil
          </Text>
          <Text style={styles.body}>
            Se borran tus viajes, bases, lugares y lo leído del carrete. Las fotos de tu carrete no
            se tocan.
          </Text>
          <Button variant="danger" onPress={() => router.push('/settings/delete')}>
            Borrar mis datos
          </Button>
        </View>
      </Reveal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  block: { gap: spacing[3] },
  heading: { ...typography.heading, color: colors.ink },
  body: { ...typography.bodyS, color: colors.inkMuted },
  meta: { ...typography.dataS, color: colors.inkMuted },
});
