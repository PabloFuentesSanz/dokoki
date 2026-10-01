import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle, Defs, Pattern, Rect } from 'react-native-svg';
import { colors } from '../../tokens';

export interface PaperProps {
  /** paper: fondo de pantalla. raised: hojas y tarjetas. */
  tone?: 'paper' | 'raised';
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}

const TILE = 160;
const DOTS = 320;

/** Puntos de la tesela de grano, siempre los mismos (generador congruente con semilla fija). */
export function grainDots(): { x: number; y: number; r: number; o: number }[] {
  let seed = 7;
  const next = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  return Array.from({ length: DOTS }, () => ({
    x: next() * TILE,
    y: next() * TILE,
    r: 0.3 + next() * 0.5,
    o: 0.03 + next() * 0.05,
  }));
}

const DOTS_IN_TILE = grainDots();

/**
 * Papel del cuaderno: color de fondo y un grano muy suave (la clase `at-paper` del artefacto).
 * El grano es una tesela de puntos repetida, sin imágenes, igual en iOS, Android y web.
 */
export function Paper({ tone = 'paper', style, children }: PaperProps) {
  return (
    <View
      style={[
        styles.base,
        { backgroundColor: tone === 'raised' ? colors.paperRaised : colors.paper },
        style,
      ]}
    >
      <View pointerEvents="none" style={styles.grain}>
        <Svg width="100%" height="100%" aria-hidden>
          <Defs>
            <Pattern id="atlas-grain" width={TILE} height={TILE} patternUnits="userSpaceOnUse">
              {DOTS_IN_TILE.map((d, i) => (
                <Circle key={i} cx={d.x} cy={d.y} r={d.r} fill={colors.ink} opacity={d.o} />
              ))}
            </Pattern>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#atlas-grain)" />
        </Svg>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: { flex: 1, overflow: 'hidden' },
  grain: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
});
