import { useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { colors, spacing, touchTarget, typography } from '../../tokens';

export interface ToggleProps {
  label: string;
  /** Estado inicial. */
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}

/**
 * Interruptor que pasa de papel hundido a oliva al activarse.
 * Solo para ajustes de efecto inmediato; si hay que pulsar Guardar después, usa Checkbox.
 */
export function Toggle({ label, checked = false, onChange }: ToggleProps) {
  const [on, setOn] = useState(checked);
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Switch
        aria-label={label}
        value={on}
        onValueChange={(next) => {
          setOn(next);
          onChange?.(next);
        }}
        trackColor={{ false: colors.paperSunk, true: colors.olive }}
        thumbColor={on ? colors.onStamp : colors.ink}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[3],
    minHeight: touchTarget,
  },
  label: { ...typography.body, color: colors.ink, flexShrink: 1 },
});
