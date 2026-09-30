# map: M1 · Mapa y M2 · Exploración

Mapa mundi con niebla, capas y leyenda, viaje en el tiempo, fichas de país, región y ciudad, búsqueda, progreso y pasaporte de sellos.

**Diseño:** Tandas 2 y 5 del lienzo [Atlas — MVP](https://claude.ai/artifact/2d9Ggi2rw3FK7GCvCXwUSC).

## Pantallas

- M1.1 Mapa mundi (+ zoom país/región)
- M1.2 Capas y leyenda
- M1.3 Viaje en el tiempo
- M1.4 Ficha de país (+ marcar a mano)
- M1.5 Ficha de región
- M1.6 Ficha de ciudad
- M1.8 Búsqueda
- M2.1 Tu progreso
- M2.2 Pasaporte

## Historias de usuario

HU-08, HU-09, HU-10, HU-11, HU-12, HU-13, HU-14, HU-15 (ver `docs/spec.md`, sección 12).

## Notas

- El mapa se pinta con `AtlasMap` de `@atlas/map`; la niebla sale de `computeUnlockState` y `buildFogLayer` de `@atlas/domain/fog`.

## Estructura

- `ui/`: pantallas y piezas de la feature (solo componentes de `@atlas/design-system`).
- `hooks/`: hooks de React que conectan UI con servicios y store.
- `services/`: acceso a dispositivo y red (expo-media-library, expo-sqlite, Supabase).
- `store/`: estado local offline-first.
- `tests/`: tests de la feature (Vitest). Primero el test, luego el código.
