# Atlas

App de viajes con un mapa del mundo propio que se desbloquea con tus fotos. Un solo código para
iOS, Android y web: Expo (React Native) + TypeScript + Turborepo + Supabase + MapLibre.

- Contexto completo y reglas del proyecto: [`CLAUDE.md`](CLAUDE.md)
- Producto: [`docs/spec.md`](docs/spec.md) · Stack: [`docs/stack.md`](docs/stack.md) ·
  Design system: [`docs/design-system.md`](docs/design-system.md)

## Estructura

| Carpeta                  | Qué hay                                                                       |
| ------------------------ | ----------------------------------------------------------------------------- |
| `apps/app`               | La app Expo (Expo Router): iOS, Android y web                                 |
| `packages/design-system` | "Cuaderno de explorador": tokens y 34 componentes React Native, con Storybook |
| `packages/domain`        | Lógica pura: fotos → lugares, detección de viajes, niebla, gastos             |
| `packages/map`           | `AtlasMap`: MapLibre nativo y web detrás de una sola interfaz                 |
| `docs`                   | Especificación, stack, design system y capturas de pantallas                  |

## Empezar

Necesitas Node 24 (`nvm use`).

```bash
npm ci
npm run check        # lint + tipos + tests de todo el monorepo
npm run storybook    # design system en http://localhost:6006
```

La app usa MapLibre nativo, así que necesita un development build (no funciona en Expo Go):

```bash
cd apps/app
npm run ios          # o: npm run android · npm run web
```

Para los builds de EAS: `npx eas-cli init` en `apps/app` (añade el `projectId` a `app.json`) y crea el
secreto `EXPO_TOKEN` en GitHub. El identificador de la app es `com.pablofuentes.dokoki` (iOS y Android).
