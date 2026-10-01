import {
  CountryChip,
  EmptyState,
  StatStrip,
  colors,
  spacing,
  typography,
} from '@atlas/design-system';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../components/Screen';
import { useUnlockState } from '../../features/map/hooks/useUnlockState';
import { countryCount, countryName } from '../../features/map/services/countries';

const fmtDate = (ms: number | null): string =>
  ms === null ? '' : new Date(ms).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

/**
 * M2.1 · Tu progreso (versión inicial) dentro de Tú.
 * TODO(M10.0): ajustes, privacidad y datos. TODO(M2.2): pasaporte de sellos.
 */
export default function MeScreen() {
  const { state } = useUnlockState();
  const countries = Object.values(state.countries).sort(
    (a, b) => (a.firstVisitedAt ?? 0) - (b.firstVisitedAt ?? 0),
  );

  return (
    <Screen title="Tú">
      {countries.length === 0 ? (
        <EmptyState
          icon="compass"
          title="Tu mapa aún está en niebla"
          body="Lee tus fotos y los países donde has estado se desbloquearán solos."
          action="Leer mis fotos"
          onAction={() => router.navigate('/photos')}
        />
      ) : (
        <>
          <StatStrip
            stats={[
              { value: String(state.totals.countries), label: 'países' },
              { value: `${String(state.worldPercent).replace('.', ',')} %`, label: 'del mundo' },
              {
                value: String(countryCount - state.totals.countries),
                label: 'por descubrir',
              },
            ]}
          />
          <Text role="heading" style={styles.heading}>
            Tus países
          </Text>
          <View style={styles.list}>
            {countries.map((entry) => (
              <View key={entry.id} style={styles.row}>
                <CountryChip code={entry.id} name={countryName(entry.id)} />
                <Text
                  style={styles.meta}
                >{`${fmtDate(entry.firstVisitedAt)}, ${entry.photoCount} fotos`}</Text>
              </View>
            ))}
          </View>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: { ...typography.heading, color: colors.ink },
  list: { gap: spacing[3] },
  row: { gap: spacing[1] },
  meta: { ...typography.data, color: colors.inkMuted },
});
