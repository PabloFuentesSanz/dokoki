# trips: M4 · Mis viajes

Lista de viajes detectados, detalle con ruta, días y notas, y editor (fusionar, dividir, renombrar).

**Diseño:** Tanda 3 del lienzo [Atlas — MVP](https://claude.ai/artifact/2d9Ggi2rw3FK7GCvCXwUSC).

## Pantallas

- M4.1 Lista de viajes
- M4.2 Detalle de viaje
- M4.4 Editar viaje

## Historias de usuario

HU-21, HU-22, HU-23, HU-24 (ver `docs/spec.md`, sección 12).

## Notas

- Detección con `detectTrips`, `mergeTrips` y `splitTrip` de `@atlas/domain/trips`. Lo corregido queda bloqueado.

## Estructura

- `ui/`: pantallas y piezas de la feature (solo componentes de `@atlas/design-system`).
- `hooks/`: hooks de React que conectan UI con servicios y store.
- `services/`: acceso a dispositivo y red (expo-media-library, expo-sqlite, Supabase).
- `store/`: estado local offline-first.
- `tests/`: tests de la feature (Vitest). Primero el test, luego el código.
