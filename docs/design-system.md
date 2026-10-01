# Design system: Atlas — Cuaderno de explorador

Estilo C de la especificación: estructura limpia y moderna, y piezas de papel (sellos, fotos con
celo, billetes perforados, notas a mano) solo donde cuentan algo. **Solo modo claro.**

- Artefacto vivo (fuente de diseño): <https://claude.ai/artifact/RKn5dmdwhqzTSzqvygC3fx>
- Código: `packages/design-system` (tokens + 33 componentes React Native para iOS, Android y web).
- Fuente de verdad de los tokens: `packages/design-system/src/tokens/tokens.json`. Las constantes
  TypeScript (`src/tokens/index.ts`) se generan con `npm run tokens` y un test falla si no están al día.
- Storybook: `npm run storybook` (web, sobre react-native-web). Cada componente tiene su `.stories.tsx`.

## Principios

1. **Un solo toque firma por pantalla.** Un sello grande, o una foto con celo, o un billete. El resto
   es tipografía, líneas y aire.
2. **El trazo informa.** Continua = recorrido (`stamp-red`), discontinua = planificado (`stamp-blue`),
   punteada = por descubrir (`ink-muted`). Aplica a rutas, bordes de tarjetas, etiquetas y sellos.
3. **Rojo = hecho, azul = por hacer.** `stamp-red` marca lo visitado, desbloqueado y la acción
   principal; `stamp-blue` lo planificado y el foco. Nunca intercambiar.
4. **El papel no se nota.** La textura (opacidad `grain`, 3 %) solo va en el fondo de pantalla.
   Tarjetas y fotos, lisas.
5. **`HandNote` solo para notas del usuario.** Caveat es la única letra manuscrita y nunca se usa en
   interfaz, títulos, botones ni avisos.
6. **Radio 3 px por defecto** (`radius-sm`). 0 para billetes y fotos; 999 px solo para avatares,
   sellos redondos y el botón de captura.

## Voz y textos

- Español, tuteo, frases cortas, en minúscula inicial salvo nombres propios. Nada de mayúsculas
  sostenidas salvo dentro de un sello.
- Los botones dicen lo que pasa: "Planificar viaje", "Guardar gasto", "Saldar". La misma palabra
  durante todo el flujo ("Saldar" → "Saldado").
- Metadatos a máquina y separados por comas: "abril 2024, 9 días, 312 fotos". Coordenadas con coma
  decimal: "34,97° N 135,77° E".
- Estados vacíos en positivo y con acción: "Aún no hay fotos de Perú. Cuando viajes, aparecerán aquí solas."
- Errores: qué pasó y cómo arreglarlo, sin disculpas.

## Color: 18 tokens

Todos los pares de texto sobre papel cumplen AA (≥ 4,5:1); lo comprueba `src/tokens/tokens.test.ts`.

| Token            | Constante             | Valor                             | Uso                                                                                                                             |
| ---------------- | --------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `paper`          | `colors.paper`        | `#E7DCC5`                         | Fondo general de la app (kraft). Nunca blanco puro.                                                                             |
| `paper-raised`   | `colors.paperRaised`  | `#F2EAD8`                         | Tarjetas, hojas, barras de navegación, campos. Texto: ink, ink-muted.                                                           |
| `paper-photo`    | `colors.paperPhoto`   | `#FBF7EE`                         | Solo marco de fotos (Polaroid) y fondo de notas manuscritas.                                                                    |
| `paper-sunk`     | `colors.paperSunk`    | `#DCCFB3`                         | Tierra sin descubrir en el mapa, pistas de progreso, zonas deshabilitadas.                                                      |
| `ink`            | `colors.ink`          | `#3B2F24`                         | Texto principal, iconos, bordes de controles (9,5:1 sobre paper).                                                               |
| `ink-muted`      | `colors.inkMuted`     | `#5E5043`                         | Metadatos, fechas, textos secundarios (5,7:1 sobre paper, 5,0:1 sobre paper-sunk).                                              |
| `hairline`       | `colors.hairline`     | `#CDBE9F`                         | Separadores decorativos de 1 px entre filas. Nunca como borde de un control.                                                    |
| `stamp-red`      | `colors.stampRed`     | `#B23A2E`                         | Acento principal: sellos de desbloqueo, CTA primario, lo visitado, rutas recorridas. Como relleno lleva texto on-stamp (5,0:1). |
| `stamp-red-text` | `colors.stampRedText` | `#9A3026`                         | Rojo cuando es TEXTO sobre paper o paper-raised (5,5:1): importes que debes, enlaces activos, errores.                          |
| `stamp-blue`     | `colors.stampBlue`    | `#2C4A7A`                         | Lo planificado: sellos de viaje futuro, rutas planificadas, foco de teclado. Válido como texto (6,5:1).                         |
| `olive`          | `colors.olive`        | `#6E7447`                         | Saldado, confirmado, check-in hecho, naturaleza en el mapa. Solo marcas e iconos (3,6:1).                                       |
| `olive-text`     | `colors.oliveText`    | `#565B36`                         | Oliva cuando es TEXTO: 'Saldado', 'Te deben'. Siempre con icono o palabra, nunca solo color.                                    |
| `ochre`          | `colors.ochre`        | `#7A5210`                         | Avisos: sincronización pendiente, presupuesto cerca del tope. Texto y marcas.                                                   |
| `on-stamp`       | `colors.onStamp`      | `#F2EAD8`                         | Texto e iconos sobre stamp-red, stamp-blue o ink.                                                                               |
| `water`          | `colors.water`        | `#C7C9B8`                         | Agua en el mapa.                                                                                                                |
| `land-visited`   | `colors.landVisited`  | `#B9A27A`                         | Tierra desbloqueada en el mapa.                                                                                                 |
| `tape`           | `colors.tape`         | `#EFE4C8`                         | Celo sobre las fotos destacadas. Se pinta al 85 % de opacidad.                                                                  |
| `focus`          | `colors.focus`        | `#2C4A7A` (alias de `stamp-blue`) | Anillo de foco de 2 px en todos los controles (6,5:1 sobre paper).                                                              |

Reglas:

- Fondo `paper`; tarjetas, hojas y barras `paper-raised`; marcos de foto y notas `paper-photo`;
  tierra sin descubrir y pistas `paper-sunk`.
- `stamp-red` como relleno siempre con texto `on-stamp`; como texto, `stamp-red-text`.
- `olive` solo en marcas; como texto `olive-text`. `ochre` para avisos.
- Debes / te deben: `stamp-red-text` / `olive-text`, SIEMPRE con la palabra ("Debes a", "te debe"):
  los dos colores se parecen en luminosidad.
- Bordes de controles en `ink`; `hairline` solo separa filas.
- Foco: anillo sólido de 2 px en `focus` con 2 px de separación, en todos los controles.

## Tipografía

Tres familias de Google Fonts, cargadas en la app con `@expo-google-fonts`:

| Familia                         | Rol                                            | Pesos    | Nombre en la app (`fontFaces`)                          |
| ------------------------------- | ---------------------------------------------- | -------- | ------------------------------------------------------- |
| **Libre Caslon Text** (`serif`) | Interfaz y títulos                             | 400, 700 | `LibreCaslonText_400Regular`, `LibreCaslonText_700Bold` |
| **Courier Prime** (`mono`)      | Datos, fechas, importes, códigos y coordenadas | 400, 700 | `CourierPrime_400Regular`, `CourierPrime_700Bold`       |
| **Caveat** (`hand`)             | EXCLUSIVAMENTE `HandNote`                      | 500      | `Caveat_500Medium`                                      |

En React Native el peso va en la fuente (`fontFamily`), no en `fontWeight`: así se ve igual en Android.
Usa siempre `typography.<estilo>` del paquete.

| Estilo        | Familia | Tamaño / interlínea (px) | Peso | Ejemplo                                              | Uso                                                                                             |
| ------------- | ------- | ------------------------ | ---- | ---------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `display`     | serif   | 54 / 56                  | 700  | Japón                                                | Nombre de país o ciudad en su ficha. Uno por pantalla.                                          |
| `title`       | serif   | 32 / 38                  | 700  | Kioto, Nara y Osaka                                  | Título de viaje, de pantalla principal.                                                         |
| `heading`     | serif   | 20 / 26                  | 700  | Tus viajes                                           | Encabezado de bloque.                                                                           |
| `stat`        | serif   | 26 / 28                  | 700  | 38 %                                                 | Cifras grandes en StatStrip.                                                                    |
| `body`        | serif   | 16 / 26                  | 400  | Templos, callejones y el mejor ramen de la estación. | Texto corrido, descripciones de lugares.                                                        |
| `body-strong` | serif   | 16 / 22                  | 700  | Fushimi Inari                                        | Nombre en filas y tarjetas, texto de botones.                                                   |
| `body-s`      | serif   | 14 / 22                  | 400  | Abierto 24 horas                                     | Texto secundario en tarjetas.                                                                   |
| `data`        | mono    | 13 / 18                  | 400  | abril 2024, 9 días, 312 fotos                        | Metadatos, fechas, importes, códigos de reserva.                                                |
| `data-strong` | mono    | 13 / 18                  | 700  | IB 6851 MAD → NRT                                    | Datos clave dentro de tickets.                                                                  |
| `data-s`      | mono    | 11 / 16                  | 400  | 34,97° N 135,77° E                                   | Coordenadas y etiquetas de mapa. Mínimo absoluto de tamaño.                                     |
| `hand`        | hand    | 22 / 26                  | 500  | Volver en otoño, sin falta                           | SOLO notas personales que escribe el usuario (HandNote). Nunca en interfaz, títulos ni botones. |

`display` es el nombre del lugar: uno por pantalla. 11 px (`data-s`) es el mínimo absoluto.

## Espaciado

Escala `4 · 8 · 12 · 16 · 24 · 32 · 48 · 64`. Márgenes laterales: `space-4` móvil, `space-5` tablet,
`space-6` escritorio.

| Token     | Constante    | Valor | Uso                                                       |
| --------- | ------------ | ----- | --------------------------------------------------------- |
| `space-1` | `spacing[1]` | 4px   | Entre icono y texto pequeño.                              |
| `space-2` | `spacing[2]` | 8px   | Dentro de chips y etiquetas; entre elementos de una fila. |
| `space-3` | `spacing[3]` | 12px  | Entre filas compactas, padding de campos.                 |
| `space-4` | `spacing[4]` | 16px  | Padding de tarjetas; margen lateral en móvil.             |
| `space-5` | `spacing[5]` | 24px  | Entre bloques de una pantalla; margen lateral en tablet.  |
| `space-6` | `spacing[6]` | 32px  | Margen lateral en escritorio; separación entre secciones. |
| `space-7` | `spacing[7]` | 48px  | Aire alrededor de estados vacíos.                         |
| `space-8` | `spacing[8]` | 64px  | Separación mayor en escritorio.                           |

## Radios

| Token          | Constante     | Valor | Uso                                                         |
| -------------- | ------------- | ----- | ----------------------------------------------------------- |
| `radius-none`  | `radii.none`  | 0px   | Tickets y fotos: papel cortado.                             |
| `radius-sm`    | `radii.sm`    | 3px   | Botones, campos, tarjetas, etiquetas. El radio por defecto. |
| `radius-round` | `radii.round` | 999px | Solo avatares, sellos redondos y el botón de captura.       |

## Sombras, inclinaciones, opacidades, tamaños y movimiento

| Token           | Valor                                                                 | Uso                                                                                      |
| --------------- | --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `shadow-photo`  | `1px 2px 0 rgba(59, 47, 36, 0.18)`                                    | Solo bajo fotos Polaroid: papel apoyado sobre papel.                                     |
| `shadow-sheet`  | `0 -1px 0 rgba(59, 47, 36, 0.12), 0 -6px 16px rgba(59, 47, 36, 0.08)` | Hoja inferior arrastrable en móvil. Ningún otro elemento lleva sombra difusa.            |
| `tilt-photo-l`  | `-1.5deg`                                                             | Foto destacada, variante izquierda.                                                      |
| `tilt-photo-r`  | `1deg`                                                                | Foto destacada, variante derecha.                                                        |
| `tilt-note`     | `-0.8deg`                                                             | Notas manuscritas.                                                                       |
| `tilt-stamp`    | `-12deg`                                                              | Sellos de desbloqueo.                                                                    |
| `grain`         | `0.03`                                                                | Textura de papel sobre fondos grandes (paper). Nunca sobre fotos ni sobre texto pequeño. |
| `stamp-ink`     | `0.88`                                                                | Tinta de los sellos, para que parezcan estampados.                                       |
| `touch-target`  | `44px`                                                                | Objetivo táctil mínimo de cualquier control (44 × 44 px).                                |
| `icon-nav`      | `22px`                                                                | Iconos de navegación y por defecto.                                                      |
| `icon-button`   | `18px`                                                                | Iconos dentro de botones.                                                                |
| `icon-tag`      | `14px`                                                                | Iconos dentro de etiquetas.                                                              |
| `side-nav`      | `600px`                                                               | Desde aquí SideNav en lugar de BottomNav, con el mapa siempre visible.                   |
| `double-view`   | `1024px`                                                              | Desde aquí doble vista: contenido a la izquierda, mapa sincronizado a la derecha.        |
| `duration-fast` | `180ms`                                                               | Transiciones de controles.                                                               |
| `duration-base` | `240ms`                                                               | Transiciones de hojas y paneles. Todo respeta "reducir movimiento".                      |

- Sin sombras difusas salvo `shadow-sheet` (hoja inferior). Las fotos llevan `shadow-photo`.
- Inclinaciones solo en fotos destacadas, notas y sellos. Nunca en texto ni en controles.
- Movimiento: 180–240 ms con curva suave. Tres momentos especiales: el sello cae al desbloquear, el
  mapa se despliega al entrar en una ciudad y las cuentas llegan a cero. Todo respeta "reducir movimiento".

## Iconografía

24 iconos propios (`Icon`) de trazo 1,6 px, puntas redondeadas, sin relleno, en rejilla de 24:
`map, trips, plus, photos, me, back, share, pin, camera, note, coin, check, close, search, layers,
calendar, plane, train, bed, ticket, food, compass, cloud, sync`. 22 px en navegación, 18 px en
botones, 14 px en etiquetas. Sin emoji; los países se identifican con su código ISO (`CountryChip`),
no con banderas.

## Responsive, táctil y escritorio

| Ancho     | Navegación                                     | Diseño                                                                                    |
| --------- | ---------------------------------------------- | ----------------------------------------------------------------------------------------- |
| < 600 px  | `BottomNav` (Mapa, Viajes, Captura, Fotos, Tú) | Una columna, márgenes `space-4`                                                           |
| ≥ 600 px  | `SideNav` a la izquierda, con el botón Captura | El mapa siempre visible a la derecha, márgenes `space-5`                                  |
| ≥ 1024 px | `SideNav`                                      | Doble vista: contenido a la izquierda, mapa sincronizado a la derecha; márgenes `space-6` |

- Objetivos táctiles de 44 × 44 px mínimo (`touchTarget`).
- Escritorio: hover, foco visible, atajos `/` (buscar) y `⌘K` (comandos).
- Accesibilidad: contraste AA, nunca solo el color para dar significado (el trazo y la palabra
  también informan), roles y nombres accesibles en todos los controles.

## Componentes: 33

El artefacto define 31 componentes (el brief inicial hablaba de 29; se implementan todos). Las props
son las del artefacto con dos adaptaciones a React Native: `onClick` → `onPress` y `href` → `onPress`.
Algunos controles añaden callbacks que el prototipo HTML no necesitaba (`onNavigate`, `onCapture`,
`onChangeText`, `onSettle`…).

Tipos que aparecen abajo:

- `IconName`: los 24 iconos de la sección Iconografía.
- `ButtonVariant`: `'primary' | 'secondary' | 'ghost' | 'danger'`.
- `TextFieldType`: `'text' | 'email' | 'password' | 'number'`.
- `TagTone`: `'neutral' | 'visited' | 'planned' | 'settled' | 'warning' | 'unexplored'`.
- `StampKind`: `'country' | 'city' | 'achievement'`; `StampTone`: `'red' | 'blue' | 'olive'`.
- `TicketKind`: `'flight' | 'train' | 'hotel' | 'entry'`.
- `RouteKind`: `'traveled' | 'planned' | 'unexplored'`.
- `PlaceStatus`: `'visited' | 'planned' | 'wish'`.
- `ExpenseCategory`: `'food' | 'transport' | 'stay' | 'activity' | 'other'`.
- `SyncState`: `'synced' | 'pending' | 'offline'`.
- `NavTab`: `'map' | 'trips' | 'photos' | 'me'`.
- `Stat`: `{ value: string; label: string }`.

### 1. Icon

Iconos de trazo 1,6 px con puntas redondeadas, dibujados como un plumín de cuaderno.

| Prop                 | Tipo       | Uso                                                                                   |
| -------------------- | ---------- | ------------------------------------------------------------------------------------- |
| `name` (obligatoria) | `IconName` | Qué icono.                                                                            |
| `size`               | `number`   | Lado en px; 22 por defecto, 18 dentro de botones, 14 en etiquetas.                    |
| `label`              | `string`   | Solo si el icono va solo y significa algo; si no, queda oculto al lector de pantalla. |
| `color`              | `string`   | En React Native no hay `currentColor`: pasa el color del texto al que acompaña.       |
| `strokeWidth`        | `number`   |                                                                                       |

### 2. Button

Botón de texto en serif negrita con 4 variantes; el primario es el rojo de sello.

| Prop                     | Tipo            | Uso                                                                                                                          |
| ------------------------ | --------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `children` (obligatoria) | `string`        | El texto dice exactamente lo que pasa: "Planificar viaje", "Saldar", "Guardar gasto".                                        |
| `variant`                | `ButtonVariant` | primary: la acción principal, una por pantalla. secondary: alternativas. ghost: terciarias en línea. danger: borrar o salir. |
| `size`                   | `'md' \| 'sm'`  | md (44 px) por defecto; sm (36 px) solo dentro de filas en escritorio.                                                       |
| `icon`                   | `IconName`      | Icono delante del texto.                                                                                                     |
| `loading`                | `boolean`       | Muestra el giro y bloquea el botón.                                                                                          |
| `block`                  | `boolean`       | Ancho completo.                                                                                                              |
| `disabled`               | `boolean`       |                                                                                                                              |
| `onPress`                | `() => void`    |                                                                                                                              |

### 3. IconButton

Botón solo de icono de 44 × 44 px, con nombre accesible obligatorio.

| Prop                  | Tipo         | Uso                                                     |
| --------------------- | ------------ | ------------------------------------------------------- |
| `icon` (obligatoria)  | `IconName`   |                                                         |
| `label` (obligatoria) | `string`     | Obligatorio: lo que hace ("Volver", "Compartir Japón"). |
| `outline`             | `boolean`    | Con borde, para usar sobre el mapa.                     |
| `disabled`            | `boolean`    |                                                         |
| `onPress`             | `() => void` |                                                         |

### 4. CaptureButton

El botón central de captura: redondo, rojo y con costura discontinua, como un sello a punto de estampar.

| Prop      | Tipo         | Uso                                                                        |
| --------- | ------------ | -------------------------------------------------------------------------- |
| `label`   | `string`     | Nombre accesible; por defecto "Captura rápida: foto, nota, gasto o lugar". |
| `onPress` | `() => void` | Abre la hoja de captura.                                                   |

### 5. TextField

Campo con etiqueta en serif y valor a máquina de escribir, subrayado como una línea de formulario de papel.

| Prop                  | Tipo                     | Uso                                                                         |
| --------------------- | ------------------------ | --------------------------------------------------------------------------- |
| `label` (obligatoria) | `string`                 | Obligatorio y siempre fuera del campo.                                      |
| `value`               | `string`                 | Valor controlado.                                                           |
| `defaultValue`        | `string`                 | Valor inicial si no se controla.                                            |
| `onChangeText`        | `(text: string) => void` |                                                                             |
| `placeholder`         | `string`                 |                                                                             |
| `hint`                | `string`                 | Ayuda bajo el campo.                                                        |
| `error`               | `string`                 | Sustituye a hint y marca el campo en rojo. Dice qué pasa y cómo arreglarlo. |
| `type`                | `TextFieldType`          |                                                                             |
| `disabled`            | `boolean`                |                                                                             |

### 6. AmountInput

Importe con selector de divisa a la izquierda y cifra alineada a la derecha.

| Prop               | Tipo                         | Uso                                                         |
| ------------------ | ---------------------------- | ----------------------------------------------------------- |
| `label`            | `string`                     | Por defecto "Importe".                                      |
| `currency`         | `string`                     | ISO 4217.                                                   |
| `currencies`       | `readonly string[]`          |                                                             |
| `value`            | `string`                     |                                                             |
| `onChangeAmount`   | `(text: string) => void`     |                                                             |
| `onChangeCurrency` | `(currency: string) => void` |                                                             |
| `hint`             | `string`                     | Útil para mostrar la conversión: no conviertas en silencio. |

### 7. Toggle

Interruptor que pasa de papel hundido a oliva al activarse. Solo para ajustes de efecto inmediato; si hay que pulsar Guardar después, usa Checkbox.

| Prop                  | Tipo                         | Uso             |
| --------------------- | ---------------------------- | --------------- |
| `label` (obligatoria) | `string`                     |                 |
| `checked`             | `boolean`                    | Estado inicial. |
| `onChange`            | `(checked: boolean) => void` |                 |

### 8. Checkbox

Casilla cuadrada en tinta, para listas de preparativos y selección de participantes.

| Prop                  | Tipo                         | Uso             |
| --------------------- | ---------------------------- | --------------- |
| `label` (obligatoria) | `string`                     |                 |
| `checked`             | `boolean`                    | Estado inicial. |
| `onChange`            | `(checked: boolean) => void` |                 |

### 9. Tag

Etiqueta de estado a máquina de escribir; el tipo de borde también informa.

| Prop                     | Tipo      | Uso                                                                                                           |
| ------------------------ | --------- | ------------------------------------------------------------------------------------------------------------- |
| `tone`                   | `TagTone` | visited: borde continuo rojo. planned: discontinuo azul. unexplored: punteado. settled: oliva. warning: ocre. |
| `children` (obligatoria) | `string`  | Siempre una palabra: nunca solo color.                                                                        |

### 10. CountryChip

País con su código ISO en una cajita a máquina en lugar de bandera.

| Prop                 | Tipo         | Uso                                    |
| -------------------- | ------------ | -------------------------------------- |
| `code` (obligatoria) | `string`     | ISO 3166 alfa-2. Nunca banderas emoji. |
| `name` (obligatoria) | `string`     |                                        |
| `pending`            | `boolean`    | Discontinuo: aún no desbloqueado.      |
| `onPress`            | `() => void` | Si navega (a la ficha del país).       |

### 11. Avatar

Iniciales en círculo de papel; se solapan en grupos.

| Prop                 | Tipo     | Uso              |
| -------------------- | -------- | ---------------- |
| `name` (obligatoria) | `string` | Nombre completo. |
| `size`               | `number` | 36 por defecto.  |

### 12. Stamp

El sello de tinta: redondo para países, rectangular para ciudades, dentado para logros. Es el toque firma principal: máximo uno grande por pantalla, y nunca como botón.

| Prop                  | Tipo        | Uso                                                 |
| --------------------- | ----------- | --------------------------------------------------- |
| `kind`                | `StampKind` |                                                     |
| `label` (obligatoria) | `string`    | Nombre del lugar o logro.                           |
| `date`                | `string`    | dd.mm.aaaa.                                         |
| `tone`                | `StampTone` | red: desbloqueado. blue: planificado. olive: logro. |
| `size`                | `number`    | 104 por defecto.                                    |
| `straight`            | `boolean`   | Sin inclinación, para las rejillas del pasaporte.   |

### 13. RouteMarker

Número de viaje o de día en un círculo discontinuo a máquina (N.º1, N.º2).

| Prop              | Tipo              | Uso                          |
| ----------------- | ----------------- | ---------------------------- |
| `n` (obligatoria) | `number`          |                              |
| `tone`            | `'red' \| 'blue'` | red: hecho. blue: por hacer. |

### 14. Coordinate

Latitud y longitud a máquina, con coma decimal. Solo se pinta en el dispositivo: las coordenadas de las fotos nunca salen del móvil ni aparecen en lo que se comparte.

| Prop                | Tipo     | Uso |
| ------------------- | -------- | --- |
| `lat` (obligatoria) | `number` |     |
| `lng` (obligatoria) | `number` |     |
| `color`             | `string` |     |

### 15. HandNote

Nota escrita a mano sobre papel; la ÚNICA pieza con letra manuscrita. Solo para notas personales del usuario: nunca textos de la app, títulos, botones ni avisos.

| Prop                     | Tipo     | Uso                               |
| ------------------------ | -------- | --------------------------------- |
| `children` (obligatoria) | `string` | El texto que escribió el usuario. |
| `meta`                   | `string` | Dónde y cuándo, a máquina.        |

### 16. Polaroid

Foto con marco blanco, sombra de papel y, en la destacada, celo e inclinación. En rejillas de galería, fotos rectas sin marco: si todo está torcido nada destaca.

| Prop                    | Tipo                          | Uso                                                                               |
| ----------------------- | ----------------------------- | --------------------------------------------------------------------------------- |
| `caption` (obligatoria) | `string`                      | Nombre del lugar.                                                                 |
| `src`                   | `string`                      | URI local de la foto (asset del carrete o miniatura); sin ella se ve el marcador. |
| `alt`                   | `string`                      |                                                                                   |
| `lat`                   | `number`                      |                                                                                   |
| `lng`                   | `number`                      |                                                                                   |
| `tape`                  | `boolean`                     | Celo: solo la foto destacada de cada bloque.                                      |
| `tilt`                  | `'none' \| 'left' \| 'right'` | Inclinación: solo la destacada.                                                   |
| `width`                 | `number`                      | 180 por defecto.                                                                  |
| `tone`                  | `string`                      | Color del marcador sin foto.                                                      |

### 17. Ticket

Reserva como billete perforado: datos a la izquierda, matriz con código a la derecha.

| Prop                  | Tipo         | Uso                                                               |
| --------------------- | ------------ | ----------------------------------------------------------------- |
| `kind`                | `TicketKind` |                                                                   |
| `title` (obligatoria) | `string`     | Ruta o nombre.                                                    |
| `meta`                | `string`     | Fecha, hora, duración.                                            |
| `provider`            | `string`     | Aerolínea, hotel…                                                 |
| `code` (obligatoria)  | `string`     | Localizador.                                                      |
| `stubLabel`           | `string`     | Etiqueta de la matriz.                                            |
| `time`                | `string`     | Hora bajo el código.                                              |
| `planned`             | `boolean`    | Borde discontinuo azul si aún no está confirmada ("Por revisar"). |

### 18. RouteLine

Las tres líneas del mapa. El trazo siempre informa, nunca decora.

| Prop        | Tipo        | Uso |
| ----------- | ----------- | --- |
| `kind`      | `RouteKind` |     |
| `length`    | `number`    |     |
| `label`     | `string`    |     |
| `hideLabel` | `boolean`   |     |

### 19. MapLegend

La leyenda del mapa como la de un atlas; en producto es también el filtro de capas (M1.2).

| Prop    | Tipo     | Uso                    |
| ------- | -------- | ---------------------- |
| `title` | `string` | Por defecto "Leyenda". |

### 20. PlaceCard

Tarjeta de lugar con miniatura, zona y estado.

| Prop                 | Tipo          | Uso                               |
| -------------------- | ------------- | --------------------------------- |
| `name` (obligatoria) | `string`      |                                   |
| `area` (obligatoria) | `string`      | Barrio o ciudad.                  |
| `status`             | `PlaceStatus` |                                   |
| `day`                | `string`      | Día del plan si está planificado. |
| `photos`             | `number`      | Tus fotos allí.                   |
| `lat`                | `number`      |                                   |
| `lng`                | `number`      |                                   |
| `icon`               | `IconName`    | Símbolo del tipo de lugar.        |
| `onPress`            | `() => void`  |                                   |

### 21. TripRow

Fila de viaje con su número en círculo discontinuo.

| Prop                  | Tipo         | Uso                                                   |
| --------------------- | ------------ | ----------------------------------------------------- |
| `n` (obligatoria)     | `number`     |                                                       |
| `title` (obligatoria) | `string`     |                                                       |
| `meta` (obligatoria)  | `string`     | Fechas, días, fotos: "abril 2024, 9 días, 312 fotos". |
| `planned`             | `boolean`    | Viaje futuro: azul y etiqueta "Próximo".              |
| `onPress`             | `() => void` |                                                       |

### 22. ExpenseRow

Fila de gasto con categoría, quién pagó, importe y su conversión.

| Prop                   | Tipo              | Uso                                          |
| ---------------------- | ----------------- | -------------------------------------------- |
| `title` (obligatoria)  | `string`          |                                              |
| `payer` (obligatoria)  | `string`          |                                              |
| `amount` (obligatoria) | `number`          |                                              |
| `currency`             | `string`          | ISO 4217.                                    |
| `converted`            | `string`          | Importe en la divisa base: "≈ 25,40 EUR".    |
| `category`             | `ExpenseCategory` |                                              |
| `date`                 | `string`          |                                              |
| `split`                | `string`          | Cómo se reparte: "a partes iguales entre 3". |

### 23. DebtRow

Quién debe a quién, con la acción de saldar o recordar. Rojo = debes; oliva = te deben; siempre con palabra, porque los dos colores se parecen en luminosidad.

| Prop                   | Tipo         | Uso                                   |
| ---------------------- | ------------ | ------------------------------------- |
| `from` (obligatoria)   | `string`     | Quien debe.                           |
| `to` (obligatoria)     | `string`     | A quien ("Tú" si es el usuario).      |
| `amount` (obligatoria) | `number`     |                                       |
| `currency`             | `string`     |                                       |
| `settled`              | `boolean`    |                                       |
| `onSettle`             | `() => void` | Tú debes: marcar como saldado.        |
| `onRemind`             | `() => void` | Te deben: recordar a la otra persona. |

### 24. Breadcrumbs

Migas geográficas a máquina.

| Prop                  | Tipo                      | Uso                                                          |
| --------------------- | ------------------------- | ------------------------------------------------------------ |
| `items` (obligatoria) | `readonly string[]`       | Mundo › Asia › Japón › Kioto. El último es la página actual. |
| `onNavigate`          | `(index: number) => void` | Índice del nivel pulsado.                                    |

### 25. StatStrip

Tira de cifras entre dos líneas de tinta, como el pie de una ficha.

| Prop                  | Tipo              | Uso              |
| --------------------- | ----------------- | ---------------- |
| `stats` (obligatoria) | `readonly Stat[]` | De 2 a 4 cifras. |

### 26. ProgressBar

Progreso de desbloqueo: pista discontinua que se rellena de rojo.

| Prop                  | Tipo     | Uso                            |
| --------------------- | -------- | ------------------------------ |
| `label` (obligatoria) | `string` |                                |
| `value` (obligatoria) | `number` | 0–100.                         |
| `detail`              | `string` | Línea a máquina bajo la barra. |

### 27. SyncIndicator

Estado de guardado: offline-first, así que "sin conexión" nunca es un error.

| Prop    | Tipo        | Uso                             |
| ------- | ----------- | ------------------------------- |
| `state` | `SyncState` |                                 |
| `label` | `string`    | Sustituye al texto por defecto. |

### 28. TimeSlider

Deslizador de años para ver cómo se fue desbloqueando el mapa (M1.3). Cada año es un objetivo táctil de 44 px de alto; con lector de pantalla se ajusta con las acciones estándar de incrementar y reducir.

| Prop                | Tipo                     | Uso                                 |
| ------------------- | ------------------------ | ----------------------------------- |
| `min`               | `number`                 | 2018 por defecto.                   |
| `max` (obligatoria) | `number`                 |                                     |
| `value`             | `number`                 | Año inicial; `max` si no se indica. |
| `onChange`          | `(year: number) => void` |                                     |

### 29. BottomNav

Barra inferior de móvil (< 600 px): Mapa, Viajes, Captura, Fotos, Tú.

| Prop                   | Tipo                    | Uso                                                                                                              |
| ---------------------- | ----------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `active` (obligatoria) | `NavTab`                |                                                                                                                  |
| `onNavigate`           | `(tab: NavTab) => void` |                                                                                                                  |
| `onCapture`            | `() => void`            | Abre la hoja de captura.                                                                                         |
| `bottomInset`          | `number`                | Zona segura inferior (barra de inicio del iPhone). Sustituye al margen inferior: la barra queda pegada al borde. |

### 30. SideNav

Barra lateral de tablet y escritorio (≥ 600 px) con las mismas secciones y el botón Captura.

| Prop                   | Tipo                    | Uso |
| ---------------------- | ----------------------- | --- |
| `active` (obligatoria) | `NavTab`                |     |
| `onNavigate`           | `(tab: NavTab) => void` |     |
| `onCapture`            | `() => void`            |     |

### 31. EmptyState

Estado vacío con recuadro discontinuo, que invita a actuar. Sin disculpas ni chistes.

| Prop                  | Tipo         | Uso                     |
| --------------------- | ------------ | ----------------------- |
| `icon`                | `IconName`   |                         |
| `title` (obligatoria) | `string`     | Qué falta, en positivo. |
| `body` (obligatoria)  | `string`     | Qué hacer.              |
| `action`              | `string`     | Texto del botón.        |
| `onAction`            | `() => void` |                         |

### 32. Paper (nuevo en el código, pendiente de añadir al artefacto)

El papel del cuaderno: color de fondo y un grano muy suave, como la clase `at-paper` de los
artboards. El grano es una tesela de puntos con `react-native-svg` (sin imágenes), decorativo y
oculto a lectores de pantalla. Lo usa `Screen` en todas las pantallas.

| Prop       | Tipo                   | Uso                                          |
| ---------- | ---------------------- | -------------------------------------------- |
| `tone`     | `'paper' \| 'raised'`  | `paper` para pantallas, `raised` para hojas. |
| `style`    | `StyleProp<ViewStyle>` |                                              |
| `children` | `ReactNode`            |                                              |

### 33. SegmentedTabs (nuevo en el código, pendiente de añadir al artefacto)

Pestañas segmentadas en tinta de los artboards M3.1 y M4.1 ("Por lugar / Por tiempo",
"Próximos / En curso / Pasados"). La elegida se rellena de tinta y va en negrita (no solo color);
44 px de alto.

| Prop                    | Tipo                                     | Uso                         |
| ----------------------- | ---------------------------------------- | --------------------------- |
| `label` (obligatoria)   | `string`                                 | Nombre accesible del grupo. |
| `options` (obligatoria) | `readonly { value: T; label: string }[]` |                             |
| `value` (obligatoria)   | `T`                                      |                             |
| `onChange`              | `(value: T) => void`                     |                             |
