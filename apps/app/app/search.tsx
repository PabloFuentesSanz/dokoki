import { TextField, Tag, colors, spacing, touchTarget, typography } from '@atlas/design-system';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { useUnlockState } from '../features/map/hooks/useUnlockState';
import { searchCities } from '../features/map/services/cities';
import { countryName, searchCountries } from '../features/map/services/countries';
import { usePhotoLibrary } from '../features/photos/store/PhotoLibraryProvider';

const fotos = (n: number): string => `${n.toLocaleString('es-ES')} ${n === 1 ? 'foto' : 'fotos'}`;

function Result({
  name,
  meta,
  visited,
  onPress,
}: {
  name: string;
  meta: string;
  visited: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      role="link"
      aria-label={`${name}, ${meta}`}
      onPress={onPress}
      style={({ pressed }) => [styles.result, pressed && styles.pressed]}
    >
      <View style={styles.resultText}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.meta}>{meta}</Text>
      </View>
      <Tag tone={visited ? 'visited' : 'unexplored'}>{visited ? 'Visitado' : 'Por descubrir'}</Tag>
    </Pressable>
  );
}

/** M1.8 · Búsqueda de países y ciudades, en el dispositivo y sin red. */
export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const { state } = useUnlockState();
  const { assignments } = usePhotoLibrary();
  const photosByCity = useMemo(() => {
    const counts = new Map<string, number>();
    for (const a of assignments) {
      if (a.cityId !== null) counts.set(a.cityId, (counts.get(a.cityId) ?? 0) + 1);
    }
    return counts;
  }, [assignments]);
  const countries = useMemo(() => searchCountries(query), [query]);
  const cities = useMemo(() => searchCities(query, 8), [query]);

  return (
    <Screen title="Buscar" back>
      <TextField
        label="País o ciudad"
        value={query}
        onChangeText={setQuery}
        placeholder="Japón, Kioto, Lima…"
      />
      {countries.length > 0 ? (
        <View>
          <Text role="heading" style={styles.heading}>
            Países
          </Text>
          {countries.map((c) => {
            const entry = state.countries[c.code];
            return (
              <Result
                key={c.code}
                name={c.name}
                meta={entry ? fotos(entry.photoCount) : c.code}
                visited={entry !== undefined}
                onPress={() =>
                  router.push({ pathname: '/country/[code]', params: { code: c.code } })
                }
              />
            );
          })}
        </View>
      ) : null}
      {cities.length > 0 ? (
        <View>
          <Text role="heading" style={styles.heading}>
            Ciudades
          </Text>
          {cities.map((city) => {
            const count = photosByCity.get(city.id) ?? 0;
            return (
              <Result
                key={city.id}
                name={city.name}
                meta={
                  count > 0
                    ? `${countryName(city.country)}, ${fotos(count)}`
                    : countryName(city.country)
                }
                visited={count > 0}
                // TODO(M1.6): ficha de ciudad. Mientras, sus fotos o la ficha de su país.
                onPress={() =>
                  count > 0
                    ? router.push({ pathname: '/gallery', params: { scope: `city:${city.id}` } })
                    : router.push({ pathname: '/country/[code]', params: { code: city.country } })
                }
              />
            );
          })}
        </View>
      ) : null}
      {query.trim().length > 0 && countries.length === 0 && cities.length === 0 ? (
        <Text style={styles.meta}>{`Nada con "${query.trim()}". Prueba con otro nombre.`}</Text>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: { ...typography.heading, color: colors.ink, marginBottom: spacing[2] },
  result: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    minHeight: touchTarget,
    paddingVertical: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
  },
  pressed: { backgroundColor: colors.paperRaised },
  resultText: { flex: 1 },
  name: { ...typography.bodyStrong, color: colors.ink },
  meta: { ...typography.data, color: colors.inkMuted },
});
