import type { StorybookConfig } from '@storybook/react-native-web-vite';

// Storybook web del design system (react-native-web): la documentación viva de Atlas.
// En desarrollo: `npm run storybook`. Cuando sea estable se publicará como web pública.
const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  framework: {
    name: '@storybook/react-native-web-vite',
    options: {},
  },
};

export default config;
