# Stack y decisiones técnicas

Un solo código para iOS, Android y web. Todo lo que toca las fotos del usuario ocurre en el
dispositivo; la nube solo guarda identificadores de lugar, viajes y miniaturas sin metadatos.

> Cifras de planes gratuitos y precios tal como se revisaron en septiembre de 2026. Cambian a
> menudo: compruébalas antes de lanzar.

## Resumen

| Capa                      | Elección                                                                             | Por qué                                                                                                         |
| ------------------------- | ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| App                       | **Expo** (React Native, nueva arquitectura) + **Expo Router** + **react-native-web** | Un código para iOS, Android y web; rutas por archivos; builds en la nube con EAS                                |
| Monorepo                  | **Turborepo** + npm workspaces                                                       | Caché de tareas y paquetes compartidos (`design-system`, `domain`, `map`) sin publicar nada                     |
| Lenguaje                  | **TypeScript estricto**                                                              | Sin `any` ni `as unknown` (lo bloquea ESLint)                                                                   |
| Tests                     | **Vitest** (dominio puro en Node; componentes sobre react-native-web en jsdom)       | Rápido, un solo runner para todo                                                                                |
| Design system             | Paquete propio + **Storybook** (react-native-web-vite)                               | Documentación viva, pública cuando sea estable                                                                  |
| Backend                   | **Supabase**: Postgres + PostGIS, región **eu-west-1**                               | Auth, base de datos y API en uno; datos en la UE (RGPD)                                                         |
| Auth                      | **Supabase Auth**: Apple, Google y enlace mágico por email                           | Sin contraseñas (HU-02); el enlace caduca a los 15 min                                                          |
| Mapa                      | **MapLibre** + **OpenFreeMap** + estilo propio hecho en **Maputnik**                 | Open source, sin claves ni límites de cargas                                                                    |
| Fotos locales             | **expo-media-library** + **expo-sqlite**                                             | Lectura del carrete e índice local; el GPS nunca sale del dispositivo                                           |
| Miniaturas en la nube     | **Cloudflare R2**                                                                    | Sin coste de salida de datos (egress)                                                                           |
| Errores                   | **Sentry**, plan Developer                                                           | 5.000 errores/mes gratis                                                                                        |
| Analítica + feature flags | **PostHog**                                                                          | 1 M eventos/mes gratis; flags incluidos (sustituye a Unleash)                                                   |
| Web                       | **Cloudflare Pages**                                                                 | Gratis y con uso comercial permitido                                                                            |
| CI/CD                     | **GitHub Actions** + **EAS Build**                                                   | Lint, tipos y tests en cada PR; build de preview en PRs a `main`. EAS gratis: 15 builds iOS + 15 Android al mes |

## App: Expo + Expo Router + react-native-web

- `apps/app` es una única app Expo. Las rutas viven en `apps/app/app/` (Expo Router) y la lógica de
  cada módulo en `apps/app/features/<feature>/` (`ui`, `hooks`, `services`, `store`, `tests`).
- **Requiere development build** (`expo-dev-client`): MapLibre nativo no funciona en Expo Go.
  `npm run ios` / `npm run android` dentro de `apps/app`, o un build `development` de EAS.
- Navegación: `BottomNav` por debajo de 600 px, `SideNav` desde 600 px (ver `docs/design-system.md`).
- Web: `npx expo export --platform web` genera una SPA estática (`output: "single"`) que se sirve en
  Cloudflare Pages.

## Monorepo: Turborepo

```
apps/app                 Expo (iOS, Android, web)
packages/design-system   tokens + 34 componentes RN + Storybook
packages/domain          lógica pura (fotos, viajes, niebla, gastos) sin UI ni red
packages/map             AtlasMap: una interfaz, motor nativo y web
```

- Los paquetes se consumen como código fuente TypeScript (sin paso de build): Metro, Vitest y `tsc`
  los resuelven por `exports`.
- `turbo run lint typecheck test` es lo mismo que ejecuta CI.

## Backend: Supabase

- Postgres + **PostGIS** en la región **eu-west-1** (UE) por RGPD.
- Qué se sincroniza: cuenta, base (ciudad), viajes (fechas, nombre, ids de lugares), ids de
  países/regiones/ciudades desbloqueados, marcas a mano, notas y rutas de las miniaturas en R2.
- Qué NO se sincroniza nunca: coordenadas GPS de las fotos ni las fotos originales.
- Row Level Security en todas las tablas desde el primer día.

## Mapa: MapLibre + OpenFreeMap + Maputnik

- `@atlas/map` expone `AtlasMap` con una sola interfaz (`AtlasMapProps` en `packages/map/src/types.ts`):
  - iOS/Android: `@maplibre/maplibre-react-native` (`AtlasMap.native.tsx`).
  - Web: `maplibre-gl` 5 (`AtlasMap.web.tsx`). La v6 carga su worker con `import.meta.url`, que Metro
    no soporta; por eso se fija la 5.
- Capas propias (niebla, desbloqueado, rutas, grupos de fotos) definidas una vez en `overlays.ts` y
  pintadas con los tokens del design system.
- Estilo base propio "Cuaderno de explorador" (`packages/map/src/notebookStyle.ts`) sobre las
  teselas vectoriales de OpenFreeMap: tierra `paper`, agua `water`, fronteras en tinta discontinua
  y nombres en español (`name:es`). En nativo se escribe en la caché y se pasa como `file://`; en
  web, como data URL. Las fuentes de etiquetas son las de OpenFreeMap (Noto Sans).
- Privacidad: pedir teselas revela la zona que se está mirando, no la ubicación de las fotos. Si se
  quiere cero peticiones para el mapa, el siguiente paso son teselas offline (PMTiles) en el dispositivo.

## Fotos: expo-media-library + expo-sqlite

- Se lee el carrete por páginas con `expo-media-library` y cada lote pasa por
  `assignPhotosToBatch` (`@atlas/domain/photos`): GPS → país › región › ciudad › lugar, con límites
  administrativos descargados en el dispositivo y búsqueda punto-en-polígono.
- El índice (id del asset, fecha, lugar asignado) vive en `expo-sqlite`. La detección de viajes y la
  niebla se calculan en el dispositivo (`@atlas/domain/trips`, `@atlas/domain/fog`).
- Android: `ACCESS_MEDIA_LOCATION` activado (`isAccessMediaLocationEnabled`) para poder leer el GPS
  del EXIF. iOS: la app funciona con acceso limitado ("solo algunas fotos").
- Prueba técnica prioritaria: 15.000 fotos en < 2 minutos (ver `CLAUDE.md`).

## Miniaturas: Cloudflare R2

- Solo miniaturas, re-codificadas sin EXIF, para el visor web y la sincronización entre dispositivos.
- Subida opcional "solo con wifi" (HU-07). Al borrar la cuenta se eliminan en menos de 30 días.

## Observabilidad y flags

- **Sentry** (plan Developer, 5.000 errores/mes): errores de app y web. Sin datos de ubicación en los
  eventos (se filtran en `beforeSend`).
- **PostHog** (1 M eventos/mes): analítica de producto (métricas de la beta, spec §11) y **feature
  flags**, que sustituyen a Unleash. Toda funcionalidad nueva sale detrás de un flag.

## CI/CD: GitHub Actions + EAS

- `.github/workflows/ci.yml`:
  - En cada PR y en `main`: `npm ci`, Prettier, y `turbo run lint typecheck test`.
  - En PRs a `main`: build de preview con EAS (`--profile preview`, iOS + Android) si existen el
    secreto `EXPO_TOKEN` y el `projectId` de EAS en `app.json` (`eas init`); si no, se salta con aviso.
- Plan gratuito de EAS: 15 builds iOS + 15 Android al mes.

## Servicios de viaje (V2)

- **Amadeus** (Self-Service) cerró el 17/07/2026: para vuelos en V2 se usará **Ignav**.
- Lugares, divisas, clima y reservas: ver `docs/spec.md`, secciones 9 y 10.

## Costes

| Fase                  | Coste mensual | Qué incluye                                                                                                           |
| --------------------- | ------------- | --------------------------------------------------------------------------------------------------------------------- |
| Beta (30–50 personas) | **0 €**       | Supabase Free, R2 (10 GB gratis, sin egress), Sentry Developer, PostHog Free, Cloudflare Pages, OpenFreeMap, EAS Free |
| Lanzamiento           | **~25 $/mes** | Supabase Pro (backups, sin pausa por inactividad); el resto sigue en planes gratuitos                                 |

Aparte, costes fijos de publicación: Apple Developer Program (99 $/año) y Google Play (25 $, pago único).
