import {
  Button,
  EmptyState,
  SyncIndicator,
  TextField,
  colors,
  radii,
  spacing,
  typography,
} from '@atlas/design-system';
import { useLocalSearchParams } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { Screen } from '../components/Screen';
import { useUnlockState } from '../features/map/hooks/useUnlockState';
import { cityName } from '../features/map/services/cities';
import { countryName } from '../features/map/services/countries';
import { thumbnailUri } from '../features/photos/services/thumbnails';
import { usePhotoLibrary } from '../features/photos/store/PhotoLibraryProvider';
import {
  CARD_FORMATS,
  previewSize,
  type CardFormat,
  type CardTemplate,
} from '../features/sharing/services/cardFormats';
import {
  canShareImages,
  captureCard,
  saveImage,
  shareImage,
} from '../features/sharing/services/shareImage';
import { stampDate } from '../features/sharing/services/stampDate';
import { ShareCard, type CardStamp } from '../features/sharing/ui/ShareCard';
import { tripMeta, useTrips } from '../features/trips/hooks/useTrips';

interface CardContent {
  title: string;
  meta: string;
  places: string[];
  stamps: CardStamp[];
  /** Fotos entre las que elegir portada. */
  photoIds: string[];
}

const FORMATS: readonly CardFormat[] = ['story', 'post'];

const TEMPLATES: { id: CardTemplate; label: string }[] = [
  { id: 'postal', label: 'Postal' },
  { id: 'route', label: 'Ruta' },
  { id: 'passport', label: 'Pasaporte' },
];

/**
 * M8.4 · Crear tarjeta y M8.5 · Compartir fuera (HU-25, HU-26, HU-27).
 * Ruta: /share?kind=trip&id=… · /share?kind=country&id=JP · /share?kind=passport
 */
export default function ShareScreen() {
  const { kind = 'passport', id = '' } = useLocalSearchParams<{ kind?: string; id?: string }>();
  const { trips } = useTrips();
  const { state } = useUnlockState();
  const { assignments } = usePhotoLibrary();
  const { width } = useWindowDimensions();

  const content = useMemo<CardContent | null>(() => {
    if (kind === 'trip') {
      const trip = trips.find((t) => t.id === id);
      if (!trip) return null;
      return {
        title: trip.name,
        meta: tripMeta(trip),
        places: trip.cities.map((c) => c.cityName),
        stamps: trip.countryCodes.map((code) => ({
          kind: 'country',
          label: countryName(code),
          date: stampDate(trip.startAt),
        })),
        photoIds: trip.photoIds,
      };
    }
    if (kind === 'country') {
      const entry = state.countries[id];
      if (!entry) return null;
      const inCountry = assignments.filter((a) => a.countryCode === id);
      const cityIds = [...new Set(inCountry.flatMap((a) => (a.cityId ? [a.cityId] : [])))];
      const pct = state.regionPercentByCountry[id];
      return {
        title: countryName(id),
        meta: `${entry.photoCount} fotos${pct !== undefined ? `, ${pct} % de sus regiones` : ''}`,
        places: cityIds.map(cityName),
        stamps: [
          { kind: 'country', label: countryName(id), date: stampDate(entry.firstVisitedAt) },
        ],
        photoIds: inCountry.map((a) => a.photoId),
      };
    }
    const countries = Object.values(state.countries).sort(
      (a, b) => (a.firstVisitedAt ?? 0) - (b.firstVisitedAt ?? 0),
    );
    if (countries.length === 0) return null;
    return {
      title: 'Mi pasaporte',
      meta: `${countries.length} países, ${state.totals.cities} ciudades, ${String(state.worldPercent).replace('.', ',')} % del mundo`,
      places: countries.map((c) => countryName(c.id)),
      stamps: countries.map((c) => ({
        kind: 'country',
        label: countryName(c.id),
        date: stampDate(c.firstVisitedAt),
      })),
      photoIds: [],
    };
  }, [kind, id, trips, state, assignments]);

  const [template, setTemplate] = useState<CardTemplate>(
    kind === 'passport' ? 'passport' : 'postal',
  );
  const [format, setFormat] = useState<CardFormat>('story');
  const [title, setTitle] = useState<string | null>(null);
  const [coverId, setCoverId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const cardRef = useRef<View>(null);

  if (!content) {
    return (
      <Screen title="Compartir" back>
        <EmptyState
          icon="share"
          title="Aún no hay nada que compartir"
          body="Lee tus fotos y vuelve cuando tu mapa empiece a desbloquearse."
        />
      </Screen>
    );
  }

  const cover = coverId ?? content.photoIds[0];
  const size = previewSize(format, width - spacing[4] * 2);
  const exportSize = CARD_FORMATS[format];

  const run = async (action: 'share' | 'save') => {
    try {
      setStatus('Preparando la tarjeta…');
      const uri = await captureCard(cardRef, exportSize.width, exportSize.height);
      if (action === 'share') {
        await shareImage(uri);
        setStatus(null);
      } else {
        setStatus(
          (await saveImage(uri))
            ? 'Guardada en tu carrete'
            : 'Atlas necesita permiso para guardar en el carrete',
        );
      }
    } catch (error: unknown) {
      setStatus(
        `No se pudo crear la tarjeta: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  };

  return (
    <Screen title="Crear tarjeta" back>
      <View style={styles.row}>
        {TEMPLATES.map((t) => (
          <Button
            key={t.id}
            size="sm"
            variant={template === t.id ? 'primary' : 'secondary'}
            onPress={() => setTemplate(t.id)}
          >
            {t.label}
          </Button>
        ))}
      </View>
      <View style={styles.row}>
        {FORMATS.map((f) => (
          <Button
            key={f}
            size="sm"
            variant={format === f ? 'primary' : 'secondary'}
            onPress={() => setFormat(f)}
          >
            {CARD_FORMATS[f].label}
          </Button>
        ))}
      </View>
      <TextField label="Título" value={title ?? content.title} onChangeText={setTitle} />

      {template === 'postal' && content.photoIds.length > 0 ? (
        <View style={styles.block}>
          <Text style={styles.meta}>Foto de portada</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.row}
          >
            {content.photoIds.slice(0, 40).map((photoId) => (
              <Pressable
                key={photoId}
                role="button"
                aria-label="Usar esta foto de portada"
                aria-selected={photoId === cover}
                onPress={() => setCoverId(photoId)}
                style={[styles.thumbWrap, photoId === cover && styles.thumbSelected]}
              >
                <Image source={{ uri: thumbnailUri(photoId) }} style={styles.thumb} />
              </Pressable>
            ))}
          </ScrollView>
        </View>
      ) : null}

      <View style={styles.preview}>
        <ShareCard
          ref={cardRef}
          template={template}
          width={size.width}
          height={size.height}
          title={title ?? content.title}
          meta={content.meta}
          coverUri={cover ? thumbnailUri(cover) : undefined}
          places={content.places}
          stamps={content.stamps}
        />
      </View>

      <Text style={styles.meta}>
        Se comparte ciudad y país, nunca coordenadas. La imagen no lleva datos de ubicación.
      </Text>
      {status ? <SyncIndicator state="pending" label={status} /> : null}
      {canShareImages ? (
        <View style={styles.block}>
          <Button icon="share" block onPress={() => void run('share')}>
            Compartir
          </Button>
          <Button variant="secondary" block onPress={() => void run('save')}>
            Guardar en el carrete
          </Button>
        </View>
      ) : (
        <Text style={styles.meta}>Crea y comparte la tarjeta desde la app del móvil.</Text>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  block: { gap: spacing[2] },
  meta: { ...typography.data, color: colors.inkMuted },
  preview: {
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.ink,
    borderRadius: radii.none,
    alignSelf: 'center',
  },
  thumbWrap: { borderWidth: 2, borderColor: 'transparent' },
  thumbSelected: { borderColor: colors.stampRed },
  thumb: { width: 64, height: 64, backgroundColor: colors.paperSunk },
});
