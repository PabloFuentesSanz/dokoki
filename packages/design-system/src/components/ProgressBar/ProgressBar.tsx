import { useEffect } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { easeOut, useAnimatedValue, useReducedMotion } from '../../internal/motion';
import { colors, typography } from '../../tokens';

const FILL_MS = 700;

export interface ProgressBarProps {
  label: string;
  /** 0–100. */
  value: number;
  /** Línea a máquina bajo la barra. */
  detail?: string;
}

/** Progreso de desbloqueo: pista discontinua que se rellena de rojo. */
export function ProgressBar({ label, value, detail }: ProgressBarProps) {
  const pct = Math.round(Math.max(0, Math.min(100, value)));
  const reduced = useReducedMotion();
  // La tinta avanza hasta el valor: al abrir la pantalla y cada vez que cambia.
  const fill = useAnimatedValue(0);
  useEffect(() => {
    const animation = Animated.timing(fill, {
      toValue: pct,
      duration: reduced ? 0 : FILL_MS,
      easing: easeOut,
      // Anima el ancho: no admite el driver nativo.
      useNativeDriver: false,
    });
    animation.start();
    return () => animation.stop();
  }, [fill, pct, reduced]);
  const width = fill.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] });
  return (
    <View style={styles.wrap}>
      <View style={styles.head}>
        <Text style={styles.headText}>{label}</Text>
        <Text style={styles.headText}>{`${pct} %`}</Text>
      </View>
      <View
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        style={styles.track}
      >
        <Animated.View style={[styles.fill, { width }]} />
      </View>
      {detail ? <Text style={styles.detail}>{detail}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6, minWidth: 260 },
  head: { flexDirection: 'row', justifyContent: 'space-between' },
  headText: { ...typography.data, color: colors.ink },
  track: {
    height: 10,
    backgroundColor: colors.paperSunk,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.ink,
  },
  fill: { position: 'absolute', left: -1, top: -1, bottom: -1, backgroundColor: colors.stampRed },
  detail: { ...typography.dataS, color: colors.inkMuted },
});
