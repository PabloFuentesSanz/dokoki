import { defineConfig } from 'vitest/config';

// Tests de features (hooks, stores y UI) sobre react-native-web en jsdom, igual que el
// design system. La lógica pura va en @atlas/domain.
export default defineConfig({
  resolve: {
    alias: [{ find: /^react-native$/, replacement: 'react-native-web' }],
    mainFields: ['module', 'main'],
    extensions: ['.web.tsx', '.web.ts', '.web.js', '.tsx', '.ts', '.mjs', '.js', '.json'],
  },
  define: { __DEV__: 'false' },
  test: {
    environment: 'jsdom',
    include: ['features/**/*.test.{ts,tsx}'],
    server: { deps: { inline: ['react-native-svg', 'react-native-web'] } },
  },
});
