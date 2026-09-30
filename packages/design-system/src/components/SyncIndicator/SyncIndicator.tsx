import { StyleSheet, Text, View } from 'react-native';
import { colors, typography } from '../../tokens';
import { Icon, type IconName } from '../Icon/Icon';

export type SyncState = 'synced' | 'pending' | 'offline';

export interface SyncIndicatorProps {
  state?: SyncState;
  /** Sustituye al texto por defecto. */
  label?: string;
}

const STATES: Record<SyncState, { icon: IconName; color: string; text: string }> = {
  synced: { icon: 'check', color: colors.oliveText, text: 'Todo guardado' },
  pending: { icon: 'sync', color: colors.ochre, text: 'Sincronizando' },
  offline: { icon: 'cloud', color: colors.inkMuted, text: 'Sin conexión, guardado en el móvil' },
};

/** Estado de guardado: offline-first, así que "sin conexión" nunca es un error. */
export function SyncIndicator({ state = 'synced', label }: SyncIndicatorProps) {
  const s = STATES[state];
  return (
    <View role="status" aria-live="polite" style={styles.row}>
      <Icon name={s.icon} size={16} color={s.color} />
      <Text style={[styles.text, { color: s.color }]}>{label ?? s.text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  text: { ...typography.data },
});
