import {
  Button,
  EmptyState,
  ProgressBar,
  StatStrip,
  SyncIndicator,
  colors,
  spacing,
  typography,
} from '@atlas/design-system';
import { router } from 'expo-router';
import { Linking, StyleSheet, Text, View } from 'react-native';
import { usePhotoLibrary } from '../store/PhotoLibraryProvider';

const seconds = (ms: number): string => `${(ms / 1000).toFixed(1).replace('.', ',')} s`;
const count = (n: number): string => n.toLocaleString('es-ES');

/** M3.8 · Estado de importación, versión de prueba técnica: lee el carrete y mide cuánto tarda. */
export function PhotoLibraryPanel() {
  const { status, access, photos, progress, error, scan, cancel, pickMore } = usePhotoLibrary();

  if (status === 'unsupported') {
    return (
      <EmptyState
        icon="photos"
        title="Tus fotos viven en el móvil"
        body="Abre Atlas en tu iPhone o Android para leer el carrete. En la web solo verás las miniaturas sincronizadas."
      />
    );
  }

  if (status === 'denied') {
    return (
      <EmptyState
        icon="photos"
        title="Atlas aún no puede ver tus fotos"
        body="Da acceso en Ajustes para que tu mapa se desbloquee solo. Tus fotos y sus ubicaciones no salen del móvil."
        action="Abrir Ajustes"
        onAction={() => void Linking.openSettings()}
      />
    );
  }

  if (status === 'idle' || status === 'requesting') {
    return (
      <EmptyState
        icon="photos"
        title="Aún no hay fotos en tu mapa"
        body="Atlas lee la fecha y el lugar de tus fotos para desbloquear tu mapa. Todo se procesa en tu móvil."
        action={status === 'requesting' ? 'Pidiendo acceso' : 'Leer mis fotos'}
        onAction={() => void scan()}
      />
    );
  }

  const scanned = progress?.scanned ?? 0;
  const withGps = progress?.located ?? 0;
  const pct = scanned === 0 ? 0 : Math.round((withGps / scanned) * 100);

  return (
    <View style={styles.panel}>
      <SyncIndicator
        state={status === 'scanning' ? 'pending' : 'synced'}
        label={
          status === 'scanning'
            ? 'Leyendo tu carrete'
            : `Lectura completa en ${seconds(progress?.elapsedMs ?? 0)}`
        }
      />
      <StatStrip
        stats={[
          { value: count(scanned), label: 'fotos leídas' },
          { value: count(withGps), label: 'con ubicación' },
          { value: seconds(progress?.elapsedMs ?? 0), label: 'tiempo' },
        ]}
      />
      <ProgressBar
        label="Fotos con ubicación"
        value={pct}
        detail={`${count(photos.length)} puntos en tu mapa`}
      />

      {progress ? (
        <Text style={styles.data}>
          {`Prueba técnica: listar ${seconds(progress.listMs)}, ubicaciones ${seconds(progress.locationMs)}, ${
            progress.elapsedMs > 0 ? count(Math.round((scanned / progress.elapsedMs) * 1000)) : '0'
          } fotos/s`}
        </Text>
      ) : null}
      {error ? (
        <Text style={[styles.data, styles.error]}>{`No se pudo leer el carrete: ${error}`}</Text>
      ) : null}

      <View style={styles.actions}>
        {status === 'scanning' ? (
          <Button variant="secondary" onPress={cancel}>
            Pausar
          </Button>
        ) : (
          <>
            <Button icon="map" onPress={() => router.navigate('/')}>
              Ver en el mapa
            </Button>
            <Button variant="secondary" onPress={() => void scan()}>
              Volver a leer
            </Button>
          </>
        )}
        {access === 'limited' ? (
          <Button variant="ghost" onPress={() => void pickMore()}>
            Elegir más fotos
          </Button>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { gap: spacing[5] },
  data: { ...typography.data, color: colors.inkMuted },
  error: { color: colors.stampRedText },
  actions: { gap: spacing[3] },
});
