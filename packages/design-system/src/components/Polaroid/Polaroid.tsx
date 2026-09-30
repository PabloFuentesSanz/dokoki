import { Image, StyleSheet, Text, View } from 'react-native';
import { colors, iconSizes, shadows, tilts, typography } from '../../tokens';
import { Coordinate } from '../Coordinate/Coordinate';
import { Icon } from '../Icon/Icon';

export interface PolaroidProps {
  /** Nombre del lugar. */
  caption: string;
  /** URI local de la foto (asset del carrete o miniatura); sin ella se ve el marcador. */
  src?: string;
  alt?: string;
  lat?: number;
  lng?: number;
  /** Celo: solo la foto destacada de cada bloque. */
  tape?: boolean;
  /** Inclinación: solo la destacada. */
  tilt?: 'none' | 'left' | 'right';
  /** 180 por defecto. */
  width?: number;
  /** Color del marcador sin foto. */
  tone?: string;
}

const TILT = { none: '0deg', left: tilts.photoL, right: tilts.photoR } as const;

/**
 * Foto con marco blanco, sombra de papel y, en la destacada, celo e inclinación.
 * En rejillas de galería, fotos rectas sin marco: si todo está torcido nada destaca.
 */
export function Polaroid({
  caption,
  src,
  alt,
  lat,
  lng,
  tape = false,
  tilt = 'none',
  width = 180,
  tone,
}: PolaroidProps) {
  const imageHeight = Math.round(width * (140 / 180));
  return (
    <View style={[styles.frame, { width, transform: [{ rotate: TILT[tilt] }] }]}>
      {tape ? (
        <View
          aria-hidden
          style={[styles.tape, { transform: [{ rotate: tilt === 'right' ? '5deg' : '-4deg' }] }]}
        />
      ) : null}
      <View
        style={[styles.image, { height: imageHeight }, tone ? { backgroundColor: tone } : null]}
      >
        {src ? (
          <Image
            source={{ uri: src }}
            aria-label={alt ?? caption}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
        ) : (
          <>
            <Icon name="photos" size={iconSizes.button} label={`Foto de ${caption}`} />
            {lat !== undefined && lng !== undefined ? (
              <Coordinate lat={lat} lng={lng} color={colors.ink} />
            ) : null}
          </>
        )}
      </View>
      <Text style={styles.caption}>{caption}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    gap: 6,
    paddingTop: 8,
    paddingHorizontal: 8,
    paddingBottom: 10,
    backgroundColor: colors.paperPhoto,
    boxShadow: shadows.photo,
  },
  tape: {
    position: 'absolute',
    top: -9,
    left: '50%',
    marginLeft: -32,
    width: 64,
    height: 18,
    zIndex: 1,
    backgroundColor: colors.tape,
    opacity: 0.85,
  },
  image: {
    backgroundColor: colors.landVisited,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    padding: 6,
    overflow: 'hidden',
  },
  caption: { ...typography.bodyStrong, fontSize: 14, lineHeight: 18, color: colors.ink },
});
