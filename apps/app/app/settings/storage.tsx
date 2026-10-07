import { Reveal, StatStrip, colors, typography } from '@atlas/design-system';
import { router } from 'expo-router';
import { StyleSheet, Text } from 'react-native';
import { Screen } from '../../components/Screen';
import { usePhotoLibrary } from '../../features/photos/store/PhotoLibraryProvider';
import { SettingsGroup, SettingsRow } from '../../features/settings/ui/SettingsRow';

const n = (value: number): string => value.toLocaleString('es-ES');

/** M10.3 · Fotos y almacenamiento: lo que Atlas sabe de tu carrete, sin ocupar espacio de fotos. */
export default function StorageScreen() {
  const { scannedTotal, photos, unlocated, hidden } = usePhotoLibrary();
  return (
    <Screen title="Fotos y almacenamiento" back>
      <Reveal>
        <StatStrip
          stats={[
            { value: n(scannedTotal), label: 'leídas' },
            { value: n(photos.length), label: 'en tu mapa' },
            { value: n(hidden.size), label: 'ocultas' },
          ]}
        />
      </Reveal>
      <Text style={styles.body}>
        Atlas no copia tus fotos: guarda solo su fecha y su lugar en una pequeña base de datos del
        móvil y pinta las miniaturas directamente desde tu carrete.
      </Text>
      <Reveal delay={60}>
        <SettingsGroup>
          <SettingsRow
            icon="sync"
            title="Importación del carrete"
            detail="Buscar fotos nuevas o volver a leer todo"
            onPress={() => router.push('/import')}
          />
          <SettingsRow
            icon="pin"
            title="Fotos sin ubicación"
            detail={
              unlocated.length > 0 ? `${n(unlocated.length)} por colocar` : 'Ninguna pendiente'
            }
            onPress={() => router.push('/unlocated')}
          />
          <SettingsRow
            icon="close"
            title="Fotos ocultas"
            detail={hidden.size > 0 ? `${n(hidden.size)} fuera de tu mapa` : 'Ninguna'}
            onPress={() => router.push('/settings/hidden')}
          />
        </SettingsGroup>
      </Reveal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { ...typography.bodyS, color: colors.inkMuted },
});
