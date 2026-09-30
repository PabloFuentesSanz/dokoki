import { defineConfig } from 'vitest/config';

// Vitest puro: sin DOM, sin React Native. El dominio tiene que poder
// ejecutarse en cualquier entorno JS (app, web, worker de importación).
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/index.ts'],
      thresholds: { lines: 100, functions: 100, branches: 100, statements: 100 },
    },
  },
});
