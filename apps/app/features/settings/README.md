# settings: M10 · Perfil y ajustes

Ajustes, privacidad, fotos y almacenamiento, general y tus datos (exportar y borrar cuenta).

**Diseño:** Tanda 4 del lienzo [Atlas — MVP](https://claude.ai/artifact/2d9Ggi2rw3FK7GCvCXwUSC).

## Pantallas

- M10.0 Ajustes
- M10.2 Privacidad
- M10.3 Fotos y almacenamiento
- M10.5 General
- M10.7 Tus datos (+ confirmar borrado)

## Historias de usuario

HU-27, HU-28, HU-29 (ver `docs/spec.md`, sección 12).

## Notas

- Todo cambio se aplica sin reiniciar. Borrar la cuenta elimina datos y miniaturas de la nube en menos de 30 días.

## Estructura

- `ui/`: pantallas y piezas de la feature (solo componentes de `@atlas/design-system`).
- `hooks/`: hooks de React que conectan UI con servicios y store.
- `tests/`: tests de la feature (Vitest). Primero el test, luego el código.
