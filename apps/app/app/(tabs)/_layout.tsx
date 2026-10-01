import { BottomNav, breakpoints, colors, SideNav, type NavTab } from '@atlas/design-system';
import { Tabs, type BottomTabBarProps } from 'expo-router/js-tabs';
import { useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** Ruta de cada sección (archivo en app/(tabs)). */
const ROUTE_BY_TAB: Record<NavTab, string> = {
  map: 'index',
  trips: 'trips',
  photos: 'photos',
  me: 'me',
};
const TAB_BY_ROUTE: Record<string, NavTab> = {
  index: 'map',
  trips: 'trips',
  photos: 'photos',
  me: 'me',
};

function NavBar({ state, navigation, wide }: BottomTabBarProps & { wide: boolean }) {
  const insets = useSafeAreaInsets();
  const active = TAB_BY_ROUTE[state.routes[state.index]?.name ?? 'index'] ?? 'map';
  const onNavigate = (tab: NavTab) => navigation.navigate(ROUTE_BY_TAB[tab]);
  // TODO(M6): la captura rápida (foto, nota, gasto o lugar) llega con el modo viaje.
  if (wide) {
    return (
      <View style={{ paddingTop: insets.top, backgroundColor: colors.paper }}>
        <SideNav active={active} onNavigate={onNavigate} />
      </View>
    );
  }
  return <BottomNav active={active} onNavigate={onNavigate} bottomInset={insets.bottom} />;
}

/** < 600 px: BottomNav. ≥ 600 px: SideNav a la izquierda con el contenido (y el mapa) a la derecha. */
export default function TabsLayout() {
  const { width } = useWindowDimensions();
  const wide = width >= breakpoints.sideNav;
  return (
    <Tabs
      tabBar={(props) => <NavBar {...props} wide={wide} />}
      screenOptions={{
        headerShown: false,
        tabBarPosition: wide ? 'left' : 'bottom',
        sceneStyle: { backgroundColor: colors.paper },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Mapa' }} />
      <Tabs.Screen name="trips" options={{ title: 'Viajes' }} />
      <Tabs.Screen name="photos" options={{ title: 'Fotos' }} />
      <Tabs.Screen name="me" options={{ title: 'Tú' }} />
    </Tabs>
  );
}
