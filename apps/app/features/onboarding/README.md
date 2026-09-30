# onboarding: M0 · Arranque y cuenta

Portada, onboarding, registro (Apple, Google, enlace mágico), permisos, tu base e importación inicial del carrete.

**Diseño:** Tanda 1 del lienzo [Atlas — MVP](https://claude.ai/artifact/2d9Ggi2rw3FK7GCvCXwUSC).

## Pantallas

- M0.1 Portada
- M0.2 Onboarding (3 láminas)
- M0.3 Registro / login
- M0.4 Permisos
- M0.5 Tu base
- M0.6 Importación inicial
- M0.7 Primera revelación

## Historias de usuario

HU-01, HU-02, HU-03, HU-04, HU-05 (ver `docs/spec.md`, sección 12).

## Notas

- La importación usa `assignPhotosToBatch` de `@atlas/domain/photos` por lotes; las coordenadas nunca salen del móvil.
- Prueba técnica prioritaria: leer 15.000 fotos con expo-media-library en < 2 minutos (ver CLAUDE.md).

## Estructura

- `ui/`: pantallas y piezas de la feature (solo componentes de `@atlas/design-system`).
- `hooks/`: hooks de React que conectan UI con servicios y store.
- `tests/`: tests de la feature (Vitest). Primero el test, luego el código.
