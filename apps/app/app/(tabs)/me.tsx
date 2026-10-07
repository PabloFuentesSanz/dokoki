import {
  Button,
  CountryChip,
  ProgressBar,
  EmptyState,
  IconButton,
  Reveal,
  StatStrip,
  colors,
  radii,
  spacing,
  typography,
} from '@atlas/design-system';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../components/Screen';
import { useUnlockState } from '../../features/map/hooks/useUnlockState';
import {
  continentProgress,
  countryCount,
  countryName,
} from '../../features/map/services/countries';
import { regionsOf } from '../../features/map/services/regions';
import { basePeriod } from '../../features/settings/services/bases';
import { useSettings } from '../../features/settings/store/SettingsProvider';

const fmtDate = (ms: number | null): string =>
  ms === null ? '' : new Date(ms).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

/**
 * M2.1 · Tu progreso (versión inicial) dentro de Tú.
 */
export default function MeScreen() {
  const { state } = useUnlockState();
  const { bases } = useSettings();
  const countries = Object.values(state.countries).sort(
    (a, b) => (a.firstVisitedAt ?? 0) - (b.firstVisitedAt ?? 0),
  );
  const continents = continentProgress(Object.keys(state.countries));
  // "Casi lo tienes": el país con más regiones (sin estar completo) y al menos la mitad.
  const almost = Object.entries(state.regionPercentByCountry)
    .filter(([code, pct]) => pct >= 50 && pct < 100 && regionsOf(code).length >= 3)
    .sort((a, b) => b[1] - a[1])[0];
  const missing = almost ? regionsOf(almost[0]).filter((r) => !(r.id in state.regions)) : [];

  return (
    <Screen
      title="Tú"
      actions={
        <IconButton icon="settings" label="Ajustes" onPress={() => router.push('/settings')} />
      }
    >
      <View style={styles.list}>
        <Text role="heading" style={styles.heading}>
          Tus bases
        </Text>
        <Text style={styles.meta}>
          {bases.length === 0
            ? 'Aún no has elegido ninguna: sin base no se detectan viajes.'
            : bases.map((b) => `${b.name} (${basePeriod(b)})`).join(', ')}
        </Text>
        <Button variant="secondary" icon="pin" onPress={() => router.push('/bases')}>
          {bases.length === 0 ? 'Elegir mi base' : 'Cambiar mis bases'}
        </Button>
      </View>
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
          <View style={styles.actions}>
            <Button icon="ticket" onPress={() => router.push('/passport')}>
              Ver mi pasaporte
            </Button>
            <Button
              variant="secondary"
              icon="share"
              onPress={() => router.push({ pathname: '/share', params: { kind: 'passport' } })}
            >
              Compartir
            </Button>
          </View>
          {almost ? (
            <Reveal>
              <View style={styles.almost}>
                <Text style={styles.almostKicker}>Casi lo tienes</Text>
                <Text style={styles.almostText}>
                  {`Te ${missing.length === 1 ? 'falta' : 'faltan'} ${missing.length} ${
                    missing.length === 1 ? 'región' : 'regiones'
                  } para completar ${countryName(almost[0])}: ${missing
                    .slice(0, 3)
                    .map((r) => r.name)
                    .join(', ')}${missing.length > 3 ? '…' : '.'}`}
                </Text>
                <Button
                  size="sm"
                  variant="secondary"
                  onPress={() =>
                    router.push({ pathname: '/country/[code]', params: { code: almost[0] } })
                  }
                >
                  {`Ver ${countryName(almost[0])}`}
                </Button>
              </View>
            </Reveal>
          ) : null}
          <Text role="heading" style={styles.heading}>
            Por continente
          </Text>
          <View style={styles.list}>
            {continents.map((c) => (
              <ProgressBar
                key={c.continent}
                label={c.continent}
                value={(c.visited / c.total) * 100}
                detail={c.visited === 0 ? 'Ninguno aún' : `${c.visited} de ${c.total} países`}
              />
            ))}
          </View>
          <Text role="heading" style={styles.heading}>
            Tus países
          </Text>
          <View style={styles.list}>
            {countries.map((entry, i) => (
              <Reveal key={entry.id} delay={Math.min(i, 12) * 40} style={styles.row}>
                <CountryChip
                  code={entry.id}
                  name={countryName(entry.id)}
                  onPress={() =>
                    router.push({ pathname: '/country/[code]', params: { code: entry.id } })
                  }
                />
                <Text
                  style={styles.meta}
                >{`${fmtDate(entry.firstVisitedAt)}, ${entry.photoCount} fotos`}</Text>
              </Reveal>
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
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  almost: {
    gap: spacing[2],
    padding: spacing[4],
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.stampBlue,
    borderRadius: radii.sm,
    alignItems: 'flex-start',
  },
  almostKicker: { ...typography.data, color: colors.stampBlue },
  almostText: { ...typography.body, color: colors.ink },
});
