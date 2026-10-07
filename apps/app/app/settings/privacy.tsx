import { Icon, Reveal, colors, iconSizes, radii, spacing, typography } from '@atlas/design-system';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../components/Screen';

const PROMISES: readonly { title: string; body: string }[] = [
  {
    title: 'Las ubicaciones no salen del móvil',
    body: 'Atlas lee el GPS de tus fotos aquí dentro, sin conexión. No lo envía a ningún servidor.',
  },
  {
    title: 'Al compartir, solo ciudad y país',
    body: 'Las tarjetas nunca llevan coordenadas exactas ni la ciudad donde vives.',
  },
  {
    title: 'Las imágenes salen sin datos GPS',
    body: 'Las tarjetas son imágenes nuevas, sin la ubicación de la foto original.',
  },
  {
    title: 'Tus fotos se quedan en tu carrete',
    body: 'Atlas no copia ni sube fotos. Ocultar una foto no la borra.',
  },
];

function Shown({ ok, children }: { ok: boolean; children: string }) {
  return (
    <View style={styles.sample}>
      <Icon
        name={ok ? 'check' : 'close'}
        size={iconSizes.button}
        color={ok ? colors.olive : colors.stampRedText}
        label={ok ? 'Se muestra' : 'No se muestra'}
      />
      <Text style={[styles.sampleText, !ok && styles.struck]}>{children}</Text>
    </View>
  );
}

/** M10.2 · Privacidad: lo que Atlas garantiza, explicado sin letra pequeña. */
export default function PrivacyScreen() {
  return (
    <Screen title="Privacidad" back>
      <Text style={styles.lead}>
        Tus fotos y lugares son tuyos. Esto es lo que pasa con ellos, también cuando compartes.
      </Text>
      {PROMISES.map((p, i) => (
        <Reveal key={p.title} delay={i * 60}>
          <View style={styles.promise}>
            <View style={styles.badge}>
              <Icon name="check" size={iconSizes.button} color={colors.olive} />
            </View>
            <View style={styles.text}>
              <Text style={styles.title}>{p.title}</Text>
              <Text style={styles.body}>{p.body}</Text>
            </View>
          </View>
        </Reveal>
      ))}
      <Reveal delay={PROMISES.length * 60}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Así se ve en una tarjeta</Text>
          <Shown ok>Kioto, Japón</Shown>
          <Shown ok={false}>34,97° N 135,77° E</Shown>
          <Shown ok={false}>Tu base</Shown>
        </View>
      </Reveal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  lead: { ...typography.body, color: colors.inkMuted },
  promise: { flexDirection: 'row', gap: spacing[3], alignItems: 'flex-start' },
  badge: {
    width: spacing[6],
    height: spacing[6],
    borderRadius: radii.round,
    borderWidth: 1,
    borderColor: colors.olive,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1, gap: spacing[1] },
  title: { ...typography.bodyStrong, color: colors.ink },
  body: { ...typography.bodyS, color: colors.inkMuted },
  card: {
    gap: spacing[2],
    padding: spacing[4],
    backgroundColor: colors.paperRaised,
    borderWidth: 1,
    borderColor: colors.ink,
    borderRadius: radii.sm,
  },
  cardTitle: { ...typography.data, color: colors.inkMuted },
  sample: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  sampleText: { ...typography.bodyStrong, color: colors.ink },
  struck: { color: colors.inkMuted, textDecorationLine: 'line-through' },
});
