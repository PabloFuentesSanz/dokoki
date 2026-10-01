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
import { useSettings } from '../../settings/store/SettingsProvider';
import { usePhotoLibrary } from '../store/PhotoLibraryProvider';

const seconds = (ms: number): string => `${(ms / 1000).toFixed(1).replace('.', ',')} s`;
const count = (n: number): string => n.toLocaleString('es-ES');

/** M3.8 · Estado de importación, versión de prueba técnica: lee el carrete y mide cuánto tarda. */
export function PhotoLibraryPanel() {
  const {
    unlocated,
    status,
    access,
    photos,
    progress,
    scannedTotal,
    incremental,
    error,
    scan,
    cancel,
    pickMore,
  } = usePhotoLibrary();
  const { bases } = useSettings();

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

  if (status === 'loading') {
    return <SyncIndicator state="pending" label="Cargando tus fotos guardadas" />;
  }

  if ((status === 'idle' || status === 'requesting') && scannedTotal === 0) {
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

  const withGps = photos.length;
  const pct = scannedTotal === 0 ? 0 : Math.round((withGps / scannedTotal) * 100);
  const syncLabel =
    status === 'scanning'
      ? incremental
        ? 'Buscando fotos nuevas'
        : 'Leyendo tu carrete'
      : progress && incremental
        ? `${count(progress.scanned)} fotos nuevas`
        : 'Todo guardado en tu móvil';

  return (
    <View style={styles.panel}>
      <SyncIndicator state={status === 'scanning' ? 'pending' : 'synced'} label={syncLabel} />
      <StatStrip
        stats={[
          { value: count(scannedTotal), label: 'fotos leídas' },
          { value: count(withGps), label: 'con ubicación' },
          { value: seconds(progress?.elapsedMs ?? 0), label: 'última lectura' },
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
            progress.elapsedMs > 0
              ? count(Math.round((progress.scanned / progress.elapsedMs) * 1000))
              : '0'
          } fotos/s`}
        </Text>
      ) : null}
      {unlocated.length > 0 && status !== 'scanning' ? (
        <Button variant="secondary" icon="pin" onPress={() => router.push('/unlocated')}>
          {`Colocar ${count(unlocated.length)} fotos sin ubicación`}
        </Button>
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
            {bases.length === 0 ? (
              <Button icon="pin" onPress={() => router.push('/bases')}>
                Elegir mi base
              </Button>
            ) : null}
            <Button
              icon="map"
              variant={bases.length === 0 ? 'secondary' : 'primary'}
              onPress={() => router.navigate('/')}
            >
              Ver en el mapa
            </Button>
            <Button variant="secondary" onPress={() => void scan()}>
              Buscar fotos nuevas
            </Button>
            <Button variant="ghost" onPress={() => void scan({ full: true })}>
              Volver a leer todo
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
