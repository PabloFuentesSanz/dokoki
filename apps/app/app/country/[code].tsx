import {
  Breadcrumbs,
  Button,
  EmptyState,
  ProgressBar,
  Stamp,
  StatStrip,
  TripRow,
  colors,
  spacing,
  typography,
} from '@atlas/design-system';
import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../components/Screen';
import { useUnlockState } from '../../features/map/hooks/useUnlockState';
import { continentName, countryName } from '../../features/map/services/countries';
import { regionsOf } from '../../features/map/services/regions';
import { PlaceRow } from '../../features/map/ui/PlaceRow';
import { useGallery } from '../../features/photos/hooks/useGallery';
import { PhotoPreview } from '../../features/photos/ui/PhotoPreview';
import { tripMeta, useTrips } from '../../features/trips/hooks/useTrips';

const stampDate = (ms: number | null): string =>
  ms === null
    ? ''
    : new Date(ms)
        .toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
        .replace(/\//g, '.');

/**
 * M1.4 · Ficha de país. Tanda 2. Toque firma: el sello del país.
 * TODO(M1.4): ciudades, marcar a mano (M1.4c) y doble vista con mapa en escritorio.
 */
export default function CountryScreen() {
  const { code = '' } = useLocalSearchParams<{ code: string }>();
  const { state } = useUnlockState();
  const { trips } = useTrips();
  const gallery = useGallery(`country:${code}`);

  const name = countryName(code);
  const entry = state.countries[code];
  const regions = regionsOf(code);
  const visitedRegions = regions.filter((r) => r.id in state.regions);
  const pendingRegions = regions.filter((r) => !(r.id in state.regions));
  const regionPct = state.regionPercentByCountry[code] ?? 0;
  const countryTrips = trips.filter((t) => t.countryCodes.includes(code));
  const breadcrumbs = ['Mundo', continentName(code), name];

  return (
    <Screen
      title={name}
      titleStyle="display"
      back
      eyebrow={<Breadcrumbs items={breadcrumbs} onNavigate={() => router.navigate('/')} />}
    >
      {entry ? (
        <>
          <View style={styles.stamp}>
            <Stamp label={name} date={stampDate(entry.firstVisitedAt)} stampIn delay={200} />
          </View>
          <Button
            variant="secondary"
            icon="share"
            onPress={() =>
              router.push({ pathname: '/share', params: { kind: 'country', id: code } })
            }
          >
            {`Compartir ${name}`}
          </Button>
          <StatStrip
            stats={[
              { value: `${regionPct} %`, label: 'regiones' },
              {
                value: String(countryTrips.length),
                label: countryTrips.length === 1 ? 'viaje' : 'viajes',
              },
              { value: String(entry.photoCount), label: 'fotos' },
            ]}
          />
          {regions.length > 0 ? (
            <ProgressBar
              label="Regiones desbloqueadas"
              value={regionPct}
              detail={`${visitedRegions.length} de ${regions.length}`}
            />
          ) : null}

          <PhotoPreview photos={gallery.photos} scope={`country:${code}`} />

          {countryTrips.length > 0 ? (
            <View>
              <Text role="heading" style={styles.heading}>
                Tus viajes
              </Text>
              {countryTrips.map((trip, i) => (
                <TripRow
                  key={trip.id}
                  n={countryTrips.length - i}
                  title={trip.name}
                  meta={tripMeta(trip)}
                  onPress={() => router.push({ pathname: '/trip/[id]', params: { id: trip.id } })}
                />
              ))}
            </View>
          ) : null}

          {visitedRegions.length > 0 ? (
            <View style={styles.block}>
              <Text role="heading" style={styles.heading}>
                Dónde has estado
              </Text>
              {visitedRegions
                .map((r) => ({ ...r, photos: state.regions[r.id]?.photoCount ?? 0 }))
                .sort((a, b) => b.photos - a.photos)
                .map((r) => (
                  <PlaceRow
                    key={r.id}
                    name={r.name}
                    meta={`${r.photos.toLocaleString('es-ES')} ${r.photos === 1 ? 'foto' : 'fotos'}`}
                    visited
                    feminine
                    onPress={() => router.push({ pathname: '/region/[id]', params: { id: r.id } })}
                  />
                ))}
            </View>
          ) : null}

          {pendingRegions.length > 0 ? (
            <View style={styles.block}>
              <Text role="heading" style={styles.heading}>
                Por descubrir
              </Text>
              <Text style={styles.muted}>{pendingRegions.map((r) => r.name).join(', ')}</Text>
            </View>
          ) : null}
        </>
      ) : (
        <EmptyState
          icon="compass"
          title={`Aún no hay fotos de ${name}`}
          body="Cuando viajes, aparecerán aquí solas."
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  stamp: { alignItems: 'flex-end', marginTop: -spacing[8] },
  heading: { ...typography.heading, color: colors.ink, marginBottom: spacing[2] },
  block: { gap: spacing[1] },
  muted: { ...typography.bodyS, color: colors.inkMuted },
});
