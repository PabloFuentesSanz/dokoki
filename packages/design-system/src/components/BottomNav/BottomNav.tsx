import { Pressable, StyleSheet, Text, View } from 'react-native';
import { focusRingStyle, useFocusRing } from '../../internal/useFocusRing';
import { colors, iconSizes, typography } from '../../tokens';
import { CaptureButton } from '../CaptureButton/CaptureButton';
import { Icon, type IconName } from '../Icon/Icon';

export type NavTab = 'map' | 'trips' | 'photos' | 'me';

/** Las cuatro secciones fijas; en la barra inferior la captura va en medio. */
export const NAV_ITEMS: readonly { tab: NavTab; icon: IconName; label: string }[] = [
  { tab: 'map', icon: 'map', label: 'Mapa' },
  { tab: 'trips', icon: 'trips', label: 'Viajes' },
  { tab: 'photos', icon: 'photos', label: 'Fotos' },
  { tab: 'me', icon: 'me', label: 'Tú' },
];

export interface BottomNavProps {
  active: NavTab;
  onNavigate?: (tab: NavTab) => void;
  /** Abre la hoja de captura. */
  onCapture?: () => void;
}

function NavItem({
  item,
  active,
  onPress,
}: {
  item: (typeof NAV_ITEMS)[number];
  active: boolean;
  onPress: () => void;
}) {
  const { focused, focusProps } = useFocusRing();
  const color = active ? colors.ink : colors.inkMuted;
  return (
    <Pressable
      role="tab"
      aria-selected={active}
      aria-label={item.label}
      onPress={onPress}
      {...focusProps}
      style={[styles.item, focused && focusRingStyle]}
    >
      <Icon name={item.icon} size={iconSizes.nav} strokeWidth={active ? 2 : 1.6} color={color} />
      <Text style={[styles.label, { color }, active && styles.labelActive]}>{item.label}</Text>
      <View style={[styles.mark, active && styles.markActive]} />
    </Pressable>
  );
}

/** Barra inferior de móvil (< 600 px): Mapa, Viajes, Captura, Fotos, Tú. */
export function BottomNav({ active, onNavigate, onCapture }: BottomNavProps) {
  const [first, second, third, fourth] = NAV_ITEMS;
  const render = (item: (typeof NAV_ITEMS)[number] | undefined) =>
    item ? (
      <NavItem
        key={item.tab}
        item={item}
        active={item.tab === active}
        onPress={() => onNavigate?.(item.tab)}
      />
    ) : null;
  return (
    <View role="tablist" aria-label="Principal" style={styles.bar}>
      {render(first)}
      {render(second)}
      <CaptureButton onPress={onCapture} />
      {render(third)}
      {render(fourth)}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    paddingHorizontal: 12,
    paddingBottom: 20,
    backgroundColor: colors.paperRaised,
    borderTopWidth: 1,
    borderTopColor: colors.ink,
  },
  item: { alignItems: 'center', gap: 3, minWidth: 56, minHeight: 48, paddingVertical: 4 },
  label: { ...typography.bodyS, fontSize: 12, lineHeight: 16 },
  labelActive: { fontFamily: typography.bodyStrong.fontFamily },
  mark: { height: 2, width: 18, backgroundColor: 'transparent' },
  markActive: { backgroundColor: colors.stampRed },
});
