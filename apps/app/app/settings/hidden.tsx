import {
  Button,
  EmptyState,
  Icon,
  colors,
  iconSizes,
  radii,
  spacing,
  typography,
} from '@atlas/design-system';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../components/Screen';
import { usePhotoLibrary } from '../../features/photos/store/PhotoLibraryProvider';
import { PhotoThumb } from '../../features/photos/ui/PhotoThumb';

const GAP = 3;
const COLUMNS = 4;

/** M3.7 · Fotos ocultas: elige cuáles vuelven a tu mapa. */
export default function HiddenScreen() {
  const { hidden, unhidePhotos } = usePhotoLibrary();
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
  const [width, setWidth] = useState(0);
  const cell = (width - GAP * (COLUMNS - 1)) / COLUMNS;
  const ids = [...hidden];

  const toggle = (id: string) =>
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  if (ids.length === 0) {
    return (
      <Screen title="Fotos ocultas" back>
        <EmptyState
          icon="photos"
          title="No tienes fotos ocultas"
          body="Desde el detalle de una foto puedes ocultarla: deja de contar en tu mapa, pero sigue en tu carrete."
        />
      </Screen>
    );
  }

  return (
    <Screen title="Fotos ocultas" back>
      <Text style={styles.body}>
        No cuentan en tu mapa, tus viajes ni tus tarjetas. Toca las que quieras recuperar.
      </Text>
      <View style={styles.grid} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
        {width > 0
          ? ids.map((id) => {
              const on = selected.has(id);
              return (
                <View key={id} style={{ width: cell, height: cell }}>
                  <PhotoThumb
                    id={id}
                    label={on ? 'Foto oculta, elegida para recuperar' : 'Foto oculta'}
                    style={[styles.fill, on && styles.selected]}
                    onPress={() => toggle(id)}
                  />
                  {on ? (
                    <View style={styles.badge} aria-hidden>
                      <Icon name="check" size={iconSizes.tag} color={colors.onStamp} />
                    </View>
                  ) : null}
                </View>
              );
            })
          : null}
      </View>
      <View style={styles.actions}>
        <Button
          icon="check"
          disabled={selected.size === 0}
          onPress={() => {
            void unhidePhotos([...selected]);
            setSelected(new Set());
          }}
        >
          {selected.size === 0
            ? 'Recuperar fotos'
            : `Recuperar ${selected.size} ${selected.size === 1 ? 'foto' : 'fotos'}`}
        </Button>
        <Button variant="ghost" onPress={() => void unhidePhotos(ids)}>
          Recuperar todas
        </Button>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { ...typography.bodyS, color: colors.inkMuted },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP },
  fill: { flex: 1 },
  selected: { opacity: 0.6, borderWidth: 2, borderColor: colors.stampBlue },
  badge: {
    position: 'absolute',
    right: spacing[1],
    bottom: spacing[1],
    width: spacing[5],
    height: spacing[5],
    borderRadius: radii.round,
    backgroundColor: colors.stampBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: { gap: spacing[2] },
});
