import { Button, colors, spacing, typography } from '@atlas/design-system';
import type { PlaceAssignment } from '@atlas/domain';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { photoLabel } from './photoLabel';
import { PhotoThumb } from './PhotoThumb';

const GAP = 3;
const COLUMNS = 4;
const SHOWN = 8;

interface PhotoPreviewProps {
  /** Fotos del ámbito, las más recientes primero. */
  photos: readonly PlaceAssignment[];
  /** Ámbito de la galería completa (`country:JP`, `trip:<id>`). */
  scope: string;
}

/** Avance de fotos en fichas de país y viaje: dos filas de miniaturas y el enlace a la galería. */
export function PhotoPreview({ photos, scope }: PhotoPreviewProps) {
  const [width, setWidth] = useState(0);
  const cell = (width - GAP * (COLUMNS - 1)) / COLUMNS;
  if (photos.length === 0) return null;
  return (
    <View style={styles.wrap}>
      <Text role="heading" style={styles.heading}>
        Tus fotos
      </Text>
      <View style={styles.grid} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
        {width > 0
          ? photos
              .slice(0, SHOWN)
              .map((p) => (
                <PhotoThumb
                  key={p.photoId}
                  id={p.photoId}
                  label={photoLabel(p.takenAt)}
                  style={{ width: cell, height: cell }}
                  onPress={() =>
                    router.push({ pathname: '/photo/[id]', params: { id: p.photoId, scope } })
                  }
                />
              ))
          : null}
      </View>
      <Button
        variant="secondary"
        icon="photos"
        onPress={() => router.push({ pathname: '/gallery', params: { scope } })}
      >
        {`Ver ${photos.length === 1 ? 'la foto' : `las ${photos.length.toLocaleString('es-ES')} fotos`}`}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing[3] },
  heading: { ...typography.heading, color: colors.ink },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP },
});
