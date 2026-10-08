import {
  Breadcrumbs,
  Button,
  Tag,
  EmptyState,
  ProgressBar,
  Reveal,
  colors,
  spacing,
  typography,
} from '@atlas/design-system';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../components/Screen';
import { cityName } from '../../features/map/services/cities';
import { continentName, countryName } from '../../features/map/services/countries';
import { citiesInRegion } from '../../features/map/services/regionCities';
import { regionCountry, regionName } from '../../features/map/services/regions';
import { useGallery } from '../../features/photos/hooks/useGallery';
import { photoDays } from '../../features/photos/services/photoDays';
import { PhotoPreview } from '../../features/photos/ui/PhotoPreview';
import { PlaceRow } from '../../features/map/ui/PlaceRow';
import { MarkSheet } from '../../features/map/ui/MarkSheet';
import { useUnlockState } from '../../features/map/hooks/useUnlockState';
import { addMark, removeMark, yearToDate } from '../../features/settings/services/marks';
import { useSettings } from '../../features/settings/store/SettingsProvider';

/** Ciudades principales que cuentan para el progreso de una región. */
const MAIN_CITIES = 6;

/** M1.5 · Ficha de región: tus ciudades, las principales que te faltan y tus fotos. */
export default function RegionScreen() {
  const { id = '' } = useLocalSearchParams<{ id: string }>();
  const country = regionCountry(id) ?? '';
  const name = regionName(id);
  const { photos } = useGallery(`region:${id}`);
  const { state } = useUnlockState();
  const { marks, saveMarks } = useSettings();
  const [marking, setMarking] = useState(false);
  const entry = state.regions[id];

  const visited = useMemo(() => {
    const byCity = new Map<string, { takenAt: number }[]>();
    for (const p of photos) {
      if (p.cityId === null) continue;
      const list = byCity.get(p.cityId) ?? [];
      list.push(p);
      byCity.set(p.cityId, list);
    }
    return [...byCity]
      .map(([cityId, list]) => ({ cityId, count: list.length, days: photoDays(list) }))
      .sort((a, b) => b.count - a.count);
  }, [photos]);

  const main = citiesInRegion(id).slice(0, MAIN_CITIES);
  const visitedIds = new Set(visited.map((v) => v.cityId));
  const mainVisited = main.filter((c) => visitedIds.has(c.id)).length;
  const pending = main.filter((c) => !visitedIds.has(c.id));

  return (
    <Screen
      title={name}
      titleStyle="display"
      back
      eyebrow={
        <Breadcrumbs
          items={[continentName(country), countryName(country), name]}
          onNavigate={(i) => {
            if (i === 1) router.push({ pathname: '/country/[code]', params: { code: country } });
          }}
        />
      }
    >
      {main.length > 0 ? (
        <Reveal>
          <ProgressBar
            label="Ciudades principales"
            value={(mainVisited / main.length) * 100}
            detail={`${mainVisited} de ${main.length} ciudades principales`}
          />
        </Reveal>
      ) : null}

      {entry?.source === 'manual' ? (
        <View style={styles.manual}>
          <Tag tone="settled">Marcada a mano</Tag>
          <Button
            size="sm"
            variant="ghost"
            onPress={() => void saveMarks(removeMark(marks, `region:${id}`))}
          >
            Quitar marca
          </Button>
        </View>
      ) : !entry ? (
        <Button variant="secondary" icon="check" onPress={() => setMarking(true)}>
          Ya estuve: marcar a mano
        </Button>
      ) : null}
      <MarkSheet
        visible={marking}
        place={name}
        onClose={() => setMarking(false)}
        onMark={(year) => {
          void saveMarks(
            addMark(marks, {
              level: 'region',
              countryCode: country,
              regionId: id,
              visitedAt: yearToDate(year),
            }),
          );
          setMarking(false);
        }}
      />

      {visited.length === 0 && pending.length === 0 ? (
        <EmptyState
          icon="compass"
          title={`Aún no hay fotos en ${name}`}
          body="Cuando viajes por aquí, sus ciudades se desbloquearán solas."
        />
      ) : (
        <View style={styles.block}>
          <Text role="heading" style={styles.heading}>
            Ciudades
          </Text>
          {visited.map((v, i) => (
            <Reveal key={v.cityId} delay={Math.min(i, 6) * 50}>
              <PlaceRow
                name={cityName(v.cityId)}
                meta={`${v.count} fotos, ${v.days} ${v.days === 1 ? 'día' : 'días'}`}
                visited
                feminine
                onPress={() => router.push({ pathname: '/city/[id]', params: { id: v.cityId } })}
              />
            </Reveal>
          ))}
          {pending.map((c) => (
            <PlaceRow
              key={c.id}
              name={c.name}
              meta={`${c.population.toLocaleString('es-ES')} habitantes`}
              visited={false}
              feminine
              onPress={() => router.push({ pathname: '/city/[id]', params: { id: c.id } })}
            />
          ))}
        </View>
      )}

      <PhotoPreview photos={photos} scope={`region:${id}`} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  block: { gap: spacing[1] },
  manual: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  heading: { ...typography.heading, color: colors.ink },
});
