import {
  Button,
  CountryChip,
  EmptyState,
  TextField,
  colors,
  radii,
  spacing,
  touchTarget,
  typography,
} from '@atlas/design-system';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { cityById, searchCities, type City } from '../features/map/services/cities';
import { countryName } from '../features/map/services/countries';
import { basePeriod, type Base } from '../features/settings/services/bases';
import { useSettings } from '../features/settings/store/SettingsProvider';
import { useTrips } from '../features/trips/hooks/useTrips';

const toYear = (text: string): number | null => {
  const n = Number.parseInt(text, 10);
  return Number.isInteger(n) && n > 1900 && n < 2100 ? n : null;
};

function newBase(city: City, fromYear: number | null, untilYear: number | null): Base {
  return {
    id: `${city.id}-${Date.now()}`,
    cityId: city.id,
    name: city.name,
    countryCode: city.country,
    lat: city.lat,
    lng: city.lng,
    fromYear,
    untilYear,
  };
}

/**
 * M0.5 · Tu base. Puedes tener varias (casa y pueblo, o una ciudad tras otra) con periodo
 * opcional. Una foto cuenta como "en casa" si está a menos de 50 km de una base vigente.
 */
export default function BasesScreen() {
  const { bases, saveBases } = useSettings();
  const { suggestedCityId } = useTrips();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<City | null>(null);
  const [fromText, setFromText] = useState('');
  const [untilText, setUntilText] = useState('');

  const results = useMemo(() => (selected ? [] : searchCities(query, 6)), [query, selected]);
  const suggested = suggestedCityId ? cityById(suggestedCityId) : undefined;
  const showSuggestion = suggested && !bases.some((b) => b.cityId === suggested.id);

  const add = async (city: City, fromYear: number | null, untilYear: number | null) => {
    await saveBases([...bases, newBase(city, fromYear, untilYear)]);
    setSelected(null);
    setQuery('');
    setFromText('');
    setUntilText('');
  };

  return (
    <Screen title="Tus bases" back>
      <Text style={styles.body}>
        Tu base es donde vives. Las fotos hechas a más de 50 km de tus bases forman tus viajes.
        Puedes tener varias y decir en qué años fue cada una.
      </Text>

      {bases.length === 0 ? (
        <EmptyState
          icon="pin"
          title="Aún no tienes base"
          body="Elige al menos una para que tus viajes se detecten solos."
        />
      ) : (
        <View style={styles.list}>
          {bases.map((base) => (
            <View key={base.id} style={styles.baseRow}>
              <View style={styles.baseText}>
                <Text style={styles.baseName}>{base.name}</Text>
                <Text
                  style={styles.meta}
                >{`${countryName(base.countryCode)}, ${basePeriod(base)}`}</Text>
              </View>
              <Button
                size="sm"
                variant="ghost"
                onPress={() => void saveBases(bases.filter((b) => b.id !== base.id))}
              >
                Quitar
              </Button>
            </View>
          ))}
        </View>
      )}

      {showSuggestion && suggested ? (
        <View style={styles.card}>
          <Text style={styles.meta}>Sugerencia: la ciudad con más fotos</Text>
          <CountryChip
            code={suggested.country}
            name={`${suggested.name}, ${countryName(suggested.country)}`}
          />
          <Button icon="pin" onPress={() => void add(suggested, null, null)}>
            {`Usar ${suggested.name}`}
          </Button>
        </View>
      ) : null}

      <View style={styles.card}>
        <Text role="heading" style={styles.heading}>
          Añadir una base
        </Text>
        {selected ? (
          <>
            <CountryChip
              code={selected.country}
              name={`${selected.name}, ${countryName(selected.country)}`}
            />
            <View style={styles.years}>
              <View style={styles.year}>
                <TextField
                  label="Desde (año)"
                  type="number"
                  value={fromText}
                  onChangeText={setFromText}
                  placeholder="opcional"
                />
              </View>
              <View style={styles.year}>
                <TextField
                  label="Hasta (año)"
                  type="number"
                  value={untilText}
                  onChangeText={setUntilText}
                  placeholder="opcional"
                />
              </View>
            </View>
            <Button onPress={() => void add(selected, toYear(fromText), toYear(untilText))}>
              Guardar base
            </Button>
            <Button variant="ghost" onPress={() => setSelected(null)}>
              Elegir otra ciudad
            </Button>
          </>
        ) : (
          <>
            <TextField
              label="Ciudad"
              value={query}
              onChangeText={setQuery}
              placeholder="Madrid, Kioto, Lima…"
            />
            {results.map((city) => (
              <Pressable
                key={city.id}
                role="button"
                aria-label={`${city.name}, ${countryName(city.country)}`}
                onPress={() => setSelected(city)}
                style={({ pressed }) => [styles.result, pressed && styles.pressed]}
              >
                <Text style={styles.baseName}>{city.name}</Text>
                <Text style={styles.meta}>{countryName(city.country)}</Text>
              </Pressable>
            ))}
          </>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { ...typography.body, color: colors.inkMuted },
  heading: { ...typography.heading, color: colors.ink },
  list: { gap: spacing[2] },
  baseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingVertical: spacing[2],
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
  },
  baseText: { flex: 1, gap: 2 },
  baseName: { ...typography.bodyStrong, color: colors.ink },
  meta: { ...typography.data, color: colors.inkMuted },
  card: {
    gap: spacing[3],
    padding: spacing[4],
    backgroundColor: colors.paperRaised,
    borderWidth: 1,
    borderColor: colors.ink,
    borderRadius: radii.sm,
  },
  years: { flexDirection: 'row', gap: spacing[3] },
  year: { flex: 1 },
  result: {
    minHeight: touchTarget,
    justifyContent: 'center',
    paddingVertical: spacing[2],
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
  },
  pressed: { backgroundColor: colors.paper },
});
