import { Reveal, colors, spacing, typography } from '@atlas/design-system';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../components/Screen';
import { basePeriod } from '../../features/settings/services/bases';
import { useSettings } from '../../features/settings/store/SettingsProvider';
import { SettingsGroup, SettingsRow } from '../../features/settings/ui/SettingsRow';

/** M10 · Ajustes. Sin cuenta todavía: todo vive en este móvil. */
export default function SettingsScreen() {
  const { bases } = useSettings();
  const version = Constants.expoConfig?.version ?? '0.1.0';
  return (
    <Screen title="Ajustes" back>
      <Reveal>
        <View style={styles.account}>
          <Text style={styles.accountTitle}>Tu cuaderno vive en este móvil</Text>
          <Text style={styles.meta}>
            {bases.length > 0
              ? `Base en ${bases.map((b) => `${b.name} (${basePeriod(b)})`).join(', ')}`
              : 'Aún sin base'}
          </Text>
          <Text style={styles.body}>
            Cuando llegue la cuenta podrás verlo también en el ordenador. Tus fotos y sus
            ubicaciones seguirán sin salir del móvil.
          </Text>
        </View>
      </Reveal>
      <Reveal delay={60}>
        <SettingsGroup>
          <SettingsRow
            icon="pin"
            title="Tus bases"
            detail="Dónde vives o has vivido"
            onPress={() => router.push('/bases')}
          />
          <SettingsRow
            icon="settings"
            title="General"
            detail="Idioma, distancias y movimiento"
            onPress={() => router.push('/settings/general')}
          />
          <SettingsRow
            icon="check"
            title="Privacidad"
            detail="Qué se ve cuando compartes"
            onPress={() => router.push('/settings/privacy')}
          />
          <SettingsRow
            icon="photos"
            title="Fotos y almacenamiento"
            detail="Importación, fotos ocultas y espacio"
            onPress={() => router.push('/settings/storage')}
          />
          <SettingsRow
            icon="cloud"
            title="Tus datos"
            detail="Exportar o borrar todo"
            onPress={() => router.push('/settings/data')}
          />
          <SettingsRow
            icon="compass"
            title="Créditos"
            detail="Mapas, datos abiertos y atribuciones"
            onPress={() => router.push('/settings/credits')}
          />
        </SettingsGroup>
      </Reveal>
      <Text style={styles.version}>{`Atlas ${version}, beta`}</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  account: {
    gap: spacing[1],
    padding: spacing[4],
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.ink,
  },
  accountTitle: { ...typography.bodyStrong, color: colors.ink },
  meta: { ...typography.data, color: colors.inkMuted },
  body: { ...typography.bodyS, color: colors.inkMuted, marginTop: spacing[1] },
  version: { ...typography.dataS, color: colors.inkMuted },
});
