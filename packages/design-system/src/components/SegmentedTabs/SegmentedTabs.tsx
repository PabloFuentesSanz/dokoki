import { Pressable, StyleSheet, Text, View } from 'react-native';
import { focusRingStyle, useFocusRing } from '../../internal/useFocusRing';
import { colors, radii, touchTarget, typography } from '../../tokens';

export interface SegmentedTabsProps<T extends string> {
  /** Nombre accesible del grupo ("Ver fotos"). */
  label: string;
  options: readonly { value: T; label: string }[];
  value: T;
  onChange?: (value: T) => void;
}

function Segment({
  label,
  selected,
  first,
  onPress,
}: {
  label: string;
  selected: boolean;
  first: boolean;
  onPress: () => void;
}) {
  const { focused, focusProps } = useFocusRing();
  return (
    <Pressable
      role="tab"
      aria-selected={selected}
      aria-label={label}
      onPress={onPress}
      {...focusProps}
      style={[
        styles.segment,
        !first && styles.divider,
        selected && styles.selected,
        focused && focusRingStyle,
      ]}
    >
      <Text style={[styles.text, selected && styles.textSelected]}>{label}</Text>
    </Pressable>
  );
}

/** Pestañas segmentadas en tinta: la elegida se rellena (también en negrita, no solo color). */
export function SegmentedTabs<T extends string>({
  label,
  options,
  value,
  onChange,
}: SegmentedTabsProps<T>) {
  return (
    <View role="tablist" aria-label={label} style={styles.bar}>
      {options.map((o, i) => (
        <Segment
          key={o.value}
          label={o.label}
          selected={o.value === value}
          first={i === 0}
          onPress={() => onChange?.(o.value)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.ink,
    borderRadius: radii.sm,
    overflow: 'hidden',
  },
  segment: {
    flex: 1,
    minHeight: touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  divider: { borderLeftWidth: 1, borderLeftColor: colors.ink },
  selected: { backgroundColor: colors.ink },
  text: { ...typography.bodyS, color: colors.ink },
  textSelected: { fontFamily: typography.bodyStrong.fontFamily, color: colors.onStamp },
});
