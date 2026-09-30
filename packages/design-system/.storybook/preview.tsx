import type { Preview } from '@storybook/react-native-web-vite';
import { View } from 'react-native';
import caveat500 from '@expo-google-fonts/caveat/500Medium/Caveat_500Medium.ttf?url';
import courier400 from '@expo-google-fonts/courier-prime/400Regular/CourierPrime_400Regular.ttf?url';
import courier700 from '@expo-google-fonts/courier-prime/700Bold/CourierPrime_700Bold.ttf?url';
import caslon400 from '@expo-google-fonts/libre-caslon-text/400Regular/LibreCaslonText_400Regular.ttf?url';
import caslon700 from '@expo-google-fonts/libre-caslon-text/700Bold/LibreCaslonText_700Bold.ttf?url';
import { colors, fontFaces, spacing } from '../src/tokens';

// Registra las fuentes con los mismos nombres que usa expo-font en la app.
const FONT_FILES: [string, string][] = [
  [fontFaces.serif['400'], caslon400],
  [fontFaces.serif['700'], caslon700],
  [fontFaces.mono['400'], courier400],
  [fontFaces.mono['700'], courier700],
  [fontFaces.hand['500'], caveat500],
];
for (const [family, url] of FONT_FILES) {
  const face = new FontFace(family, `url(${url})`);
  document.fonts.add(face);
  void face.load();
}

document.body.style.backgroundColor = colors.paper;

const preview: Preview = {
  parameters: {
    layout: 'fullscreen',
    controls: { expanded: true },
  },
  decorators: [
    (Story) => (
      <View
        style={{ flex: 1, minHeight: '100%', padding: spacing[5], backgroundColor: colors.paper }}
      >
        <Story />
      </View>
    ),
  ],
};

export default preview;
