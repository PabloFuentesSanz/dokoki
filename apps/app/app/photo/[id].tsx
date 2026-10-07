import {
  Breadcrumbs,
  Button,
  Icon,
  IconButton,
  Paper,
  Tag,
  colors,
  iconSizes,
  radii,
  shadows,
  spacing,
  touchTarget,
  typography,
} from '@atlas/design-system';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  FlatList,
  Image,
  Modal,
  Pressable,
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
import { useTrips } from '../../features/trips/hooks/useTrips';

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
  const { assignLocations, hidePhotos } = usePhotoLibrary();
  const { trips } = useTrips();
  const [confirmHide, setConfirmHide] = useState(false);
  const { width, height } = useWindowDimensions();
  const [index, setIndex] = useState(() =>
    Math.max(
      0,
      photos.findIndex((p) => p.photoId === id),
    ),
  );
  const [fixing, setFixing] = useState(false);
  // Al ocultar la última foto de la lista, el índice se queda dentro.
  const current = photos[Math.min(index, photos.length - 1)];
  const trip = current ? trips.find((t) => t.photoIds.includes(current.photoId)) : undefined;
  const imageHeight = Math.round(height * 0.58);

  // País › región › ciudad; cada nivel abre su ficha.
  const levels: { level: 'country' | 'region' | 'city'; id: string; name: string }[] = current
    ? [
        {
          level: 'country' as const,
          id: current.countryCode,
          name: countryName(current.countryCode),
        },
        ...(current.regionId
          ? [{ level: 'region' as const, id: current.regionId, name: regionName(current.regionId) }]
          : []),
        ...(current.cityId
          ? [{ level: 'city' as const, id: current.cityId, name: cityName(current.cityId) }]
          : []),
      ]
    : [];
  const crumbs = levels.map((l) => l.name);
  const cityId = current?.cityId ?? null;

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
            {crumbs.length > 0 ? (
              <Breadcrumbs
                items={crumbs}
                onNavigate={(i) => {
                  const target = levels[i];
                  if (target?.level === 'country')
                    router.push({ pathname: '/country/[code]', params: { code: target.id } });
                  if (target?.level === 'region')
                    router.push({ pathname: '/region/[id]', params: { id: target.id } });
                }}
              />
            ) : null}
            <Text role="heading" style={styles.title}>
              {crumbs.at(-1) ?? 'Sin lugar'}
            </Text>
            <Text style={styles.data}>{when(current.takenAt)}</Text>
            {trip ? (
              <Pressable
                role="link"
                aria-label={`Del viaje ${trip.name}`}
                onPress={() => router.push({ pathname: '/trip/[id]', params: { id: trip.id } })}
                style={styles.tripLink}
              >
                <Icon name="trips" size={iconSizes.button} color={colors.ink} />
                <Text style={styles.tripText}>{trip.name}</Text>
              </Pressable>
            ) : null}
            {current.source === 'manual' ? <Tag tone="settled">Ubicación puesta a mano</Tag> : null}
            <View style={styles.actions}>
              <Button variant="secondary" icon="pin" onPress={() => setFixing(true)}>
                Corregir ubicación
              </Button>
              {cityId ? (
                <Button
                  variant="ghost"
                  onPress={() => router.push({ pathname: '/city/[id]', params: { id: cityId } })}
                >
                  {`Ver ${cityName(cityId)}`}
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  onPress={() =>
                    router.push({
                      pathname: '/country/[code]',
                      params: { code: current.countryCode },
                    })
                  }
                >
                  {`Ver ${countryName(current.countryCode)}`}
                </Button>
              )}
              <Button variant="ghost" icon="eyeOff" onPress={() => setConfirmHide(true)}>
                Ocultar de Atlas
              </Button>
              <Text style={styles.hint}>Ocultar no borra la foto de tu carrete.</Text>
            </View>
          </ScrollView>
        ) : null}
      </SafeAreaView>

      {/* M3.7b · Confirmar ocultar */}
      <Modal
        visible={confirmHide}
        transparent
        animationType="slide"
        onRequestClose={() => setConfirmHide(false)}
      >
        <Pressable
          style={styles.scrim}
          onPress={() => setConfirmHide(false)}
          aria-label="Cancelar"
        />
        <SafeAreaView edges={['bottom']} style={styles.confirm} role="dialog">
          <Text role="heading" style={styles.title}>
            ¿Ocultar esta foto?
          </Text>
          <Text style={styles.body}>
            Deja de salir en tu mapa, en tus viajes y al compartir. No se borra de tu carrete. Si es
            la única de un lugar, ese lugar vuelve a la niebla. La recuperas en Ajustes, Fotos y
            almacenamiento.
          </Text>
          <Button
            block
            onPress={() => {
              if (current) void hidePhotos([current.photoId]);
              setConfirmHide(false);
              if (photos.length <= 1) router.back();
            }}
          >
            Ocultar foto
          </Button>
          <Button block variant="ghost" onPress={() => setConfirmHide(false)}>
            Cancelar
          </Button>
        </SafeAreaView>
      </Modal>

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
  hint: { ...typography.dataS, color: colors.inkMuted },
  tripLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    minHeight: touchTarget,
    alignSelf: 'flex-start',
  },
  tripText: { ...typography.bodyStrong, color: colors.ink, textDecorationLine: 'underline' },
  scrim: { flex: 1, backgroundColor: colors.ink, opacity: 0.3 },
  confirm: {
    gap: spacing[3],
    padding: spacing[5],
    backgroundColor: colors.paperRaised,
    borderTopLeftRadius: radii.sm,
    borderTopRightRadius: radii.sm,
    boxShadow: shadows.sheet,
  },
});
