# photos: M3 · Fotos

Galería por lugar y por tiempo, mapa de fotos, detalle y corrección de ubicación, bandeja sin ubicación, selección múltiple y estado de importación.

**Diseño:** Tandas 3 y 5 del lienzo [Atlas — MVP](https://claude.ai/artifact/2d9Ggi2rw3FK7GCvCXwUSC).

## Pantallas

- M3.1 Galería por lugar
- M3.2 Galería por tiempo
- M3.3 Mapa de fotos
- M3.4 Detalle de foto (+ corregir ubicación)
- M3.5 Sin ubicación
- M3.6 Revisión de viajes detectados
- M3.7 Selección múltiple (+ ocultar)
- M3.8 Estado de importación

## Historias de usuario

HU-05, HU-06, HU-07, HU-16, HU-17, HU-18, HU-19, HU-20 (ver `docs/spec.md`, sección 12).

## Notas

- Índice local en expo-sqlite; solo las miniaturas (sin EXIF) suben a Cloudflare R2.
- Ocultar nunca borra la foto del carrete.

## Estructura

- `ui/`: pantallas y piezas de la feature (solo componentes de `@atlas/design-system`).
- `hooks/`: hooks de React que conectan UI con servicios y store.
- `services/`: acceso a dispositivo y red (expo-media-library, expo-sqlite, Supabase).
- `store/`: estado local offline-first.
- `tests/`: tests de la feature (Vitest). Primero el test, luego el código.
