import { Reveal, SegmentedTabs, colors, spacing, typography } from '@atlas/design-system';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../components/Screen';
import type { DistanceUnit } from '../../features/settings/services/units';
import { useSettings } from '../../features/settings/store/SettingsProvider';

const UNITS: readonly { value: DistanceUnit; label: string }[] = [
  { value: 'km', label: 'Kilómetros' },
  { value: 'mi', label: 'Millas' },
];

function Info({ title, detail }: { title: string; detail: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.detail}>{detail}</Text>
    </View>
  );
}

/** M10.5 · General: idioma, distancias y movimiento. Los cambios se aplican al momento. */
export default function GeneralScreen() {
  const { unit, saveUnit } = useSettings();
  return (
    <Screen title="General" back>
      <Reveal>
        <View style={styles.block}>
          <Text role="heading" style={styles.kicker}>
            Distancias
          </Text>
          <SegmentedTabs
            label="Unidad de distancia"
            options={UNITS}
            value={unit}
            onChange={(u) => void saveUnit(u)}
          />
        </View>
      </Reveal>
      <Reveal delay={60}>
        <View style={styles.group}>
          <Info title="Idioma" detail="Español. Más idiomas, después de la beta." />
          <Info
            title="Movimiento"
            detail="Atlas sigue el ajuste Reducir movimiento de tu móvil: con él activo, nada se desplaza."
          />
          <Info
            title="Avisos"
            detail="Llegarán con la cuenta: viajes por revisar y países desbloqueados."
          />
        </View>
      </Reveal>
      <Text style={styles.detail}>Los cambios se aplican al momento, sin reiniciar la app.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  block: { gap: spacing[2] },
  kicker: { ...typography.data, color: colors.ink },
  group: { borderTopWidth: 1, borderTopColor: colors.ink },
  row: {
    gap: spacing[1],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
  },
  title: { ...typography.bodyStrong, color: colors.ink },
  detail: { ...typography.data, color: colors.inkMuted },
});
