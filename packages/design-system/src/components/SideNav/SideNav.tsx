import { Pressable, StyleSheet, Text, View } from 'react-native';
import { focusRingStyle, useFocusRing } from '../../internal/useFocusRing';
import { colors, radii, spacing, touchTarget, typography } from '../../tokens';
import { NAV_ITEMS, type NavTab } from '../BottomNav/BottomNav';
import { Button } from '../Button/Button';
import { Icon } from '../Icon/Icon';

export interface SideNavProps {
  active: NavTab;
  onNavigate?: (tab: NavTab) => void;
  onCapture?: () => void;
}

function SideItem({
  label,
  icon,
  active,
  onPress,
}: {
  label: string;
  icon: (typeof NAV_ITEMS)[number]['icon'];
  active: boolean;
  onPress: () => void;
}) {
  const { focused, focusProps } = useFocusRing();
  return (
    <Pressable
      role="tab"
      aria-selected={active}
      aria-label={label}
      onPress={onPress}
      {...focusProps}
      style={({ pressed }) => [
        styles.item,
        (active || pressed) && styles.itemActive,
        focused && focusRingStyle,
      ]}
    >
      <Icon name={icon} size={20} color={active ? colors.ink : colors.inkMuted} />
      <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
    </Pressable>
  );
}

/** Barra lateral de tablet y escritorio (≥ 600 px) con las mismas secciones y el botón Captura. */
export function SideNav({ active, onNavigate, onCapture }: SideNavProps) {
  return (
    <View style={styles.side}>
      <Text role="heading" style={styles.logo}>
        Atlas
      </Text>
      <View role="tablist" aria-label="Principal" style={styles.list}>
        {NAV_ITEMS.map((item) => (
          <SideItem
            key={item.tab}
            label={item.label}
            icon={item.icon}
            active={item.tab === active}
            onPress={() => onNavigate?.(item.tab)}
          />
        ))}
      </View>
      <Button icon="plus" block onPress={onCapture}>
        Captura
      </Button>
      <Text style={styles.foot}>{'Buscar  /    Comandos  ⌘K'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  side: {
    width: 232,
    flexGrow: 1,
    gap: spacing[5],
    padding: spacing[5],
    backgroundColor: colors.paper,
    borderRightWidth: 1,
    borderRightColor: colors.ink,
  },
  logo: {
    fontFamily: typography.title.fontFamily,
    fontSize: 26,
    lineHeight: 30,
    color: colors.ink,
  },
  list: { gap: 4 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingHorizontal: spacing[3],
    height: touchTarget,
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: radii.sm,
  },
  itemActive: { backgroundColor: colors.paperRaised, borderColor: colors.ink },
  label: { ...typography.body, lineHeight: 22, color: colors.inkMuted },
  labelActive: { fontFamily: typography.bodyStrong.fontFamily, color: colors.ink },
  foot: { ...typography.dataS, color: colors.inkMuted, marginTop: 'auto' },
});
