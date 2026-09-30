# sharing: M8 · Compartir

Crear tarjeta (historia 9:16 y post 4:5) y compartirla fuera (Instagram, WhatsApp, hoja del sistema).

**Diseño:** Tanda 4 del lienzo [Atlas — MVP](https://claude.ai/artifact/2d9Ggi2rw3FK7GCvCXwUSC).

## Pantallas

- M8.4 Crear tarjeta
- M8.5 Compartir fuera

## Historias de usuario

HU-25, HU-26, HU-27 (ver `docs/spec.md`, sección 12).

## Notas

- Por defecto las tarjetas muestran ciudad y país, nunca coordenadas ni la base, y las imágenes exportadas no llevan metadatos de ubicación.

## Estructura

- `ui/`: pantallas y piezas de la feature (solo componentes de `@atlas/design-system`).
- `hooks/`: hooks de React que conectan UI con servicios y store.
- `tests/`: tests de la feature (Vitest). Primero el test, luego el código.
