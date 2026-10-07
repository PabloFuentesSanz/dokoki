import { Reveal, colors, spacing, typography } from '@atlas/design-system';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../components/Screen';

const CREDITS: readonly { name: string; what: string; license: string; url: string }[] = [
  {
    name: 'GeoNames',
    what: 'Ciudades del mundo de 15.000 habitantes o más (vía all-the-cities).',
    license: 'CC BY 4.0',
    url: 'https://www.geonames.org/',
  },
  {
    name: 'Natural Earth',
    what: 'Límites de países y regiones.',
    license: 'Dominio público',
    url: 'https://www.naturalearthdata.com/',
  },
  {
    name: 'OpenStreetMap',
    what: 'Datos del mapa base, servido por OpenFreeMap. © colaboradores de OpenStreetMap.',
    license: 'ODbL',
    url: 'https://www.openstreetmap.org/copyright',
  },
  {
    name: 'OpenFreeMap',
    what: 'Teselas y estilo del mapa base.',
    license: 'MIT',
    url: 'https://openfreemap.org/',
  },
  {
    name: 'MapLibre',
    what: 'Motor del mapa en iOS, Android y web.',
    license: 'BSD-2',
    url: 'https://maplibre.org/',
  },
  {
    name: 'Libre Caslon Text, Courier Prime y Caveat',
    what: 'Tipografías del cuaderno.',
    license: 'SIL Open Font License',
    url: 'https://fonts.google.com/',
  },
];

/** M10 · Créditos: atribuciones de datos abiertos (GeoNames exige citarlo: CC BY 4.0). */
export default function CreditsScreen() {
  return (
    <Screen title="Créditos" back>
      <Text style={styles.lead}>
        Atlas funciona sin conexión gracias a datos abiertos que viajan dentro de la app.
      </Text>
      <View>
        {CREDITS.map((c, i) => (
          <Reveal key={c.name} delay={i * 50}>
            <Pressable
              role="link"
              aria-label={`${c.name}, ${c.license}. Abrir su web`}
              onPress={() => void Linking.openURL(c.url)}
              style={({ pressed }) => [styles.row, pressed && styles.pressed]}
            >
              <View style={styles.head}>
                <Text style={styles.name}>{c.name}</Text>
                <Text style={styles.license}>{c.license}</Text>
              </View>
              <Text style={styles.what}>{c.what}</Text>
            </Pressable>
          </Reveal>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  lead: { ...typography.body, color: colors.inkMuted },
  row: {
    gap: spacing[1],
    paddingVertical: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
  },
  pressed: { backgroundColor: colors.paperRaised },
  head: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing[3] },
  name: { ...typography.bodyStrong, color: colors.ink, flex: 1 },
  license: { ...typography.data, color: colors.inkMuted },
  what: { ...typography.bodyS, color: colors.inkMuted },
});
