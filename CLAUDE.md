# CLAUDE.md: contexto maestro de Atlas

Lee esto antes de tocar nada. Resume qué es Atlas, cómo está montado el repo y las reglas que no se
negocian. El detalle está en `docs/`.

## Qué es Atlas

Atlas es una app de viajes con un **mapa del mundo propio que se desbloquea con tus fotos**. Lee el
carrete, sitúa cada foto en país › región › ciudad › lugar, levanta la niebla de los sitios donde
has estado, detecta tus viajes solo y te deja compartirlo en tarjetas bonitas. Un solo código para
iOS, Android y web.

MVP = "tu mundo desbloqueado con tus fotos": sin planificador, sin gastos y sin red social todavía.
La apuesta: que alguien con miles de fotos vea su mapa desbloqueado en menos de dos minutos, se
reconozca en él y quiera compartirlo.

### Principios de producto

1. **El mapa es la casa.** Todo empieza y vuelve al mapa.
2. **Cero trabajo manual.** Las fotos se ordenan solas por GPS y fecha; el usuario solo corrige.
3. **Privado por defecto.** Fotos y ubicaciones son del usuario; compartir es siempre explícito.
4. **Funciona sin cobertura.** Todo se guarda en el móvil y sincroniza después.
5. **Bonito para compartir.** Todo lo que se genera debe dar ganas de publicarlo.

## Artefactos de diseño (Claude Design)

| Artefacto                              | Enlace                                              | Qué contiene                                                                  |
| -------------------------------------- | --------------------------------------------------- | ----------------------------------------------------------------------------- |
| Design System "Cuaderno de explorador" | <https://claude.ai/artifact/RKn5dmdwhqzTSzqvygC3fx> | Tokens, 31 componentes y reglas de estilo. Resumen en `docs/design-system.md` |
| Lienzo "Atlas — MVP"                   | <https://claude.ai/artifact/2d9Ggi2rw3FK7GCvCXwUSC> | 62 pantallas (móvil y escritorio) en 5 tandas. Capturas en `docs/screens/`    |
| Especificación de producto             | <https://claude.ai/artifact/G5rtdaCde8ZN57i7rfUjUk> | Visión, pantallas, historias de usuario y plan MVP. Copia en `docs/spec.md`   |

Antes de implementar una pantalla, ábrela en el lienzo por su código (tabla de abajo) y reprodúcela
solo con componentes de `@atlas/design-system`. Si falta un componente, se crea en el paquete
siguiendo sus reglas (con test y story) y se avisa para añadirlo también al artefacto.

## Stack

| Capa                      | Tecnología                                                                                |
| ------------------------- | ----------------------------------------------------------------------------------------- |
| App                       | Expo (React Native, nueva arquitectura) + Expo Router + react-native-web                  |
| Monorepo                  | Turborepo + npm workspaces                                                                |
| Lenguaje                  | TypeScript estricto                                                                       |
| Tests                     | Vitest (dominio en Node puro; componentes sobre react-native-web + jsdom)                 |
| Design system             | `packages/design-system` + Storybook (react-native-web-vite)                              |
| Backend                   | Supabase: Postgres + PostGIS, región eu-west-1 (UE, RGPD)                                 |
| Auth                      | Supabase Auth: Apple, Google, enlace mágico                                               |
| Mapa                      | MapLibre (maplibre-react-native / maplibre-gl 5) + OpenFreeMap + estilo propio (Maputnik) |
| Fotos locales             | expo-media-library + expo-sqlite (el GPS nunca sale del dispositivo)                      |
| Miniaturas                | Cloudflare R2 (sin coste de egress)                                                       |
| Errores                   | Sentry (plan Developer)                                                                   |
| Analítica y feature flags | PostHog                                                                                   |
| Web                       | Cloudflare Pages                                                                          |
| CI/CD                     | GitHub Actions + EAS Build                                                                |

Detalle y costes en `docs/stack.md`.

## Estructura y comandos

```
apps/app/                   Expo: rutas en app/, lógica en features/<feature>/{ui,hooks,services,store,tests}
packages/design-system/     tokens (tokens.json → index.ts generado) + 31 componentes + Storybook
packages/domain/            lógica pura: photos, trips, fog, expenses (sin UI, sin red, sin Supabase)
packages/map/               AtlasMap (.native.tsx / .web.tsx) + capas compartidas (overlays.ts)
docs/                       spec.md, stack.md, design-system.md, screens/
```

```bash
npm ci                      # instalar (Node 24, ver .nvmrc)
npm run check               # lint + typecheck + test en todo el monorepo (lo mismo que CI)
npm run format              # Prettier
npm run tokens              # regenerar packages/design-system/src/tokens/index.ts desde tokens.json
npm run storybook           # Storybook del design system en http://localhost:6006
cd apps/app && npm run ios  # development build (MapLibre nativo no funciona en Expo Go)
cd apps/app && npm run web  # la app en el navegador
```

## Reglas de ingeniería (no se negocian)

- **TDD, 100 %.** Primero el test, luego el código. El dominio exige 100 % de cobertura (líneas,
  ramas y funciones: lo comprueba `vitest --coverage` en CI). Cada componente tiene su `.test.tsx`
  y cada feature sus tests en `features/<feature>/tests/`.
- **Tests de dominio con Vitest puro:** sin DOM ni React Native. `packages/domain` no importa nada
  de UI, red, Expo ni Supabase; recibe los datos e interfaces (p. ej. `PlaceResolver`) desde fuera.
- **Feature flags con PostHog.** Toda funcionalidad nueva que llegue a usuarios sale detrás de un
  flag (`<modulo>-<nombre>`, p. ej. `m1-time-slider`) y el flag se retira cuando se estabiliza.
  PostHog aún no está instalado: se añade con la primera feature que salga a la beta.
- **TypeScript estricto.** Sin `any`, sin `as unknown`, sin `!` de no-nulo (ESLint lo bloquea).
  `noUncheckedIndexedAccess` activo: comprueba los índices en vez de forzarlos.
- **Offline-first.** Todo se escribe primero en local (expo-sqlite) y se sincroniza después. La UI
  nunca espera a la red para mostrar lo que ya está en el móvil; "sin conexión" no es un error
  (`SyncIndicator`).
- **Las coordenadas GPS nunca salen del dispositivo.** Ni a Supabase, ni a R2, ni a Sentry, ni a
  PostHog, ni en lo que se comparte. A la nube solo van ids de lugar (país, región, ciudad) y
  miniaturas sin EXIF. Las tarjetas compartidas muestran ciudad y país, nunca coordenadas ni la base.
- **Accesibilidad:** objetivos táctiles de 44 px mínimo (`touchTarget`), contraste AA (lo prueban
  los tests de tokens), roles y nombres accesibles (`role`, `aria-*`) en todos los controles, y nunca
  solo el color para dar significado.
- **Cada componente** del design system tiene `Componente.tsx`, `Componente.stories.tsx` y
  `Componente.test.tsx` en su carpeta.
- **Commits semánticos** (`feat(scope):`, `fix:`, `docs:`, `test:`, `chore:`, `ci:`). Un cambio por commit.

## Reglas del design system

- **Estilo C, Cuaderno de explorador.** Estructura limpia; piezas de papel solo donde cuentan algo.
- **Un toque firma por pantalla:** un sello grande, o una foto con celo, o un billete. El resto es
  tipografía, líneas y aire.
- **`HandNote` solo para notas del usuario.** Caveat nunca en interfaz, títulos, botones ni avisos.
- **Solo modo claro.** No hay tema oscuro por ahora.
- **Radio 3 px por defecto** (`radii.sm`); 0 en billetes y fotos; 999 px solo avatares, sellos y captura.
- El trazo informa: continuo = recorrido (rojo), discontinuo = planificado (azul), punteado = por descubrir.
- Rojo = hecho / acción principal; azul = por hacer / foco. Nunca intercambiar.
- Nada de colores, tamaños o fuentes sueltos: siempre tokens (`colors`, `typography`, `spacing`, `radii`).
- Nada de emoji ni banderas: iconos propios (`Icon`) y códigos ISO (`CountryChip`).
- `< 600 px` BottomNav · `≥ 600 px` SideNav con el mapa visible · `≥ 1024 px` doble vista.

## Orden de implementación del MVP

1. **design-system**: tokens y 31 componentes con tests y stories (hecho).
2. **Lectura del carrete** (HU-05, HU-07): por páginas, con GPS en el móvil, guardada en
   expo-sqlite y solo fotos nuevas al abrir (hecho, `features/photos`).
3. **domain/photos + datos geográficos** (HU-06): país (Natural Earth), región (admin-1) y ciudad
   más cercana (GeoNames ≥ 15.000 hab.), todo en el dispositivo (hecho, `features/map/services`).
4. **domain/trips** (HU-21): detección automática con base = ciudad con más fotos (hecho, lista y
   detalle básicos). Falta corregir: confirmar, fusionar, dividir, renombrar (HU-22).
5. **map** (M1): niebla por país y por región al acercarse, fichas de país (hecho, versión inicial).
   Falta: capas (M1.2), viaje en el tiempo (M1.3), fichas de región y ciudad, búsqueda.
6. **onboarding** (M0): portada, onboarding, registro, permisos, confirmar la base.
7. **photos** (M3): galería por lugar y tiempo, detalle, corrección, sin ubicación.
8. **trips** (M4): detalle completo con días y notas, editor.
9. **exploration** (M2, dentro de `features/map`): progreso y pasaporte de sellos.
10. **sharing** (M8): crear tarjeta y compartir fuera.
11. **settings** (M10): ajustes, privacidad, almacenamiento, datos y **Créditos** (obligatorio
    citar GeoNames, CC BY 4.0; ver `apps/app/features/map/data/README.md`).

Lo que ya existe en `packages/domain` (fotos, viajes, niebla, gastos) son interfaces y algoritmos
puros con sus tests; falta conectarlos a datos reales. `expenses` es de V2 y no entra en el MVP.

## Prueba técnica prioritaria

**Leer 15.000 fotos con expo-media-library en menos de 2 minutos** (HU-05: 10.000 fotos en < 2 min
en un móvil de gama media de 2023; sin congelarse con 15.000). Es el mayor riesgo del MVP y va
antes que cualquier pantalla de importación:

- Paginar `getAssetsAsync` (lotes de ~500) y procesar cada lote con `assignPhotosToBatch` sin
  bloquear el hilo de UI; el mapa empieza a pintarse con el primer lote.
- Riesgo conocido: el GPS no viene en `getAssetsAsync`; pedir `getAssetInfoAsync` foto a foto puede
  ser demasiado lento. Medirlo primero; si no da, leer EXIF por lotes en un módulo nativo propio.
- Medir en un iPhone y un Android de gama media reales con un carrete de 15.000 fotos y dejar el
  resultado en `docs/`.

## Pantallas del MVP (lienzo "Atlas — MVP")

Código y tanda de cada artboard. "E." son estados (vacío, sin conexión, error, cargando) y "W." el
visor web de escritorio.

| Código      | Pantalla                         | Formato    | Tanda                            | Artboard                                |
| ----------- | -------------------------------- | ---------- | -------------------------------- | --------------------------------------- |
| M0.1        | Portada                          | móvil      | 1 · Arranque                     | `Main.dc.html`                          |
| M0.2        | Onboarding 1: recuerda           | móvil      | 1 · Arranque                     | `M0-2a-onboarding.dc.html`              |
| M0.2        | Onboarding 2: desbloquea         | móvil      | 1 · Arranque                     | `M0-2b-onboarding.dc.html`              |
| M0.2        | Onboarding 3: comparte           | móvil      | 1 · Arranque                     | `M0-2c-onboarding.dc.html`              |
| M0.3        | Registro                         | móvil      | 1 · Arranque                     | `M0-3-registro.dc.html`                 |
| M0.4        | Permiso de fotos                 | móvil      | 1 · Arranque                     | `M0-4-permisos.dc.html`                 |
| M0.5        | Tu base                          | móvil      | 1 · Arranque                     | `M0-5-base.dc.html`                     |
| M0.6        | Importación del carrete          | móvil      | 1 · Arranque                     | `M0-6-importacion.dc.html`              |
| M0.7        | Primera revelación               | móvil      | 1 · Arranque                     | `M0-7-revelacion.dc.html`               |
| M0.3        | Registro                         | escritorio | 1 · Arranque                     | `M0-3-registro-escritorio.dc.html`      |
| M0.7        | Primera revelación               | escritorio | 1 · Arranque                     | `M0-7-revelacion-escritorio.dc.html`    |
| M1.1        | Mapa mundi                       | móvil      | 2 · Mapa y exploración           | `M1-1-mapa.dc.html`                     |
| M1.2        | Capas y leyenda                  | móvil      | 2 · Mapa y exploración           | `M1-2-capas.dc.html`                    |
| M1.4        | Ficha de país: Japón             | móvil      | 2 · Mapa y exploración           | `M1-4-ficha-pais.dc.html`               |
| M1.5        | Ficha de región: Kansai          | móvil      | 2 · Mapa y exploración           | `M1-5-region.dc.html`                   |
| M1.6        | Ficha de ciudad: Kioto           | móvil      | 2 · Mapa y exploración           | `M1-6-ciudad.dc.html`                   |
| M1.8        | Búsqueda                         | móvil      | 2 · Mapa y exploración           | `M1-8-busqueda.dc.html`                 |
| M2.1        | Tu progreso                      | móvil      | 2 · Mapa y exploración           | `M2-1-progreso.dc.html`                 |
| M2.2        | Pasaporte                        | móvil      | 2 · Mapa y exploración           | `M2-2-pasaporte.dc.html`                |
| M1.1        | Mapa mundi                       | escritorio | 2 · Mapa y exploración           | `M1-1-mapa-escritorio.dc.html`          |
| M1.4        | Ficha de país                    | escritorio | 2 · Mapa y exploración           | `M1-4-ficha-pais-escritorio.dc.html`    |
| M2.1 y M2.2 | Pasaporte y progreso             | escritorio | 2 · Mapa y exploración           | `M2-2-pasaporte-escritorio.dc.html`     |
| M3.1        | Fotos por lugar                  | móvil      | 3 · Fotos y viajes               | `M3-1-fotos-lugar.dc.html`              |
| M3.2        | Fotos por tiempo                 | móvil      | 3 · Fotos y viajes               | `M3-2-fotos-tiempo.dc.html`             |
| M3.4        | Detalle de foto                  | móvil      | 3 · Fotos y viajes               | `M3-4-detalle-foto.dc.html`             |
| M3.4        | Corregir ubicación               | móvil      | 3 · Fotos y viajes               | `M3-4b-corregir-ubicacion.dc.html`      |
| M3.5        | Fotos sin ubicación              | móvil      | 3 · Fotos y viajes               | `M3-5-sin-ubicacion.dc.html`            |
| M3.6        | Revisión de viajes detectados    | móvil      | 3 · Fotos y viajes               | `M3-6-revision-viajes.dc.html`          |
| M4.1        | Lista de viajes                  | móvil      | 3 · Fotos y viajes               | `M4-1-viajes.dc.html`                   |
| M4.2        | Detalle de viaje                 | móvil      | 3 · Fotos y viajes               | `M4-2-detalle-viaje.dc.html`            |
| M4.4        | Editar viaje                     | móvil      | 3 · Fotos y viajes               | `M4-4-editar-viaje.dc.html`             |
| M3.1        | Fotos por lugar                  | escritorio | 3 · Fotos y viajes               | `M3-1-fotos-escritorio.dc.html`         |
| M4.2        | Detalle de viaje                 | escritorio | 3 · Fotos y viajes               | `M4-2-detalle-viaje-escritorio.dc.html` |
| M8.4        | Crear tarjeta                    | móvil      | 4 · Compartir, ajustes y estados | `M8-4-crear-tarjeta.dc.html`            |
| M8.5        | Compartir fuera                  | móvil      | 4 · Compartir, ajustes y estados | `M8-5-compartir-fuera.dc.html`          |
| M10         | Ajustes                          | móvil      | 4 · Compartir, ajustes y estados | `M10-0-ajustes.dc.html`                 |
| M10.2       | Privacidad                       | móvil      | 4 · Compartir, ajustes y estados | `M10-2-privacidad.dc.html`              |
| M10.3       | Fotos y almacenamiento           | móvil      | 4 · Compartir, ajustes y estados | `M10-3-fotos-almacenamiento.dc.html`    |
| M10.5       | General                          | móvil      | 4 · Compartir, ajustes y estados | `M10-5-general.dc.html`                 |
| M10.7       | Tus datos                        | móvil      | 4 · Compartir, ajustes y estados | `M10-7-datos.dc.html`                   |
| M10.7       | Confirmar borrado                | móvil      | 4 · Compartir, ajustes y estados | `M10-7b-borrar-cuenta.dc.html`          |
| E.1         | Vacío · Sin acceso a fotos       | móvil      | 4 · Compartir, ajustes y estados | `E-1-sin-acceso-fotos.dc.html`          |
| E.2         | Vacío · Aún sin viajes           | móvil      | 4 · Compartir, ajustes y estados | `E-2-viajes-vacio.dc.html`              |
| E.3         | Sin conexión · Mapa              | móvil      | 4 · Compartir, ajustes y estados | `E-3-sin-conexion.dc.html`              |
| E.4         | Error · Importación pausada      | móvil      | 4 · Compartir, ajustes y estados | `E-4-error-importacion.dc.html`         |
| E.5         | Error · Registro sin conexión    | móvil      | 4 · Compartir, ajustes y estados | `E-5-error-registro.dc.html`            |
| E.6         | Cargando · Ficha de país         | móvil      | 4 · Compartir, ajustes y estados | `E-6-cargando-ficha.dc.html`            |
| W.1         | Visor web · Paleta de comandos   | escritorio | 4 · Compartir, ajustes y estados | `W-1-paleta-comandos.dc.html`           |
| W.2         | Visor web · Aún sin fotos        | escritorio | 4 · Compartir, ajustes y estados | `W-2-visor-vacio.dc.html`               |
| W.3         | Visor web · Ajustes y privacidad | escritorio | 4 · Compartir, ajustes y estados | `W-3-ajustes-privacidad.dc.html`        |
| W.4         | Visor web · Crear tarjeta        | escritorio | 4 · Compartir, ajustes y estados | `W-4-crear-tarjeta.dc.html`             |
| M1.1        | Zoom en país: Japón              | móvil      | 5 · El mapa por dentro           | `M1-1b-zoom-pais.dc.html`               |
| M1.1        | Zoom en región: Kansai           | móvil      | 5 · El mapa por dentro           | `M1-1c-zoom-region.dc.html`             |
| M3.3        | Mapa de fotos: Kioto             | móvil      | 5 · El mapa por dentro           | `M3-3-mapa-fotos.dc.html`               |
| M3.3        | Grupo de fotos abierto           | móvil      | 5 · El mapa por dentro           | `M3-3b-grupo-fotos.dc.html`             |
| M1.3        | Viaje en el tiempo               | móvil      | 5 · El mapa por dentro           | `M1-3-viaje-tiempo.dc.html`             |
| M1.4        | Marcar a mano                    | móvil      | 5 · El mapa por dentro           | `M1-4c-marcar-a-mano.dc.html`           |
| M3.7        | Selección múltiple               | móvil      | 5 · El mapa por dentro           | `M3-7-seleccion.dc.html`                |
| M3.7        | Confirmar ocultar                | móvil      | 5 · El mapa por dentro           | `M3-7b-ocultar.dc.html`                 |
| M3.8        | Estado de importación            | móvil      | 5 · El mapa por dentro           | `M3-8-estado-importacion.dc.html`       |
| M1.1        | Zoom en región: Kansai           | escritorio | 5 · El mapa por dentro           | `M1-1d-region-escritorio.dc.html`       |
| M3.3        | Mapa de fotos: Kioto             | escritorio | 5 · El mapa por dentro           | `M3-3c-mapa-fotos-escritorio.dc.html`   |
