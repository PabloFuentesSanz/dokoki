# Atlas — Especificación de producto y diseño

> Copia en el repositorio del documento vivo
> [Atlas — Especificación de producto y diseño](https://claude.ai/artifact/G5rtdaCde8ZN57i7rfUjUk)
> (30.09.2026). Si hay diferencias, manda el documento vivo.
>
> **Decisiones tomadas después de escribirlo** (y que mandan sobre lo que dice abajo):
>
> - Estilo visual: **C · Cuaderno de explorador** (no la A), con su design system propio
>   ([artefacto](https://claude.ai/artifact/RKn5dmdwhqzTSzqvygC3fx), resumen en `docs/design-system.md`).
> - **Solo modo claro** por ahora: el "mapa nocturno" de la sección 2 queda aparcado.
> - Países por su código ISO (`CountryChip`), nunca banderas.
> - Stack: Expo + Supabase + MapLibre (ver `docs/stack.md`). Donde se menciona Mapbox, léase MapLibre.

## 1. Visión del producto

Atlas (nombre provisional) es un cuaderno de viaje vivo: un mapa del mundo que se desbloquea con tus propias fotos, te ayuda a planificar el siguiente viaje, te acompaña mientras viajas y cuadra las cuentas del grupo. Un solo ciclo: **recordar → planificar → viajar → compartir → recordar**.

La promesa en una frase: _abre la app y ve, en un mapa precioso, todo lo que has vivido y todo lo que te queda por descubrir._

### Principios que guían cada decisión

1. **El mapa es la casa.** Todo empieza y vuelve al mapa: fotos, planes, gastos y posts tienen un sitio en él.
2. **Cero trabajo manual.** Las fotos se ordenan solas por país › región › ciudad › lugar gracias al GPS y la fecha. El usuario solo corrige.
3. **Privado por defecto.** Tus fotos y ubicaciones son tuyas; compartir siempre es una decisión explícita.
4. **Funciona sin cobertura.** Planes, mapas descargados, check-ins y gastos se guardan offline y sincronizan después.
5. **Bonito para compartir.** Todo lo que se genera (tarjetas, postales, recaps) debe dar ganas de publicarlo.

### Qué tomamos de cada competidor y qué mejoramos

| Referencia                  | Qué hace bien                                 | Qué le falta y hacemos mejor                                            |
| --------------------------- | --------------------------------------------- | ----------------------------------------------------------------------- |
| Polarsteps                  | Tracking del viaje y libro impreso            | No importa bien tu carrete antiguo; poca planificación y nada de gastos |
| Wanderlog                   | Planificador con mapa, reservas y presupuesto | Se olvida del viaje cuando termina; no hay recuerdo ni mapa personal    |
| Google Photos / Apple Fotos | Mapa de fotos por GPS                         | No entiende de viajes, países ni progreso; nada social                  |
| Splitwise / Tricount        | Deudas entre amigos y liquidación             | Vive fuera del viaje; no sabe dónde ni cuándo se gastó                  |
| Been / Visited              | Mapa de países rascados                       | Solo marca países; sin fotos ni niveles más finos                       |
| Pinterest / Instagram       | Inspiración visual y compartir                | No conecta la inspiración con un plan real                              |

El hueco que ocupamos: nadie une tu pasado (fotos), tu futuro (planes) y tu presente (viaje en curso, gastos) en el mismo mapa.

## 2. Dirección de arte: cuatro opciones retro-modernas

Recomiendo la **opción A (Atlas de carretera)** como base, con la limpieza de la D. Las cuatro comparten la idea de fondo: estructura minimalista y moderna (mucho aire, rejilla clara, pocos colores), y los detalles de las guías antiguas solo en los momentos que importan. Como Kanso, pero el lenguaje es cartográfico en vez de japonés.

### A · Atlas de carretera (recomendada)

La guía Michelin o el atlas de gasolinera de los 60, reinterpretados con precisión digital.

- **Paleta:** papel `#F3EDE0`, tinta `#1F2A44`, rojo carretera `#C8412B`, amarillo señal `#E8B53A`, verde parque `#5B7B5A`, azul agua `#9FB8C8`.
- **Tipografía:** titulares en serif con carácter (Fraunces o Instrument Serif), cuerpo en grotesca estrecha (Archivo), datos y coordenadas en mono (IBM Plex Mono).
- **Toques firma:** escudos de carretera para numerar días y etapas, coordenadas de cuadrícula tipo "C4" en las tarjetas, leyenda del mapa como componente real, números de página como en una guía.
- **Mapa:** estilo propio en Mapbox con relleno plano, carreteras en rojo y amarillo, tipografía de mapa serif.
- **Riesgo:** si se abusa de los ornamentos parece un tema vintage de plantilla. Se evita con reglas estrictas de uso (ver toques firma).

### B · Póster de viaje mid-century

Carteles de aerolíneas y ferrocarriles de los 50: bloques de color planos, soles, horizontes.

- **Paleta:** crema `#F6EBD9`, naranja atardecer `#E2703A`, turquesa `#2F8F8B`, azul noche `#1B2F4B`, rosa arena `#E9B7A1`.
- **Tipografía:** display geométrica condensada (Big Shoulders Display), cuerpo humanista (Josefin Sans o Inter).
- **Toques firma:** cada país tiene un mini-póster ilustrado generado; portadas de viaje con horizonte y sol; pegatinas de maleta como insignias.
- **Riesgo:** muy colorida, compite con las fotos del usuario. Mejor para la parte social que para la galería.

### C · Cuaderno de explorador

El diario de campo con sellos de pasaporte, cinta adhesiva y notas a máquina.

- **Paleta:** kraft `#E7DCC5`, tinta sepia `#3B2F24`, sello rojo `#B23A2E`, sello azul `#2C4A7A`, verde oliva `#6E7447`.
- **Tipografía:** serif clásica (Libre Caslon), notas en máquina de escribir (Courier Prime), anotaciones manuscritas (Caveat) muy puntuales.
- **Toques firma:** sellos de pasaporte al desbloquear países, fotos con cinta y sombra, tickets perforados para reservas, bordes de papel.
- **Riesgo:** lo más "skeuomórfico"; puede verse pesado en escritorio y envejecer rápido.

### D · Carta topográfica suiza

Los mapas swisstopo: blanco, curvas de nivel, rejilla precisa y un único rojo.

- **Paleta:** blanco roto `#FAFAF7`, grafito `#222222`, gris curva `#B9B4A8`, rojo suizo `#D52B1E`, azul lago `#7FA7C9`.
- **Tipografía:** grotesca neutra (Inter o Space Grotesk) en todo, mono para datos.
- **Toques firma:** curvas de nivel como textura de fondo, marcas de registro en las esquinas de las tarjetas, escala gráfica y rosa de los vientos minimalistas.
- **Riesgo:** puede quedar fría; le falta la calidez nostálgica que buscas.

### Toques firma que diferencian la app (válidos para cualquier opción)

La regla: **un solo toque especial por pantalla**, el resto limpio. Así se ve moderno y no disfrazado.

1. **Sello de desbloqueo:** al completar un país o ciudad cae un sello de tinta animado sobre el mapa.
2. **Leyenda viva:** el filtro del mapa es una leyenda de atlas (símbolos para fotos, planes, restaurantes, gastos).
3. **Escudos de ruta:** los días del viaje se numeran como carreteras (D1, D2…) dentro de escudos.
4. **Coordenadas como decoración:** latitud y longitud en mono en las esquinas de fotos y tarjetas.
5. **Transición de pliegue:** al entrar en un país el mapa se "despliega" como un plano de papel.
6. **Grano de papel sutil:** textura al 3–4 % de opacidad solo en fondos grandes, nunca sobre fotos.
7. **Índice A–Z:** la lista de lugares se presenta como el índice de un atlas.

### Modo oscuro

No es negro plano: es un **"mapa nocturno"** con fondo azul tinta `#141B2D`, líneas y textos en crema y los mismos acentos rebajados un 15 %. Tiene que parecer el mismo atlas leído con una lámpara.

## 3. Design system

El sistema se define en tokens semánticos, así cambiar de la opción A a la D es cambiar valores, no componentes. Se documenta en un Storybook propio, igual que Kanso UI.

### Tokens base (ejemplo con la opción A)

| Token           | Claro             | Oscuro            | Uso                                  |
| --------------- | ----------------- | ----------------- | ------------------------------------ |
| `surface.paper` | `#F3EDE0`         | `#141B2D`         | Fondo general                        |
| `surface.card`  | `#FBF8F1`         | `#1C2540`         | Tarjetas y paneles                   |
| `ink.primary`   | `#1F2A44`         | `#EFE7D6`         | Texto principal                      |
| `ink.muted`     | `#6B6A63`         | `#A7A392`         | Texto secundario, metadatos          |
| `line.hairline` | `#D8CFBD`         | `#2E3856`         | Bordes y separadores de 1 px         |
| `accent.route`  | `#C8412B`         | `#D9644F`         | Acción principal, rutas, lo visitado |
| `accent.signal` | `#E8B53A`         | `#E0B654`         | Avisos, planificado, destacados      |
| `accent.park`   | `#5B7B5A`         | `#7E9C7C`         | Confirmado, saldado, naturaleza      |
| `map.fog`       | `#1F2A44` al 55 % | `#000000` al 60 % | Zonas por descubrir                  |

### Tipografía

Escala de 8 pasos: 12 · 14 · 16 · 18 · 22 · 28 · 40 · 64 px. Serif solo en titulares de 28 px en adelante y en nombres de lugar; grotesca para interfaz; mono para coordenadas, fechas, importes y códigos de reserva.

### Forma, espacio y profundidad

- **Espaciado:** base 4 px, escala 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64.
- **Radios pequeños:** 2 px en etiquetas, 6 px en tarjetas, 999 px solo en píldoras y avatares. Nada de esquinas de 24 px "tipo IA".
- **Profundidad sin sombras difusas:** bordes de 1 px y, para lo que flota, una sombra dura desplazada 2 px (efecto impresión). Opción alternativa: sombra muy suave de 8 % si la dura cansa.
- **Rejilla:** 4 columnas en móvil, 8 en tablet, 12 en escritorio, márgenes 16 / 24 / 32 px.

### Iconografía

Dos familias: iconos de interfaz de trazo 1,5 px (base Lucide o Phosphor, retocados) y **símbolos cartográficos propios** para el mapa (mirador, museo, playa, restaurante, alojamiento, transporte, gasto, foto), dibujados como los de un atlas.

### Movimiento

Transiciones de 180–240 ms con curva suave; el mapa vuela entre niveles (mundo → país → ciudad) en 600–900 ms. Animaciones especiales solo en tres momentos: sello de desbloqueo, pliegue de mapa y cierre de cuentas. Todo respeta "reducir movimiento".

### Componentes (atómico)

- **Átomos:** botón (primario, secundario, fantasma, peligro), icono, símbolo de mapa, etiqueta, escudo de ruta, avatar, chip de país con bandera, interruptor, casilla, radio, campo de texto, selector de fecha, cantidad con divisa, barra de progreso, indicador de sincronización, coordenada.
- **Moléculas:** tarjeta de lugar, tarjeta de foto con metadatos, fila de gasto, fila de deuda, selector de participantes, buscador con sugerencias, migas de pan geográficas (Mundo › Japón › Kioto), control de capas del mapa, slider de tiempo, tarjeta de reserva tipo ticket, sello de logro, comentario.
- **Organismos:** barra de navegación (móvil) y barra lateral (escritorio), hoja inferior arrastrable, panel lateral de detalle, mapa con capas, rejilla de fotos, línea de tiempo del itinerario, editor de composición social, formulario de gasto, resumen de balances, feed social, cabecera de perfil.
- **Plantillas:** mapa + hoja (móvil), mapa + panel (escritorio), lista con cabecera grande, editor a pantalla completa, flujo de pasos (onboarding, importación).

### Responsive, táctil y escritorio

| Punto de corte         | Diseño                                                         | Navegación                       |
| ---------------------- | -------------------------------------------------------------- | -------------------------------- |
| < 600 px (móvil)       | Mapa a pantalla completa con hoja inferior de 3 alturas        | Barra inferior de 5 pestañas     |
| 600–1023 px (tablet)   | Mapa + panel lateral plegable                                  | Barra lateral de iconos          |
| ≥ 1024 px (escritorio) | Doble vista: lista o detalle a la izquierda, mapa a la derecha | Barra lateral con texto + atajos |

- **Táctil:** objetivos de 44 × 44 px mínimo, gestos de arrastrar hoja, pellizcar, deslizar para borrar o saldar, pulsación larga para acciones rápidas.
- **Escritorio:** estados hover y foco visibles, menú contextual con clic derecho, arrastrar y soltar fotos y lugares, atajos (`/` buscar, `M` mapa, `N` nuevo, `⌘K` paleta de comandos).
- **Accesibilidad:** contraste AA como mínimo, nunca solo el color para dar significado (la niebla también cambia la textura), textos escalables al 200 %.

## 4. Arquitectura de información

La app tiene cinco secciones fijas y el botón central de captura es el atajo más usado durante un viaje. Gastos, reservas y grupo viven dentro de cada viaje, no como secciones sueltas.

_(Bloque pendiente en el documento original.)_

En móvil es la barra inferior; en tablet y escritorio las mismas cinco secciones pasan a una barra lateral y el mapa queda siempre visible a la derecha. La búsqueda (`/` o `⌘K`) y las notificaciones están en la cabecera de todas las pantallas.

## 5. Pantallas y casos de uso

Son 11 módulos y unas 60 pantallas. Cada pantalla tiene un código (M1.2) para pedirla luego en Claude Design por su nombre. En escritorio casi todas se ven como **doble vista**: contenido a la izquierda, mapa sincronizado a la derecha.

### M0 · Arranque y cuenta

| Código | Pantalla            | Qué se ve                                                         | Acciones                                        |
| ------ | ------------------- | ----------------------------------------------------------------- | ----------------------------------------------- |
| M0.1   | Portada             | Globo cubierto de niebla, logo, lema                              | Empezar, iniciar sesión                         |
| M0.2   | Onboarding          | 3 láminas: recuerda, planifica, comparte                          | Pasar, saltar                                   |
| M0.3   | Registro / login    | Apple, Google, email con enlace mágico                            | Crear cuenta, entrar, recuperar acceso          |
| M0.4   | Permisos            | Por qué pedimos fotos, ubicación y avisos, uno a uno              | Permitir, permitir solo algunas fotos, ahora no |
| M0.5   | Tu base             | País y ciudad de residencia, divisa, idioma                       | Confirmar o cambiar                             |
| M0.6   | Importación inicial | Progreso del escaneo, contador de países y ciudades encontrados   | Pausar, seguir en segundo plano, elegir álbumes |
| M0.7   | Primera revelación  | La niebla se levanta sobre los sitios detectados, primeros sellos | Revisar detecciones, ir al mapa                 |

### M1 · Mapa (inicio)

| Código | Pantalla                 | Qué se ve                                                                      | Acciones                                                          |
| ------ | ------------------------ | ------------------------------------------------------------------------------ | ----------------------------------------------------------------- |
| M1.1   | Mapa mundi               | Niebla sobre lo no visitado, países descubiertos a color, contador de progreso | Zoom, girar globo ↔ plano, buscar, cambiar capas                  |
| M1.2   | Capas y leyenda          | Visitado, fotos, planes, guardados, amigos, niebla, rutas                      | Activar / desactivar cada capa                                    |
| M1.3   | Slider temporal          | Año y mes; el mapa se va encendiendo en orden                                  | Arrastrar, reproducir animación, filtrar por viaje                |
| M1.4   | Ficha de país            | Bandera, % de regiones y ciudades desbloqueadas, viajes, fotos, gasto total    | Ver regiones, ver fotos, planificar viaje, marcar visitado a mano |
| M1.5   | Ficha de región / estado | Ciudades dentro, lo visitado y lo pendiente                                    | Entrar en ciudad, añadir a deseos                                 |
| M1.6   | Ficha de ciudad          | Tus fotos, lugares visitados, barrios, sugerencias                             | Ver en galería, guardar lugares, crear plan                       |
| M1.7   | Ficha de lugar           | Tus fotos exactas ahí, información, horarios, valoraciones, cómo llegar        | Check-in, guardar en lista, añadir a un día del plan              |
| M1.8   | Búsqueda global          | Países, ciudades, lugares, tus viajes, personas                                | Abrir resultado, filtrar por tipo                                 |

### M2 · Exploración y niebla

| Código | Pantalla        | Qué se ve                                                   | Acciones                         |
| ------ | --------------- | ----------------------------------------------------------- | -------------------------------- |
| M2.1   | Tu progreso     | % del mundo, por continente, países, regiones, ciudades, km | Ver detalle por nivel            |
| M2.2   | Pasaporte       | Colección de sellos por país y ciudad, fechas               | Abrir sello, compartir pasaporte |
| M2.3   | Por desbloquear | Lo que te falta cerca de ti y en países ya empezados        | Guardar como deseo, crear plan   |
| M2.4   | Logros y retos  | Retos (todas las capitales de la UE, 5 continentes…)        | Aceptar reto, ver progreso       |
| M2.5   | Mapa de deseos  | Solo los sitios guardados para el futuro                    | Convertir en viaje               |

### M3 · Fotos

| Código | Pantalla                | Qué se ve                                                      | Acciones                                                   |
| ------ | ----------------------- | -------------------------------------------------------------- | ---------------------------------------------------------- |
| M3.1   | Galería por lugar       | Carpetas País › Región › Ciudad › Lugar con portada y contador | Entrar, reordenar, cambiar portada                         |
| M3.2   | Galería por tiempo      | Fotos por año, mes y viaje                                     | Saltar a fecha, seleccionar                                |
| M3.3   | Mapa de fotos           | Miniaturas agrupadas en el mapa                                | Abrir grupo, abrir foto                                    |
| M3.4   | Detalle de foto         | Foto, punto exacto en minimapa, fecha, cámara, viaje           | Corregir ubicación, mover a otro lugar, ocultar, compartir |
| M3.5   | Sin ubicación           | Bandeja de fotos sin GPS, con sugerencias por fecha            | Asignar lugar en lote, descartar                           |
| M3.6   | Revisión de detecciones | Viajes y lugares que la app ha deducido                        | Confirmar, fusionar, dividir, renombrar                    |
| M3.7   | Selección múltiple      | Barra de acciones en lote                                      | Mover, ocultar, añadir a post, borrar de la app            |
| M3.8   | Estado de importación   | Fotos nuevas, pendientes de subir, espacio usado               | Solo wifi, pausar, elegir calidad                          |

### M4 · Mis viajes (diario)

| Código | Pantalla                | Qué se ve                                                 | Acciones                                  |
| ------ | ----------------------- | --------------------------------------------------------- | ----------------------------------------- |
| M4.1   | Lista de viajes         | Pestañas: próximos, en curso, pasados; portadas tipo guía | Abrir, crear, filtrar por año o país      |
| M4.2   | Detalle de viaje pasado | Ruta dibujada, días, fotos, gastos, km, países            | Ver día, editar, compartir, generar recap |
| M4.3   | Día del viaje           | Paradas en orden, fotos del día, notas                    | Añadir nota, reordenar                    |
| M4.4   | Editor de viaje         | Fechas, nombre, portada, participantes                    | Fusionar con otro, dividir, borrar        |
| M4.5   | Recap del viaje         | Resumen animado: mapa, top fotos, cifras                  | Exportar vídeo, crear post                |
| M4.6   | Libro del viaje         | Maquetación tipo guía impresa                             | Exportar PDF, pedir impresión (futuro)    |

### M5 · Planificador

| Código | Pantalla         | Qué se ve                                                             | Acciones                                               |
| ------ | ---------------- | --------------------------------------------------------------------- | ------------------------------------------------------ |
| M5.1   | Nuevo viaje      | Destino, fechas o duración aproximada, compañeros                     | Crear, invitar                                         |
| M5.2   | Guía del destino | Imprescindibles, restaurantes, rutas, barrios, imágenes, consejos     | Guardar lugar, ver en mapa, filtrar                    |
| M5.3   | Listas guardadas | Lugares por lista (comer, ver, dormir)                                | Mover a un día, votar, comentar                        |
| M5.4   | Itinerario       | Días en columna con paradas y tiempos de desplazamiento; mapa del día | Arrastrar paradas, optimizar orden, añadir hueco libre |
| M5.5   | Reservas         | Vuelos, hoteles, trenes, coches, entradas como tickets                | Añadir a mano, reenviar email, adjuntar PDF            |
| M5.6   | Presupuesto      | Estimado vs previsto por categoría                                    | Fijar tope, ver por persona                            |
| M5.7   | Preparativos     | Checklist, maleta, documentos, visados, vacunas, enchufes             | Marcar hecho, asignar tarea                            |
| M5.8   | Mapas offline    | Zonas descargadas y tamaño                                            | Descargar zona, borrar                                 |
| M5.9   | Vista calendario | Semana del viaje en rejilla (escritorio)                              | Arrastrar entre días y horas                           |

### M6 · Modo viaje (en vivo)

| Código | Pantalla            | Qué se ve                                           | Acciones                              |
| ------ | ------------------- | --------------------------------------------------- | ------------------------------------- |
| M6.1   | Iniciar viaje       | Resumen del plan, opciones de tracking y batería    | Empezar, ajustar precisión            |
| M6.2   | Hoy                 | Siguiente parada, hora, cómo llegar, tiempo, agenda | Navegar, saltar parada, cambiar orden |
| M6.3   | Check-in            | Aviso al llegar a un lugar del plan                 | Confirmar, añadir foto o nota         |
| M6.4   | Captura rápida      | Botón central: foto, nota, gasto, lugar nuevo       | Guardar en un toque                   |
| M6.5   | Ubicación del grupo | Dónde está cada miembro (si lo activa)              | Compartir, dejar de compartir         |
| M6.6   | Cierre del día      | Resumen: pasos, sitios, fotos, gasto del día        | Añadir reflexión, compartir día       |
| M6.7   | Fin del viaje       | Recap automático y sellos ganados                   | Revisar, publicar, archivar           |

### M7 · Gastos

| Código | Pantalla          | Qué se ve                                                                         | Acciones                                      |
| ------ | ----------------- | --------------------------------------------------------------------------------- | --------------------------------------------- |
| M7.1   | Resumen           | Total, por persona, por categoría, vs presupuesto                                 | Cambiar divisa de vista                       |
| M7.2   | Añadir gasto      | Importe, divisa, quién pagó, reparto (igual, %, partes, exacto), categoría, lugar | Escanear ticket, guardar                      |
| M7.3   | Lista de gastos   | Por día, con lugar y quién pagó                                                   | Editar, borrar, filtrar                       |
| M7.4   | Balances          | Quién debe a quién, neto                                                          | Recordar a alguien                            |
| M7.5   | Liquidar cuentas  | Mínimo número de pagos para quedar a cero                                         | Marcar pagado, abrir Bizum / PayPal / Revolut |
| M7.6   | Gastos en el mapa | Dónde se gastó cada cosa                                                          | Abrir gasto                                   |
| M7.7   | Exportar          | Resumen por persona                                                               | CSV, PDF, compartir                           |

### M8 · Social y composiciones

| Código | Pantalla                 | Qué se ve                                                                                            | Acciones                                                           |
| ------ | ------------------------ | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| M8.1   | Feed                     | Posts de amigos y seguidos, con mapa mini en cada uno                                                | Me gusta, comentar, guardar lugar                                  |
| M8.2   | Perfil público           | Mapa del usuario, cifras, viajes y posts públicos                                                    | Seguir, ver viaje, copiar itinerario                               |
| M8.3   | Crear post               | Fotos, lugar, texto, privacidad                                                                      | Publicar, programar                                                |
| M8.4   | Estudio de composiciones | Plantillas: postal, collage, ruta en mapa, carrusel 4:5, story 9:16, póster de ciudad, resumen anual | Mezclar tus fotos con imágenes del lugar, cambiar estilo, exportar |
| M8.5   | Compartir fuera          | Previa por destino (Instagram, TikTok, WhatsApp)                                                     | Exportar, copiar enlace                                            |
| M8.6   | Amigos                   | Solicitudes, sugerencias, contactos                                                                  | Añadir, aceptar, bloquear                                          |
| M8.7   | Notificaciones           | Menciones, invitaciones, deudas, logros                                                              | Abrir, marcar leído                                                |

### M9 · Grupos de viaje

| Código | Pantalla         | Qué se ve                         | Acciones                     |
| ------ | ---------------- | --------------------------------- | ---------------------------- |
| M9.1   | Invitar          | Enlace, QR, contactos             | Enviar invitación, fijar rol |
| M9.2   | Miembros y roles | Organizador, editor, lector       | Cambiar rol, expulsar        |
| M9.3   | Votaciones       | Opciones de lugar, hotel o fecha  | Votar, cerrar votación       |
| M9.4   | Álbum del grupo  | Fotos de todos, por autor y lugar | Subir, descargar todo        |
| M9.5   | Conversación     | Comentarios por lugar y por día   | Responder, mencionar         |

### M10 · Perfil y ajustes

| Código | Pantalla               | Qué se ve                                                                              | Acciones                 |
| ------ | ---------------------- | -------------------------------------------------------------------------------------- | ------------------------ |
| M10.1  | Mi perfil              | Cabecera con mapa, cifras, pasaporte                                                   | Editar, ver como público |
| M10.2  | Privacidad             | Perfil público o privado, ubicación exacta o aproximada, quitar metadatos al compartir | Ajustar por defecto      |
| M10.3  | Fotos y almacenamiento | Carpetas escaneadas, copia en la nube, calidad                                         | Cambiar, liberar espacio |
| M10.4  | Mapa                   | Proveedor (automático por región), unidades, estilo                                    | Elegir                   |
| M10.5  | General                | Idioma, divisa base, tema claro / oscuro / auto, avisos                                | Cambiar                  |
| M10.6  | Suscripción            | Plan gratis vs premium                                                                 | Mejorar, gestionar       |
| M10.7  | Datos                  | Exportar todo, borrar cuenta                                                           | Descargar, borrar        |

### Estados que diseñar en todas las pantallas

Cada pantalla necesita cinco versiones: **vacía** (con invitación a actuar), **cargando** (esqueletos con forma de mapa y tarjeta), **sin conexión** (aviso discreto y datos locales), **error** (qué pasó y cómo seguir) y **con mucho contenido** (500 fotos, 30 días, 12 personas).

## 6. Decisiones abiertas y funcionalidades extra

Hay ocho decisiones que conviene cerrar antes de diseñar, porque cambian pantallas enteras. Marco mi recomendación, pero todas son válidas.

### Decisiones para elegir

| Decisión                  | Opciones                                                                                           | Recomendación                                                                                 |
| ------------------------- | -------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Estilo visual             | A Atlas de carretera · B Póster mid-century · C Cuaderno explorador · D Topográfico suizo          | A con la limpieza de D                                                                        |
| Nombre                    | Atlas · Stamped · Terra Nota · Wayfarer · Sello · algo propio                                      | Decidir tras ver el estilo; comprobar marca y dominio                                         |
| Barra móvil (5)           | Mapa · Viajes · + Captura · Fotos · Perfil — o — Mapa · Explorar · Viajes · Social · Perfil        | La primera: el botón central de captura es el gesto más usado en viaje                        |
| Cómo se levanta la niebla | Por país › región › ciudad (administrativo) · por celdas hexagonales según dónde estuviste · ambas | Ambas: administrativo para el progreso, hexágonos para la niebla visual                       |
| Dónde viven las fotos     | Solo en el móvil · copia completa en la nube · miniaturas en nube y originales en el móvil         | Híbrido: privacidad y coste bajo, y funciona en escritorio                                    |
| Datos de la guía          | Google Places · Foursquare · OpenStreetMap + Wikivoyage · comunidad propia                         | OSM + Wikivoyage de base, Foursquare para restaurantes, comunidad encima                      |
| Red social                | Abierta con seguidores · solo amigos · perfiles públicos opcionales                                | Solo amigos por defecto, perfil público opcional                                              |
| Modelo de negocio         | Gratis con anuncios · freemium · pago único                                                        | Freemium: gratis el mapa y fotos; premium para planificador avanzado, recaps en vídeo y libro |

### Funcionalidades por fases

| Fase         | Funcionalidades                                                                                                                                                                                                                       |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| MVP          | Importar carrete y leer GPS / fecha · mapa con niebla y fichas de país a lugar · galería por lugar y tiempo · viajes detectados automáticamente · pasaporte de sellos · tarjeta para compartir                                        |
| V2           | Planificador con guía e itinerario · reservas · modo viaje con check-ins · gastos y liquidación · grupos e invitaciones · mapas offline                                                                                               |
| V3           | Feed social y perfiles · estudio de composiciones completo · recap en vídeo con vuelo 3D · resumen anual tipo "Wrapped" · libro impreso                                                                                               |
| Más adelante | Revivir foto en realidad aumentada · widgets de iOS y Android · recuerdos "hace 3 años estabas aquí" · importar historial de Google Maps · reservas leídas del email · alertas de precio de vuelos · frases útiles y divisas del país |

Empezar por el MVP tiene una razón: el "momento mágico" (abrir la app y ver tu mundo desbloqueado con tus fotos) funciona sin nada social, y es lo que engancha.

## 7. Flujo de trabajo: de la idea al código

Todo el diseño se hace en **Claude Design** y el código en **Claude Code**; Figma es opcional para retoques finos. No hacen falta v0 ni otras herramientas: el truco no es la herramienta, es darle un design system fijo antes de pedir pantallas.

1. **Elegir estilo (1 sesión).** En Claude Design pide la misma pantalla (M1.4, ficha de país) en las cuatro opciones de la sección 2, en móvil y escritorio. Comparar la misma pantalla es la única forma justa de elegir.
2. **Crear el design system (1–2 sesiones).** Con el estilo elegido, pide una lámina de sistema: tokens, tipografía, iconos, símbolos de mapa y todos los átomos y moléculas de la sección 3, en claro y oscuro. Guárdalo como **Design System** y márcalo por defecto: así cada pantalla nueva lo usa sin repetírselo.
3. **Diseñar el flujo del MVP.** M0 completo → M1.1 a M1.7 → M2.1 y M2.2 → M3.1 a M3.6 → M4.1 y M4.2. Pide de 3 a 5 pantallas por mensaje, siempre por código, siempre móvil + escritorio.
4. **Estados.** Una tanda solo para vacío, cargando, sin conexión y error de las pantallas clave.
5. **Prototipo y prueba.** Enlaza el flujo "abro la app por primera vez y veo mi mundo" y enséñaselo a 5 personas que viajen. Lo que no entiendan, se rediseña antes de programar.
6. **Resto de módulos.** M5 a M10 con el mismo método.
7. **Figma (opcional).** Tienes Figma conectado; si quieres pulir a mano o pasar a otro diseñador, se exportan ahí.
8. **Código con Claude Code.** Primero el design system como paquete propio con Storybook (reutiliza la estructura de Kanso UI y cambia el tema), después las features en el orden del MVP.

**Qué te va a entregar Claude Design:** pantallas editables en un lienzo, con variantes, que puedes retocar tú mismo, comentar y compartir por enlace o exportar a PDF o imagen. **Qué no:** la lógica real (lectura de fotos, mapas vivos, sincronización), que llega en la fase de código.

### Decidido: el design system será una librería propia y pública

El sistema **Atlas — Cuaderno de explorador** (estilo C) pasa a ser parte de la documentación del proyecto y una librería propia. En la fase de código se publicará como paquete (`packages/design-system`) con su propia web de documentación interactiva tipo Storybook, como Kanso UI: accesible en modo desarrollo y, cuando esté estable, pública para que cualquiera pueda ver y probar los componentes.

## 8. Prompts, en orden de uso

Los cuatro primeros van a Claude Design; el quinto a Claude Code. En cada uno adjunta este documento (o pega las secciones indicadas): es el contexto completo y evita repetir todo.

### Prompt 1 · Comparar estilos (Claude Design)

```text
Adjunto la especificación de Atlas, una app de viajes con mapa que se desbloquea con tus fotos, planificador, modo viaje, gastos compartidos y social. Lee las secciones 1 y 2.

Diseña la pantalla M1.4 "Ficha de país" (Japón: 38 % de regiones, 11 ciudades, 2 viajes, 640 fotos) en las 4 direcciones de arte A, B, C y D, cada una en móvil (390 × 844) y escritorio (1440 × 900, doble vista con el mapa a la derecha).

Reglas: estructura minimalista y moderna, mucho aire, un solo toque especial por pantalla. Nada de glassmorphism, degradados morados, esquinas de 24 px ni tarjetas genéricas. Usa las paletas y fuentes exactas de la sección 2. Debajo de cada versión, en 2 líneas, qué la hace distinta.
```

### Prompt 2 · Design system (Claude Design)

```text
Elijo la dirección [A / B / C / D] con estos ajustes: [tus cambios].

Crea el design system de Atlas según la sección 3 del documento: tokens de color en claro y "mapa nocturno", escala tipográfica, espaciado, radios, bordes y profundidad, iconos de interfaz y los 8 símbolos cartográficos, y todos los átomos y moléculas listados, cada uno con sus estados (normal, hover, pulsado, foco, deshabilitado, cargando, error).

Incluye una lámina de los toques firma (sello de desbloqueo, leyenda viva, escudos de ruta, coordenadas, grano de papel) con la regla de cuándo se usa cada uno. Muestra cada componente en táctil (objetivo de 44 px) y escritorio. Guárdalo para que sea el sistema por defecto de todas las pantallas siguientes.
```

### Prompt 3 · Pantallas por tandas (Claude Design, repetir por módulo)

```text
Usando solo el design system de Atlas, diseña estas pantallas de la sección 5: [M0.1, M0.3, M0.4, M0.6, M0.7].

Para cada una: móvil y escritorio, con datos realistas (nombres, lugares, fechas y cifras creíbles, nada de lorem ipsum), la versión con contenido y la versión vacía. Respeta la navegación de la sección 4. Si una pantalla necesita un componente que no existe en el sistema, créalo siguiendo sus reglas y avísame para añadirlo.
```

Orden de tandas recomendado: M0 → M1 → M2 → M3 → M4 → estados → M5 → M6 → M7 → M9 → M8 → M10.

### Prompt 4 · Momentos especiales (Claude Design)

```text
Diseña las 3 animaciones firma de Atlas como secuencias de 4–6 fotogramas en móvil: 1) la niebla se levanta y cae el sello al desbloquear un país; 2) el mapa se despliega como un plano al entrar en una ciudad; 3) las cuentas del grupo quedan a cero. Indica duración y curva de cada paso según la sección 3.
```

### Prompt 5 · Arquitectura y plan técnico (Claude Code)

```text
Adjunto la especificación completa de Atlas y los diseños aprobados. Actúa como arquitecto principal. Antes de escribir código, entrégame un plan técnico en Markdown:

1. Stack para iOS, Android y escritorio/web con un solo código. Compara al menos Expo (React Native + web) y Flutter, y recomienda uno con motivos.
2. Mapas: proveedor global (Mapbox vs MapLibre con teselas propias), proveedor para China (Amap o Baidu) y conversión WGS-84 ↔ GCJ-02 detrás de una única interfaz.
3. Fotos: lectura de GPS y fecha de 15.000+ fotos en nativo y por lotes sin bloquear la interfaz, detección automática de viajes, y almacenamiento híbrido (miniaturas en nube, originales en el dispositivo).
4. Niebla: cálculo por país/región/ciudad y por celdas hexagonales (H3), y cómo se dibuja rápido.
5. Offline-first y sincronización con resolución de conflictos (planes, check-ins, gastos).
6. Gastos: modelo de reparto, divisas con tipo de cambio del día del gasto y algoritmo de liquidación mínima.
7. Modelo de datos completo (usuarios, viajes, lugares jerárquicos, fotos, planes, reservas, gastos, grupos, posts).
8. Estructura del repositorio: monorepo con packages/design-system (tokens y componentes atómicos con Storybook), packages/domain (lógica pura sin UI), apps/mobile y apps/web; dentro, carpetas por feature (map, exploration, photos, trips, planner, live-trip, expenses, social, groups, settings), cada una con ui, hooks, services, store y tests. Utils y tipos compartidos aparte.
9. Calidad: tests unitarios del dominio, de componentes y de extremo a extremo; CI; accesibilidad.
10. Riesgos técnicos con su mitigación, y costes mensuales estimados para 1.000, 10.000 y 100.000 usuarios (mapas, almacenamiento, base de datos, APIs de lugares y divisas).
11. Roadmap por sprints alineado con las fases MVP, V2 y V3 del documento.

Señala cada decisión que dependa de mí en vez de asumirla.
```

## 9. APIs y servicios externos

Casi toda la app puede funcionar con servicios gratuitos o de datos abiertos. Solo cuesta dinero la información rica de lugares (valoraciones, reseñas, fotos de Google o Foursquare), y ahí los propios proveedores dan cupos mensuales gratis. La decisión que más ahorra: **detectar país, región y ciudad de las fotos dentro del móvil**, con límites administrativos descargados, sin llamar a ninguna API. Es gratis, privado y funciona sin conexión.

Precios consultados en septiembre de 2026; cambian a menudo, así que conviene revisarlos antes de lanzar.

### Mapas y rutas

| Necesidad                                | Recomendado                                                                       | Gratis                            | Alternativa y notas                                                                                                        |
| ---------------------------------------- | --------------------------------------------------------------------------------- | --------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Mapa base con nuestro estilo             | MapLibre + OpenFreeMap                                                            | Sin límite, sin clave ni registro | Sin garantía de servicio: autoalojarlo si la app crece. Mapbox: 50.000 cargas web y 25.000 usuarios activos móviles al mes |
| Mapa en China                            | Amap (Gaode)                                                                      | Con clave de desarrollador        | Coordenadas GCJ-02: hay que convertir desde WGS-84. Baidu exige teléfono chino y licencia de empresa                       |
| País, región y ciudad de cada foto       | Límites de Natural Earth y geoBoundaries + ciudades de GeoNames, dentro del móvil | Datos abiertos, 0 llamadas        | Nominatim (OSM) solo para casos sueltos: limita a 1 petición por segundo                                                   |
| Buscar direcciones y lugares al escribir | Mapbox Search / Geocoding                                                         | 100.000 peticiones al mes         | Solo uso temporal: al guardar, el lugar se asocia a su registro de Overture. Google Autocomplete: 10.000 al mes            |
| Rutas y tiempos entre paradas            | Mapbox Directions                                                                 | 100.000 peticiones al mes         | OpenRouteService (plan gratuito con cupo diario)                                                                           |

### Lugares, valoraciones y guía

| Necesidad                                                | Recomendado                                                        | Gratis                                                   | Alternativa y notas                                                                                                                                                 |
| -------------------------------------------------------- | ------------------------------------------------------------------ | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Base de lugares del mundo (pines del mapa, listas, guía) | Overture Maps Places, descargado en nuestro servidor               | Más de 64 millones de lugares con licencias abiertas     | Se publica cada mes y cada versión solo se guarda 60 días: hay que descargarla periódicamente. Es lo único que podemos pintar en nuestro mapa y guardar sin límites |
| Nota media y número de valoraciones                      | Google Place Details, solo los campos de nota (tarifa Enterprise)  | 1.000 fichas al mes                                      | Después, 20 $ cada 1.000. Se pide solo al abrir la ficha de un lugar                                                                                                |
| Fotos de Google del sitio                                | Google Place Details (lista de fotos) + Place Photos (cada imagen) | Pedir la lista de fotos es gratis; 1.000 imágenes al mes | Después, 7 $ cada 1.000 imágenes. Hay que mostrar el autor de cada foto                                                                                             |
| Enlazar a Google Maps                                    | Enlaces de Google Maps y Maps Embed                                | Gratis                                                   | Abre la ficha real con reseñas, horarios y más fotos sin pagar llamadas                                                                                             |
| Descripciones y consejos                                 | Wikipedia, Wikivoyage y Wikidata                                   | Gratis, licencia CC BY-SA                                | Wikivoyage es la guía de viajes abierta: qué ver, comer, moverse                                                                                                    |
| Imágenes de destinos al planificar                       | Wikimedia Commons                                                  | Gratis, con atribución                                   | Unsplash: 50 peticiones por hora en pruebas y 5.000 en producción. Pexels: 200 por hora y 20.000 al mes                                                             |

**Reglas de Google que condicionan el diseño:** solo podemos guardar el identificador del lugar (place_id), nunca la nota ni las fotos, así que cada vez que se muestran se vuelven a pedir. Los datos de Google no se pueden pintar sobre un mapa que no sea de Google; fuera de un mapa, hay que mostrar su logo. En la práctica: los pines del mapa salen de Overture, y la nota media y las fotos de Google aparecen solo dentro de la ficha del lugar, con el logo de Google. Foursquare es la alternativa: 500 llamadas gratis, luego 15 $ cada 1.000.

### Fotos del usuario

| Necesidad                       | Recomendado                   | Gratis | Notas                                                                                                  |
| ------------------------------- | ----------------------------- | ------ | ------------------------------------------------------------------------------------------------------ |
| Leer el carrete con GPS y fecha | APIs nativas de iOS y Android | Sí     | Es la vía principal de importación                                                                     |
| Importar desde Google Fotos     | Google Photos Picker API      | Sí     | Desde el 31 de marzo de 2025 no se puede leer toda la biblioteca: el usuario elige qué fotos compartir |

### Utilidades de viaje

| Necesidad                                 | Recomendado                    | Gratis                                              | Alternativa y notas                                                                                                |
| ----------------------------------------- | ------------------------------ | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Tipos de cambio                           | Frankfurter (BCE)              | Sin clave ni cupo, histórico desde 1999             | Solo unas 30 divisas. Para el resto, open.er-api.com: más de 160 divisas, se actualiza a diario y exige atribución |
| Tiempo en destino                         | Open-Meteo                     | Hasta 10.000 llamadas al día, solo uso no comercial | Con plan premium hay que pagar su licencia comercial, u OpenWeatherMap: 1.000 llamadas al día gratis               |
| Datos de países (moneda, idioma, prefijo) | REST Countries + Natural Earth | Gratis                                              | Se puede guardar en la propia app                                                                                  |

### Compartir

| Necesidad              | Recomendado                       | Gratis | Notas                                                                                         |
| ---------------------- | --------------------------------- | ------ | --------------------------------------------------------------------------------------------- |
| Historias de Instagram | Instagram Sharing to Stories      | Sí     | Requiere un Facebook App ID registrado. Imagen de al menos 720 × 1280 px; vídeo de hasta 20 s |
| Feed, Reels, TikTok    | Hoja de compartir del sistema     | Sí     | Exportamos la imagen o el vídeo y el usuario elige la app                                     |
| WhatsApp               | Enlaces wa.me y hoja de compartir | Sí     | No hace falta la API de WhatsApp Business, que es de pago por mensaje                         |

### Cómo mantener el coste cerca de cero

1. **Overture como base y Google solo bajo demanda.** Las listas y el mapa salen de nuestros datos; Google o Foursquare solo se llaman al abrir la ficha de un lugar concreto.
2. **Guardar y reutilizar.** Tipos de cambio una vez al día, descripciones de Wikipedia y fotos de Commons en nuestra base. De Google solo se guarda el place_id; su nota y sus fotos se piden cada vez que se abre la ficha.
3. **Todo lo del usuario, en el móvil.** Lectura de fotos, detección de lugares y niebla se calculan en el dispositivo.
4. **Atribuciones visibles.** OpenStreetMap, Unsplash, Wikimedia, open.er-api y Open-Meteo lo exigen: un apartado "Créditos" en Ajustes y la marca en el mapa.

### Fuentes

Google Maps Platform, precios · Precios de Places API por SKU · Mapbox, precios · OpenFreeMap · Overture Places · Foursquare, precios · Unsplash, límites · Pexels · Google Photos, cambios de API · Frankfurter · open.er-api · Open-Meteo, términos · OpenWeatherMap vs Open-Meteo · Instagram Sharing to Stories · Mapas en China

## 10. Importar reservas

La vía recomendada es **reenviar el correo de confirmación a una dirección personal de la app**, como hacen TripIt y Wanderlog: es gratis, funciona con cualquier proveedor y no pide acceso al buzón. Conectar Gmail directamente queda para más adelante, porque exige una auditoría de seguridad de pago que se repite cada año.

### Formas de meter una reserva

| Vía                      | Cómo funciona para el usuario                                                                             | Coste para nosotros                                                                                                 | Cuándo                            |
| ------------------------ | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| Reenviar el correo       | Reenvía la confirmación a su dirección, tipo marta@viajes.atlas.app; la reserva aparece en su viaje       | Recepción ilimitada y gratis con Cloudflare Email Routing                                                           | MVP de V2                         |
| Compartir desde el móvil | En la app de Booking, la aerolínea o el correo, pulsa Compartir › Atlas con el PDF, la captura o el texto | Gratis                                                                                                              | MVP de V2                         |
| Subir archivo            | Arrastra un PDF, una captura o un archivo .ics de calendario (escritorio)                                 | Gratis                                                                                                              | MVP de V2                         |
| A mano                   | Formulario de vuelo, alojamiento, coche, tren o entrada, con autocompletado de aeropuertos y lugares      | Gratis                                                                                                              | Siempre disponible                |
| Conectar Gmail           | La app busca sola las confirmaciones en el buzón                                                          | Permiso de lectura de correo "restringido": auditoría de seguridad externa de cuatro cifras, renovada cada 12 meses | Solo si el reenvío se queda corto |

Booking, Airbnb y las aerolíneas no ofrecen una API para leer las reservas de un usuario, así que el correo es la fuente común a todos.

### Cómo se leen los correos

1. **Datos estructurados primero.** Muchas aerolíneas, hoteles y agencias incluyen en sus correos un bloque schema.org (FlightReservation, LodgingReservation, RentalCarReservation…) con localizador, fechas, aeropuertos y dirección. Si está, se lee exacto y gratis.
2. **Plantillas por proveedor** para los más usados que no lo incluyen.
3. **IA como último recurso** para el resto de correos, PDFs y capturas: extrae los campos y marca su nivel de confianza. Es de pago por uso, pero solo se usa cuando fallan los dos pasos anteriores.

### Reglas: todo se puede modificar

- Cada reserva importada se convierte en un Ticket normal y **todos sus campos son editables**: fechas, horas, lugar, código, precio, participantes, notas y adjuntos.
- Si algo no se leyó con seguridad, la reserva entra como **"Por revisar"** (discontinua azul) con los campos dudosos marcados.
- **Lo que edita el usuario manda.** Si luego llega un correo de cambio o cancelación, la app propone la actualización y pregunta; nunca sobrescribe sola un campo editado a mano.
- Se asigna sola al viaje por fechas y destino; si no encaja con ninguno, propone crear uno. Siempre se puede mover a otro viaje.
- Detecta duplicados (mismo localizador) y los fusiona.
- Se ve de dónde vino (correo, archivo, a mano) y se puede abrir el original.
- Opcional: crear el gasto automáticamente con el precio de la reserva y repartirlo con el grupo.
- Se comparte con los compañeros del viaje según su rol, y se puede borrar o archivar.

**Privacidad:** los correos se procesan y se borran; solo se guardan los campos de la reserva y, si el usuario quiere, el PDF adjunto.

### Fuentes

Campos de Places API y su tarifa · Precios de Google Maps Platform por SKU · Políticas de Places API · Qué se puede guardar de cada API de lugares · Marcado de reservas de vuelo · Marcado de reservas de hotel · Cloudflare Email Routing, precios · Permisos de la API de Gmail · Auditoría CASA

## 11. Plan del MVP

El MVP es **"tu mundo desbloqueado con tus fotos"**: una app móvil que lee tu carrete, te muestra en un mapa precioso todo lo que has vivido y te deja compartirlo. Sin planificador, sin gastos y sin red social todavía. Si ese momento no engancha, nada de lo demás importa; si engancha, es la puerta de entrada a todo lo demás.

### La apuesta que queremos comprobar

Que un viajero con miles de fotos, al abrir la app por primera vez, **en menos de dos minutos vea su mapa desbloqueado, se reconozca en él y quiera compartirlo**. Todo lo que no ayuda a comprobar esto queda fuera.

### Qué entra y qué no

| Entra en el MVP                                                                                                 | Se queda para después                                      |
| --------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Cuenta con Apple, Google o email (M0)                                                                           | Planificador, guía e itinerario (M5)                       |
| Importación del carrete con GPS y fecha, dentro del móvil (M0.6, M3.8)                                          | Importar reservas (sección 10)                             |
| Detección sin conexión de país, región y ciudad                                                                 | Modo viaje en vivo y check-ins (M6)                        |
| Mapa mundi con niebla por país, región y ciudad (M1.1–M1.3)                                                     | Gastos y liquidación (M7)                                  |
| Fichas de país, región y ciudad con tus fotos (M1.4–M1.6)                                                       | Grupos, votaciones y álbum compartido (M9)                 |
| Galería por lugar y por tiempo, detalle de foto y bandeja sin ubicación (M3.1–M3.5)                             | Feed social, amigos y perfiles públicos (M8.1, M8.2, M8.6) |
| Viajes detectados solos, con revisión: confirmar, fusionar, dividir, renombrar (M3.6, M4.1, M4.2)               | Nota y fotos de Google, datos de Overture (sección 9)      |
| Progreso y pasaporte de sellos (M2.1, M2.2)                                                                     | Niebla por hexágonos, retos y logros                       |
| Tarjetas para compartir: historia 9:16 y post 4:5, a Instagram, WhatsApp y hoja del sistema (M8.4 básico, M8.5) | Recap en vídeo, libro impreso, realidad aumentada          |
| Ajustes, privacidad y exportar o borrar datos (M10.2, M10.3, M10.5, M10.7)                                      | Mapas de China, suscripción premium                        |

### Plataformas

**Primero iOS y Android**, porque las fotos viven en el móvil. La web de escritorio llega justo después como visor de tu mapa y tus viajes (con miniaturas sincronizadas), y crece en V2 cuando llegue el planificador, que es donde el escritorio brilla. El design system ya está pensado para ambos, así que no hay que rediseñar.

### Hoja de ruta

Fases de unas dos semanas cada una; la duración real depende de cuántas horas le dediques.

_(Bloque pendiente en el documento original.)_

Las fases van en orden porque cada una usa la anterior: sin mapa no hay dónde pintar las fotos, y sin fotos no hay viajes que detectar. La beta solo empieza cuando la importación es rápida de verdad.

### Cómo sabremos si funciona

| Métrica                                                 | Objetivo en la beta |
| ------------------------------------------------------- | ------------------- |
| Personas que terminan la importación                    | 8 de cada 10        |
| Tiempo hasta ver el mapa desbloqueado con 10.000 fotos  | Menos de 2 minutos  |
| Viajes detectados que se aceptan sin corregir           | 7 de cada 10        |
| Personas que comparten una tarjeta en su primera semana | 3 de cada 10        |
| Personas que vuelven a abrir la app a los 30 días       | 3 de cada 10        |

Son objetivos de partida para una beta de 30 a 50 viajeros; se ajustan con los primeros datos.

### Riesgos del MVP y cómo los atajamos

- **Importación lenta o que se cuelga con carretes enormes.** Se lee por lotes en código nativo, mostrando el mapa en cuanto hay datos, y se prueba desde el primer día con un carrete de 15.000 fotos.
- **Viajes mal detectados.** Reglas simples (salir de tu ciudad base, huecos de más de dos días) y pantalla de revisión muy cómoda; lo que el usuario corrige, la app lo aprende.
- **Permiso de "solo algunas fotos" en iOS.** La app funciona igual con acceso limitado y explica, sin insistir, qué gana dando acceso completo.
- **Que la niebla no emocione.** Se valida con el prototipo de Claude Design y 5 personas antes de programar (sección 7, paso 5).

### Coste de lanzar el MVP

Prácticamente cero en servicios: mapa con OpenFreeMap, datos de límites abiertos, detección en el móvil y ninguna API de pago. Lo único fijo son las cuentas de desarrollador de Apple y Google y el alojamiento de la base de datos y las miniaturas, que en una beta cabe en planes gratuitos de arranque.

## 12. Historias de usuario del MVP

Son 30 historias en 9 épicas. Cada una dice quién, qué y para qué, qué pantallas toca y cuándo se da por terminada. Los criterios de aceptación son los que Claude Code tendrá que cumplir y probar.

Persona principal: **Marta, 31 años**, viaja 3 o 4 veces al año, tiene 14.000 fotos en el móvil y nunca las ordena.

### E1 · Cuenta y arranque

- **HU-01 · Entender la app en segundos.** Como persona que acaba de instalar la app quiero ver qué hace antes de registrarme, para decidir si me interesa. _M0.1, M0.2_
  - La portada muestra el globo con niebla y dos acciones: Empezar e Iniciar sesión.
  - El onboarding tiene 3 láminas y se puede saltar desde la primera.
- **HU-02 · Registrarme sin fricción.** Como persona nueva quiero entrar con Apple, Google o mi email, para no crear otra contraseña. _M0.3_
  - Apple y Google en un toque; el email recibe un enlace mágico que caduca a los 15 minutos.
  - Si el email ya existe, entra en la cuenta en vez de dar error.
  - Un error de red dice qué pasó y deja reintentar sin perder lo escrito.
- **HU-03 · Dar permisos sabiendo por qué.** Como usuaria quiero que me expliquen cada permiso antes de pedirlo, para confiar en la app. _M0.4_
  - Fotos se pide primero, con su explicación; ubicación y avisos se pueden posponer.
  - Con "solo algunas fotos" en iOS la app sigue funcionando e indica cómo ampliar el acceso.
  - Si se niega el acceso a fotos, la app ofrece marcar países a mano.
- **HU-04 · Fijar mi base.** Como usuaria quiero indicar dónde vivo, para que la app distinga mis viajes de mi día a día. _M0.5_
  - Se propone la ciudad con más fotos como base; se puede cambiar.
  - La divisa y el idioma salen del país de la base y se pueden cambiar.

### E2 · Importación y detección

- **HU-05 · Importar mi carrete sin esperar.** Como usuaria con miles de fotos quiero que la app las lea sola, para ver mi mapa sin hacer nada. _M0.6, M3.8_
  - 10.000 fotos se procesan en menos de 2 minutos en un móvil de gama media de 2023.
  - El mapa empieza a mostrarse en cuanto hay datos, sin esperar al final.
  - La importación sigue en segundo plano y se puede pausar.
  - La app no se cierra ni se congela con 15.000 fotos.
- **HU-06 · Detectar dónde hice cada foto.** Como usuaria quiero que cada foto con GPS se asigne a su país, región y ciudad, para verlas ordenadas solas. _—_
  - La detección funciona sin conexión.
  - Al menos 98 de cada 100 fotos con GPS caen en el país correcto y 95 en la región correcta.
  - Las fotos sin GPS van a la bandeja Sin ubicación.
- **HU-07 · Ver fotos nuevas sin volver a importar.** Como usuaria quiero que las fotos que haga después aparezcan solas, para no tener que acordarme. _M3.8_
  - Al abrir la app se procesan solo las fotos nuevas.
  - Hay opción de subir miniaturas solo con wifi.

### E3 · Mapa

- **HU-08 · Ver mi mundo desbloqueado.** Como usuaria quiero abrir el mapa y ver en color lo que he visitado y con niebla lo que no, para sentir mi progreso. _M0.7, M1.1_
  - La primera vez, la niebla se levanta con animación sobre los sitios detectados y cae el primer sello.
  - Países, regiones y ciudades visitados se ven desbloqueados; el resto con niebla.
  - El mapa se mueve con fluidez con 10.000 fotos agrupadas.
- **HU-09 · Viajar en el tiempo.** Como usuaria quiero mover un deslizador de años, para ver cómo fue creciendo mi mapa. _M1.3_
  - Al mover el año, el mapa muestra solo lo desbloqueado hasta esa fecha.
  - Botón de reproducir que recorre los años.
- **HU-10 · Elegir qué veo.** Como usuaria quiero activar y desactivar capas, para ver solo lo que me interesa. _M1.2_
  - Capas del MVP: desbloqueado, niebla, fotos y rutas de viajes.
- **HU-11 · Entrar en un país, una región o una ciudad.** Como usuaria quiero tocar un lugar y ver su ficha, para revivir lo que hice allí. _M1.4, M1.5, M1.6_
  - La ficha muestra migas geográficas, cifras (porcentaje desbloqueado, ciudades, viajes, fotos), viajes y fotos.
  - Muestra también lo que falta por desbloquear en ese lugar.
  - En escritorio, ficha a la izquierda y mapa sincronizado a la derecha.
- **HU-12 · Marcar un sitio a mano.** Como usuaria quiero marcar como visitado un país o ciudad del que no tengo fotos, para que mi mapa sea completo. _M1.4_
  - Se marca desde la ficha con fecha aproximada opcional, y se desmarca igual.
  - Lo marcado a mano se distingue de lo detectado por fotos.
- **HU-13 · Buscar un lugar.** Como usuaria quiero buscar un país, ciudad o viaje por su nombre, para ir directo. _M1.8_
  - Resultados mientras escribo, agrupados por tipo; `/` abre la búsqueda en escritorio.

### E4 · Exploración y pasaporte

- **HU-14 · Ver mi progreso.** Como usuaria quiero ver cuánto he descubierto del mundo, para marcarme nuevos objetivos. _M2.1_
  - Porcentaje del mundo y por continente, número de países, regiones y ciudades.
- **HU-15 · Coleccionar sellos.** Como usuaria quiero un sello por cada país y ciudad desbloqueados, para tener mi pasaporte de viajera. _M2.2_
  - Sello redondo por país y rectangular por ciudad, con la fecha de la primera foto.
  - El pasaporte se ordena por fecha o por continente y se puede compartir.

### E5 · Fotos

- **HU-16 · Ver mis fotos por lugar.** Como usuaria quiero ver mis fotos en carpetas País › Región › Ciudad › Lugar, para encontrar cualquier recuerdo. _M3.1_
  - Las carpetas se crean solas, con portada y contador de fotos y días.
  - Puedo cambiar la portada de una carpeta.
- **HU-17 · Ver mis fotos por tiempo.** Como usuaria quiero ver mis fotos por año, mes y viaje, para recordar cuándo pasó cada cosa. _M3.2_
  - Saltar a un año o mes concreto desde un índice lateral.
- **HU-18 · Ver dónde hice una foto y corregirlo.** Como usuaria quiero ver el punto exacto de una foto y cambiarlo si está mal, para que mi mapa sea fiel. _M3.4_
  - El detalle muestra foto, minimapa con el punto, fecha, cámara y viaje.
  - Corregir la ubicación actualiza carpetas, viajes, niebla y sellos al momento.
- **HU-19 · Colocar fotos sin ubicación.** Como usuaria quiero asignar lugar a las fotos sin GPS, para que no se queden fuera. _M3.5_
  - La app sugiere lugar por fecha (fotos cercanas en el tiempo con GPS).
  - Se puede asignar en lote o descartar.
- **HU-20 · Ocultar fotos.** Como usuaria quiero ocultar fotos de la app sin borrarlas del móvil, para que no salgan en mi mapa ni al compartir. _M3.7_
  - Ocultar nunca borra la foto del carrete.

### E6 · Viajes

- **HU-21 · Tener mis viajes detectados.** Como usuaria quiero que la app agrupe mis fotos en viajes sola, para no organizarlos yo. _M4.1, M3.6_
  - Un viaje es un periodo lejos de mi base; huecos de más de 2 días sin fotos lo cortan.
  - Cada viaje recibe un nombre propuesto ("Kioto, Nara y Osaka"), fechas y portada.
  - Lista de viajes con pestañas Próximos, En curso y Pasados, filtrable por año y país.
- **HU-22 · Corregir un viaje.** Como usuaria quiero confirmar, renombrar, fusionar o dividir viajes, para que reflejen lo que viví. _M3.6, M4.4_
  - Todas las acciones se pueden deshacer.
  - Lo que corrijo no se vuelve a tocar en importaciones posteriores.
- **HU-23 · Revivir un viaje.** Como usuaria quiero abrir un viaje y ver su ruta en el mapa, sus días y sus fotos, para recordarlo entero. _M4.2_
  - Ruta dibujada en línea continua entre las ciudades en orden.
  - Cifras del viaje: días, ciudades, países, kilómetros y fotos.
- **HU-24 · Escribir en mi viaje.** Como usuaria quiero añadir notas a un viaje o a un día, para guardar lo que no sale en las fotos. _M4.2_
  - Las notas se ven con letra manuscrita (HandNote), con lugar y fecha.

### E7 · Compartir

- **HU-25 · Crear una tarjeta bonita.** Como usuaria quiero generar una imagen de un viaje, un país o mi pasaporte, para publicarla. _M8.4_
  - Formatos historia 9:16 (1080 × 1920) y post 4:5 (1080 × 1350).
  - Al menos 3 plantillas: postal con foto y sello, ruta en el mapa, pasaporte.
  - Puedo elegir las fotos y cambiar el título.
- **HU-26 · Compartir donde quiera.** Como usuaria quiero enviarla a historias de Instagram, a WhatsApp o a cualquier app, para enseñárselo a mi gente. _M8.5_
  - Botón directo a historias de Instagram; el resto por la hoja de compartir del sistema.
  - Opción de guardar la imagen en el carrete.
- **HU-27 · Compartir sin exponer dónde vivo.** Como usuaria quiero que lo que comparto no revele ubicaciones exactas sin querer, para estar tranquila. _M8.5, M10.2_
  - Por defecto, las tarjetas muestran ciudad y país, nunca coordenadas exactas ni mi base.
  - Las imágenes exportadas no llevan metadatos de ubicación.

### E8 · Privacidad y ajustes

- **HU-28 · Ajustar la app a mí.** Como usuaria quiero cambiar idioma, divisa, unidades, avisos y qué carpetas se leen, para que funcione como quiero. _M10.3, M10.5_
  - Todo cambio se aplica sin reiniciar la app.
- **HU-29 · Controlar mis datos.** Como usuaria quiero exportar o borrar todos mis datos, para decidir sobre ellos. _M10.2, M10.7_
  - Exportación en un archivo descargable con viajes, lugares y notas.
  - Borrar la cuenta elimina datos y miniaturas de la nube en menos de 30 días, y lo dice claro antes de confirmar.

### E9 · Visor web

- **HU-30 · Ver mi mapa en el ordenador.** Como usuaria quiero entrar desde el navegador y ver mi mapa, mis viajes y mis fotos, para disfrutarlo en grande. _M1, M3, M4 en escritorio_
  - Doble vista: lista o ficha a la izquierda, mapa a la derecha.
  - Las fotos se ven como miniaturas sincronizadas; los originales siguen en el móvil.
  - Funciona con teclado y ratón: atajos `/` para buscar y `⌘K` para comandos.

### Cobertura

Las 30 historias cubren todo lo que entra en el MVP según la sección 11. Las pantallas que aparecen aquí son las que diseñaremos en Claude Design, en este orden: E1 y E2, luego E3 y E4, luego E5 y E6, y al final E7, E8 y E9.
