import { Caveat_500Medium } from '@expo-google-fonts/caveat';
import { CourierPrime_400Regular, CourierPrime_700Bold } from '@expo-google-fonts/courier-prime';
import {
  LibreCaslonText_400Regular,
  LibreCaslonText_700Bold,
} from '@expo-google-fonts/libre-caslon-text';
import { colors, fontFaces } from '@atlas/design-system';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PhotoLibraryProvider } from '../features/photos/store/PhotoLibraryProvider';
import { SettingsProvider } from '../features/settings/store/SettingsProvider';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // Los nombres coinciden con fontFaces del design system: el peso va en la fuente.
  const [loaded, error] = useFonts({
    [fontFaces.serif['400']]: LibreCaslonText_400Regular,
    [fontFaces.serif['700']]: LibreCaslonText_700Bold,
    [fontFaces.mono['400']]: CourierPrime_400Regular,
    [fontFaces.mono['700']]: CourierPrime_700Bold,
    [fontFaces.hand['500']]: Caveat_500Medium,
  });

  useEffect(() => {
    if (loaded || error) void SplashScreen.hideAsync();
  }, [loaded, error]);

  if (!loaded && !error) return null;

  return (
    <SafeAreaProvider>
      {/* Solo modo claro: barra de estado oscura sobre papel. */}
      <StatusBar style="dark" />
      <SettingsProvider>
        <PhotoLibraryProvider>
          <Stack
            screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.paper } }}
          />
        </PhotoLibraryProvider>
      </SettingsProvider>
    </SafeAreaProvider>
  );
}
