import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, touchTarget, typography } from '../../tokens';

export interface TimeSliderProps {
  /** 2018 por defecto. */
  min?: number;
  max: number;
  /** Año inicial; `max` si no se indica. */
  value?: number;
  onChange?: (year: number) => void;
}

/**
 * Deslizador de años para ver cómo se fue desbloqueando el mapa (M1.3).
 * Cada año es un objetivo táctil de 44 px de alto; con lector de pantalla se ajusta con
 * las acciones estándar de incrementar y reducir.
 */
export function TimeSlider({ min = 2018, max, value, onChange }: TimeSliderProps) {
  const [year, setYear] = useState(value ?? max);
  const years = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  const select = (next: number) => {
    const clamped = Math.max(min, Math.min(max, next));
    setYear(clamped);
    onChange?.(clamped);
  };
  const position = max === min ? 1 : (year - min) / (max - min);

  return (
    <View style={styles.wrap}>
      <View style={styles.head}>
        <Text style={styles.caption}>Tu mapa hasta</Text>
        <Text style={styles.year}>{year}</Text>
      </View>
      <View
        role="slider"
        aria-label="Tu mapa hasta"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={year}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={(event) =>
          select(year + (event.nativeEvent.actionName === 'increment' ? 1 : -1))
        }
        style={styles.track}
      >
        <View aria-hidden style={styles.line} />
        <View aria-hidden style={[styles.thumb, { left: `${position * 100}%` }]} />
        <View style={styles.hits}>
          {years.map((y) => (
            <Pressable
              key={y}
              role="button"
              aria-label={`Año ${y}`}
              onPress={() => select(y)}
              style={styles.hit}
            />
          ))}
        </View>
      </View>
      <View aria-hidden style={styles.ticks}>
        {years
          .filter((y) => (y - min) % 2 === 0)
          .map((y) => (
            <Text key={y} style={styles.caption}>
              {y}
            </Text>
          ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6, minWidth: 300 },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  caption: { ...typography.dataS, color: colors.inkMuted },
  year: { ...typography.heading, color: colors.ink },
  track: { height: touchTarget, justifyContent: 'center', marginHorizontal: 11 },
  line: { height: 0, borderTopWidth: 2, borderStyle: 'dashed', borderTopColor: colors.ink },
  thumb: {
    position: 'absolute',
    marginLeft: -11,
    width: 22,
    height: 22,
    borderRadius: radii.round,
    backgroundColor: colors.stampRed,
    borderWidth: 2,
    borderColor: colors.paper,
  },
  hits: { position: 'absolute', top: 0, bottom: 0, left: -11, right: -11, flexDirection: 'row' },
  hit: { flex: 1, height: touchTarget },
  ticks: { flexDirection: 'row', justifyContent: 'space-between' },
});
