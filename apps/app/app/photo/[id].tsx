import {
  Breadcrumbs,
  Button,
  IconButton,
  Paper,
  Tag,
  colors,
  spacing,
  typography,
} from '@atlas/design-system';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cityName } from '../../features/map/services/cities';
import { countryName } from '../../features/map/services/countries';
import { regionName } from '../../features/map/services/regions';
import { CityPicker } from '../../features/map/ui/CityPicker';
import { useGallery } from '../../features/photos/hooks/useGallery';
import { thumbnailUri } from '../../features/photos/services/thumbnails';
import { usePhotoLibrary } from '../../features/photos/store/PhotoLibraryProvider';
import { photoLabel } from '../../features/photos/ui/photoLabel';

const when = (ms: number): string =>
  new Date(ms).toLocaleString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

/**
 * M3.4 · Detalle de foto, deslizando entre las fotos del mismo ámbito, y M3.4b · Corregir
 * ubicación (se guarda como manual). Las coordenadas no se muestran: solo el lugar.
 * TODO(M3.7): ocultar la foto; TODO(M3.4): notas (HandNote) y añadir a un viaje.
 */
export default function PhotoScreen() {
  const { id = '', scope = 'all' } = useLocalSearchParams<{ id: string; scope: string }>();
  const { photos } = useGallery(scope);
  const { assignLocations } = usePhotoLibrary();
  const { width, height } = useWindowDimensions();
  const [index, setIndex] = useState(() =>
    Math.max(
      0,
      photos.findIndex((p) => p.photoId === id),
    ),
  );
  const [fixing, setFixing] = useState(false);
  const current = photos[index];
  const imageHeight = Math.round(height * 0.58);

  const crumbs = current
    ? [
        current.countryCode ? countryName(current.countryCode) : null,
        current.regionId ? regionName(current.regionId) : null,
        current.cityId ? cityName(current.cityId) : null,
      ].filter((c): c is string => c !== null)
    : [];

  return (
    <Paper>
      <SafeAreaView edges={['top', 'bottom']} style={styles.fill}>
        <View style={styles.bar}>
          <IconButton icon="back" label="Volver" onPress={() => router.back()} />
          <Text style={styles.counter}>
            {photos.length > 0 ? `${index + 1} de ${photos.length.toLocaleString('es-ES')}` : ''}
          </Text>
        </View>
        <FlatList
          data={photos}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(p) => p.photoId}
          initialScrollIndex={index}
          getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
          windowSize={3}
          initialNumToRender={1}
          maxToRenderPerBatch={2}
          style={{ height: imageHeight, flexGrow: 0 }}
          scrollEventThrottle={64}
          onScroll={(e) => {
            const next = Math.round(e.nativeEvent.contentOffset.x / width);
            if (next !== index && next >= 0 && next < photos.length) setIndex(next);
          }}
          renderItem={({ item }) => (
            <View style={{ width, height: imageHeight, padding: spacing[3] }}>
              <Image
                source={{ uri: thumbnailUri(item.photoId) }}
                resizeMode="contain"
                aria-label={photoLabel(item.takenAt)}
                style={styles.fill}
              />
            </View>
          )}
        />
        {current ? (
          <ScrollView contentContainerStyle={styles.info}>
            {crumbs.length > 0 ? <Breadcrumbs items={crumbs} /> : null}
            <Text role="heading" style={styles.title}>
              {crumbs.at(-1) ?? 'Sin lugar'}
            </Text>
            <Text style={styles.data}>{when(current.takenAt)}</Text>
            {current.source === 'manual' ? <Tag tone="settled">Ubicación puesta a mano</Tag> : null}
            <View style={styles.actions}>
              <Button variant="secondary" icon="pin" onPress={() => setFixing(true)}>
                Corregir ubicación
              </Button>
              {current.countryCode ? (
                <Button
                  variant="ghost"
                  onPress={() =>
                    router.push({
                      pathname: '/country/[code]',
                      params: { code: current.countryCode ?? '' },
                    })
                  }
                >
                  {`Ver ${countryName(current.countryCode)}`}
                </Button>
              ) : null}
            </View>
          </ScrollView>
        ) : null}
      </SafeAreaView>

      <Modal visible={fixing} animationType="slide" onRequestClose={() => setFixing(false)}>
        <Paper>
          <SafeAreaView edges={['top', 'bottom']} style={styles.fill}>
            <ScrollView contentContainerStyle={styles.sheet} keyboardShouldPersistTaps="handled">
              <View style={styles.bar}>
                <Text role="heading" style={styles.title}>
                  Corregir ubicación
                </Text>
                <IconButton icon="close" label="Cerrar" onPress={() => setFixing(false)} />
              </View>
              <Text style={styles.body}>
                Elige la ciudad donde hiciste la foto. Se guarda solo en tu móvil y una nueva
                lectura del carrete no la cambia.
              </Text>
              <CityPicker
                onPick={(city) => {
                  if (current) {
                    void assignLocations([
                      { ids: [current.photoId], location: { lat: city.lat, lng: city.lng } },
                    ]);
                  }
                  setFixing(false);
                }}
              />
            </ScrollView>
          </SafeAreaView>
        </Paper>
      </Modal>
    </Paper>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[2],
  },
  counter: { ...typography.data, color: colors.inkMuted, paddingRight: spacing[3] },
  info: { padding: spacing[4], gap: spacing[2] },
  title: { ...typography.heading, color: colors.ink },
  data: { ...typography.data, color: colors.inkMuted },
  body: { ...typography.bodyS, color: colors.inkMuted },
  actions: { gap: spacing[2], marginTop: spacing[3] },
  sheet: { padding: spacing[4], gap: spacing[4] },
});
