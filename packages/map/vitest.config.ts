import { defineConfig } from 'vitest/config';

// Solo lógica pura del mapa (capas, GeoJSON). Los motores nativo y web no se montan aquí.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
