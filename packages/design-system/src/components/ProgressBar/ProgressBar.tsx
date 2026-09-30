import { StyleSheet, Text, View } from 'react-native';
import { colors, typography } from '../../tokens';

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
        <View style={[styles.fill, { width: `${pct}%` }]} />
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
