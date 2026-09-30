import { defineConfig } from 'vitest/config';

// Los componentes se prueban sobre react-native-web en jsdom: mismo código que en iOS y
// Android, renderizado en DOM para poder consultarlo por rol y nombre accesible.
export default defineConfig({
  resolve: {
    alias: [{ find: /^react-native$/, replacement: 'react-native-web' }],
    mainFields: ['module', 'main'],
    extensions: ['.web.tsx', '.web.ts', '.web.js', '.tsx', '.ts', '.mjs', '.js', '.json'],
  },
  define: { __DEV__: 'false' },
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    server: { deps: { inline: ['react-native-svg', 'react-native-web'] } },
  },
});
