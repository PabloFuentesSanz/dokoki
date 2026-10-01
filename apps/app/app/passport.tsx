import { Button, EmptyState, Stamp, colors, spacing, typography } from '@atlas/design-system';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { useUnlockState } from '../features/map/hooks/useUnlockState';
import { cityName } from '../features/map/services/cities';
import { continentName, countryName } from '../features/map/services/countries';
import { stampDate } from '../features/sharing/services/stampDate';

type Order = 'date' | 'continent';

/** M2.2 · Pasaporte (HU-15): un sello por país (redondo) y por ciudad (rectangular). */
export default function PassportScreen() {
  const { state } = useUnlockState();
  const [order, setOrder] = useState<Order>('date');

  const countries = useMemo(() => {
    const list = Object.values(state.countries);
    return order === 'date'
      ? [...list].sort((a, b) => (a.firstVisitedAt ?? 0) - (b.firstVisitedAt ?? 0))
      : [...list].sort(
          (a, b) =>
            continentName(a.id).localeCompare(continentName(b.id), 'es') ||
            (a.firstVisitedAt ?? 0) - (b.firstVisitedAt ?? 0),
        );
  }, [state.countries, order]);
  const cities = useMemo(
    () =>
      Object.values(state.cities).sort((a, b) => (a.firstVisitedAt ?? 0) - (b.firstVisitedAt ?? 0)),
    [state.cities],
  );

  if (countries.length === 0) {
    return (
      <Screen title="Pasaporte" back>
        <EmptyState
          icon="compass"
          title="Tu pasaporte aún está en blanco"
          body="Lee tus fotos y cada país y ciudad te dará su sello."
        />
      </Screen>
    );
  }

  return (
    <Screen title="Pasaporte" back>
      <View style={styles.row}>
        <Button
          size="sm"
          variant={order === 'date' ? 'primary' : 'secondary'}
          onPress={() => setOrder('date')}
        >
          Por fecha
        </Button>
        <Button
          size="sm"
          variant={order === 'continent' ? 'primary' : 'secondary'}
          onPress={() => setOrder('continent')}
        >
          Por continente
        </Button>
        <Button
          size="sm"
          variant="ghost"
          icon="share"
          onPress={() => router.push({ pathname: '/share', params: { kind: 'passport' } })}
        >
          Compartir
        </Button>
      </View>

      <Text role="heading" style={styles.heading}>
        {`${countries.length} ${countries.length === 1 ? 'país' : 'países'}`}
      </Text>
      <View style={styles.grid}>
        {countries.map((c) => (
          <Stamp
            key={c.id}
            label={countryName(c.id)}
            date={stampDate(c.firstVisitedAt)}
            size={96}
            straight
          />
        ))}
      </View>

      {cities.length > 0 ? (
        <>
          <Text role="heading" style={styles.heading}>
            {`${cities.length} ${cities.length === 1 ? 'ciudad' : 'ciudades'}`}
          </Text>
          <View style={styles.grid}>
            {cities.map((c) => (
              <Stamp
                key={c.id}
                kind="city"
                label={cityName(c.id)}
                date={stampDate(c.firstVisitedAt)}
                size={96}
                straight
              />
            ))}
          </View>
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  heading: { ...typography.heading, color: colors.ink },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[3] },
});
