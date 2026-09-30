import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { focusRingStyle, useFocusRing } from '../../internal/useFocusRing';
import { colors, radii, spacing, touchTarget, typography } from '../../tokens';
import { Icon } from '../Icon/Icon';

export interface CheckboxProps {
  label: string;
  /** Estado inicial. */
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}

/** Casilla cuadrada en tinta, para listas de preparativos y selección de participantes. */
export function Checkbox({ label, checked = false, onChange }: CheckboxProps) {
  const [on, setOn] = useState(checked);
  const { focused, focusProps } = useFocusRing();
  return (
    <Pressable
      role="checkbox"
      aria-checked={on}
      aria-label={label}
      onPress={() => {
        setOn(!on);
        onChange?.(!on);
      }}
      {...focusProps}
      style={styles.row}
    >
      <View style={[styles.box, on && styles.boxOn, focused && focusRingStyle]}>
        {on ? <Icon name="check" size={16} strokeWidth={2.2} color={colors.onStamp} /> : null}
      </View>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing[3], minHeight: touchTarget },
  box: {
    width: 22,
    height: 22,
    borderWidth: 1,
    borderColor: colors.ink,
    borderRadius: radii.sm,
    backgroundColor: colors.paperRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxOn: { backgroundColor: colors.ink },
  label: { ...typography.body, color: colors.ink },
});
