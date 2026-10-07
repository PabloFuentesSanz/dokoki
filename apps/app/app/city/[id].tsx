import {
  Breadcrumbs,
  Button,
  EmptyState,
  Polaroid,
  Reveal,
  StatStrip,
  TripRow,
  colors,
  spacing,
  typography,
} from '@atlas/design-system';
import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../components/Screen';
import { cityById } from '../../features/map/services/cities';
import { continentName, countryName } from '../../features/map/services/countries';
import { regionOfCity } from '../../features/map/services/regionCities';
import { regionName } from '../../features/map/services/regions';
import { useGallery } from '../../features/photos/hooks/useGallery';
import { photoDays } from '../../features/photos/services/photoDays';
import { thumbnailUri } from '../../features/photos/services/thumbnails';
import { PhotoPreview } from '../../features/photos/ui/PhotoPreview';
import { tripMeta, useTrips } from '../../features/trips/hooks/useTrips';

const shortDate = (ms: number): string =>
  new Date(ms).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });

/**
 * M1.6 · Ficha de ciudad. Toque firma: tu foto más reciente de allí, con celo.
 * TODO(M1.6): lugares concretos (miradores, templos) cuando haya datos de lugares.
 */
export default function CityScreen() {
  const { id = '' } = useLocalSearchParams<{ id: string }>();
  const city = cityById(id);
  const { photos } = useGallery(`city:${id}`);
  const { trips } = useTrips();

  if (!city) {
    return (
      <Screen title="Ciudad" back>
        <EmptyState icon="compass" title="No encontramos esta ciudad" body="Prueba a buscarla." />
      </Screen>
    );
  }

  const region = regionOfCity(city);
  const crumbs = [
    continentName(city.country),
    countryName(city.country),
    ...(region ? [regionName(region)] : []),
    city.name,
  ];
  const cityTrips = trips.filter((t) => t.cities.some((c) => c.cityId === id));
  const cover = photos[0];

  return (
    <Screen
      title={city.name}
      titleStyle="display"
      back
      eyebrow={
        <Breadcrumbs
          items={crumbs}
          onNavigate={(i) => {
            if (i === 1)
              router.push({ pathname: '/country/[code]', params: { code: city.country } });
            if (i === 2 && region)
              router.push({ pathname: '/region/[id]', params: { id: region } });
          }}
        />
      }
    >
      {cover ? (
        <>
          <Reveal style={styles.polaroid}>
            <Polaroid
              src={thumbnailUri(cover.photoId)}
              alt={`Tu última foto en ${city.name}`}
              caption={`${city.name}, ${shortDate(cover.takenAt)}`}
              tape
              tilt="left"
              width={230}
            />
          </Reveal>
          <Reveal delay={80}>
            <StatStrip
              stats={[
                { value: photos.length.toLocaleString('es-ES'), label: 'fotos' },
                { value: String(photoDays(photos)), label: 'días' },
                {
                  value: String(cityTrips.length),
                  label: cityTrips.length === 1 ? 'viaje' : 'viajes',
                },
              ]}
            />
          </Reveal>
          <PhotoPreview photos={photos} scope={`city:${id}`} />
          {cityTrips.length > 0 ? (
            <View>
              <Text role="heading" style={styles.heading}>
                Tus viajes aquí
              </Text>
              {cityTrips.map((trip, i) => (
                <TripRow
                  key={trip.id}
                  n={cityTrips.length - i}
                  title={trip.name}
                  meta={tripMeta(trip)}
                  onPress={() => router.push({ pathname: '/trip/[id]', params: { id: trip.id } })}
                />
              ))}
            </View>
          ) : null}
        </>
      ) : (
        <>
          <EmptyState
            icon="compass"
            title={`${city.name} sigue bajo la niebla`}
            body="Cuando tengas fotos aquí, se desbloqueará sola. También puedes colocar aquí fotos sin ubicación."
          />
          <Button
            variant="secondary"
            onPress={() =>
              router.push({ pathname: '/country/[code]', params: { code: city.country } })
            }
          >
            {`Ver ${countryName(city.country)}`}
          </Button>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  polaroid: { alignItems: 'center', paddingVertical: spacing[3] },
  heading: { ...typography.heading, color: colors.ink, marginBottom: spacing[2] },
});
