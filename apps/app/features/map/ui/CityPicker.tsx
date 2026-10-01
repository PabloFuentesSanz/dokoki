import { TextField, colors, spacing, touchTarget, typography } from '@atlas/design-system';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { searchCities, type City } from '../services/cities';
import { countryName } from '../services/countries';

interface CityPickerProps {
  label?: string;
  onPick: (city: City) => void;
}

/** Buscador de ciudades en el dispositivo (GeoNames ≥ 15.000 hab.), sin red. */
export function CityPicker({ label = 'Ciudad', onPick }: CityPickerProps) {
  const [query, setQuery] = useState('');
  const results = useMemo(() => searchCities(query, 6), [query]);
  return (
    <View style={styles.wrap}>
      <TextField
        label={label}
        value={query}
        onChangeText={setQuery}
        placeholder="Madrid, Kioto, Lima…"
      />
      {results.map((city) => (
        <Pressable
          key={city.id}
          role="button"
          aria-label={`${city.name}, ${countryName(city.country)}`}
          onPress={() => onPick(city)}
          style={({ pressed }) => [styles.result, pressed && styles.pressed]}
        >
          <Text style={styles.name}>{city.name}</Text>
          <Text style={styles.meta}>{countryName(city.country)}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing[2] },
  result: {
    minHeight: touchTarget,
    justifyContent: 'center',
    paddingVertical: spacing[2],
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
  },
  pressed: { backgroundColor: colors.paperRaised },
  name: { ...typography.bodyStrong, color: colors.ink },
  meta: { ...typography.data, color: colors.inkMuted },
});
