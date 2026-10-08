import { Button, colors, spacing, typography } from '@atlas/design-system';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Sheet } from '../../../components/Sheet';
import type { ClusterGroup } from '../hooks/useClusterGroup';
import { photoLabel } from './photoLabel';
import { PhotoThumb } from './PhotoThumb';

const GAP = 3;
const COLUMNS = 4;
const SHOWN = 8;

/** M3.3b · Grupo de fotos abierto desde el mapa: miniaturas y su ciudad. */
export function ClusterSheet({
  group,
  onClose,
}: {
  group: ClusterGroup | null;
  onClose: () => void;
}) {
  const [width, setWidth] = useState(0);
  const cell = (width - GAP * (COLUMNS - 1)) / COLUMNS;
  const scope = group?.cityId ? `city:${group.cityId}` : 'all';
  const go = (fn: () => void) => {
    onClose();
    fn();
  };
  return (
    <Sheet visible={group !== null} onClose={onClose} label={group?.title ?? 'Fotos'}>
      {group ? (
        <>
          <View>
            <Text role="heading" style={styles.title}>
              {group.title}
            </Text>
            <Text style={styles.meta}>{group.meta}</Text>
          </View>
          <View style={styles.grid} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
            {width > 0
              ? group.photos
                  .slice(0, SHOWN)
                  .map((p) => (
                    <PhotoThumb
                      key={p.photoId}
                      id={p.photoId}
                      label={photoLabel(p.takenAt)}
                      style={{ width: cell, height: cell }}
                      onPress={() =>
                        go(() =>
                          router.push({
                            pathname: '/photo/[id]',
                            params: { id: p.photoId, scope },
                          }),
                        )
                      }
                    />
                  ))
              : null}
          </View>
          {group.cityId ? (
            <View style={styles.actions}>
              <Button
                variant="secondary"
                onPress={() =>
                  go(() =>
                    router.push({ pathname: '/city/[id]', params: { id: group.cityId ?? '' } }),
                  )
                }
              >
                Ver ficha
              </Button>
              <Button
                variant="ghost"
                onPress={() => go(() => router.push({ pathname: '/gallery', params: { scope } }))}
              >
                {`Ver las ${group.photos.length.toLocaleString('es-ES')}`}
              </Button>
            </View>
          ) : null}
        </>
      ) : null}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.heading, color: colors.ink },
  meta: { ...typography.data, color: colors.inkMuted },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
});
