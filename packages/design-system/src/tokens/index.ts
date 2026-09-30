// ARCHIVO GENERADO desde tokens.json con `npm run tokens`. No lo edites a mano.
// Fuente: https://claude.ai/artifact/RKn5dmdwhqzTSzqvygC3fx

/** Colores. Solo modo claro. Texto sobre papel: ink, ink-muted, stamp-red-text, stamp-blue, olive-text, ochre. */
export const colors = {
  /** Fondo general de la app (kraft). Nunca blanco puro. */
  paper: "#E7DCC5",
  /** Tarjetas, hojas, barras de navegación, campos. Texto: ink, ink-muted. */
  paperRaised: "#F2EAD8",
  /** Solo marco de fotos (Polaroid) y fondo de notas manuscritas. */
  paperPhoto: "#FBF7EE",
  /** Tierra sin descubrir en el mapa, pistas de progreso, zonas deshabilitadas. */
  paperSunk: "#DCCFB3",
  /** Texto principal, iconos, bordes de controles (9,5:1 sobre paper). */
  ink: "#3B2F24",
  /** Metadatos, fechas, textos secundarios (5,7:1 sobre paper, 5,0:1 sobre paper-sunk). */
  inkMuted: "#5E5043",
  /** Separadores decorativos de 1 px entre filas. Nunca como borde de un control. */
  hairline: "#CDBE9F",
  /** Acento principal: sellos de desbloqueo, CTA primario, lo visitado, rutas recorridas. Como relleno lleva texto on-stamp (5,0:1). */
  stampRed: "#B23A2E",
  /** Rojo cuando es TEXTO sobre paper o paper-raised (5,5:1): importes que debes, enlaces activos, errores. */
  stampRedText: "#9A3026",
  /** Lo planificado: sellos de viaje futuro, rutas planificadas, foco de teclado. Válido como texto (6,5:1). */
  stampBlue: "#2C4A7A",
  /** Saldado, confirmado, check-in hecho, naturaleza en el mapa. Solo marcas e iconos (3,6:1). */
  olive: "#6E7447",
  /** Oliva cuando es TEXTO: 'Saldado', 'Te deben'. Siempre con icono o palabra, nunca solo color. */
  oliveText: "#565B36",
  /** Avisos: sincronización pendiente, presupuesto cerca del tope. Texto y marcas. */
  ochre: "#7A5210",
  /** Texto e iconos sobre stamp-red, stamp-blue o ink. */
  onStamp: "#F2EAD8",
  /** Agua en el mapa. */
  water: "#C7C9B8",
  /** Tierra desbloqueada en el mapa. */
  landVisited: "#B9A27A",
  /** Celo sobre las fotos destacadas. Se pinta al 85 % de opacidad. */
  tape: "#EFE4C8",
  /** Anillo de foco de 2 px en todos los controles (6,5:1 sobre paper). */
  focus: "#2C4A7A",
} as const;

export type ColorToken = keyof typeof colors;

/** Pilas CSS de cada familia (web, Storybook). */
export const fontStacks = {
  serif: "\"Libre Caslon Text\", Georgia, \"Times New Roman\", serif",
  mono: "\"Courier Prime\", \"Courier New\", monospace",
  hand: "\"Caveat\", \"Bradley Hand\", cursive",
} as const;

/** Nombre de cada fuente cargada con expo-font (@expo-google-fonts), por familia y peso. */
export const fontFaces = {
  serif: {
    "400": "LibreCaslonText_400Regular",
    "700": "LibreCaslonText_700Bold",
  },
  mono: {
    "400": "CourierPrime_400Regular",
    "700": "CourierPrime_700Bold",
  },
  hand: {
    "500": "Caveat_500Medium",
  },
} as const;

/** Escala tipográfica lista para StyleSheet. El peso va en la fuente (fontFamily), no en fontWeight: así funciona igual en Android. */
export const typography = {
  /** Nombre de país o ciudad en su ficha. Uno por pantalla. */
  display: { fontFamily: "LibreCaslonText_700Bold", fontSize: 54, lineHeight: 56 },
  /** Título de viaje, de pantalla principal. */
  title: { fontFamily: "LibreCaslonText_700Bold", fontSize: 32, lineHeight: 38 },
  /** Encabezado de bloque. */
  heading: { fontFamily: "LibreCaslonText_700Bold", fontSize: 20, lineHeight: 26 },
  /** Cifras grandes en StatStrip. */
  stat: { fontFamily: "LibreCaslonText_700Bold", fontSize: 26, lineHeight: 28 },
  /** Texto corrido, descripciones de lugares. */
  body: { fontFamily: "LibreCaslonText_400Regular", fontSize: 16, lineHeight: 26 },
  /** Nombre en filas y tarjetas, texto de botones. */
  bodyStrong: { fontFamily: "LibreCaslonText_700Bold", fontSize: 16, lineHeight: 22 },
  /** Texto secundario en tarjetas. */
  bodyS: { fontFamily: "LibreCaslonText_400Regular", fontSize: 14, lineHeight: 22 },
  /** Metadatos, fechas, importes, códigos de reserva. */
  data: { fontFamily: "CourierPrime_400Regular", fontSize: 13, lineHeight: 18 },
  /** Datos clave dentro de tickets. */
  dataStrong: { fontFamily: "CourierPrime_700Bold", fontSize: 13, lineHeight: 18 },
  /** Coordenadas y etiquetas de mapa. Mínimo absoluto de tamaño. */
  dataS: { fontFamily: "CourierPrime_400Regular", fontSize: 11, lineHeight: 16 },
  /** SOLO notas personales que escribe el usuario (HandNote). Nunca en interfaz, títulos ni botones. */
  hand: { fontFamily: "Caveat_500Medium", fontSize: 22, lineHeight: 26 },
} as const;

export type TypographyToken = keyof typeof typography;

/** Escala de espaciado: 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64. */
export const spacing = {
  /** Entre icono y texto pequeño. */
  "1": 4,
  /** Dentro de chips y etiquetas; entre elementos de una fila. */
  "2": 8,
  /** Entre filas compactas, padding de campos. */
  "3": 12,
  /** Padding de tarjetas; margen lateral en móvil. */
  "4": 16,
  /** Entre bloques de una pantalla; margen lateral en tablet. */
  "5": 24,
  /** Margen lateral en escritorio; separación entre secciones. */
  "6": 32,
  /** Aire alrededor de estados vacíos. */
  "7": 48,
  /** Separación mayor en escritorio. */
  "8": 64,
} as const;

/** Radios: 0 billetes y fotos, 3 px todo lo demás, 999 px solo avatares, sellos y captura. */
export const radii = {
  /** Tickets y fotos: papel cortado. */
  none: 0,
  /** Botones, campos, tarjetas, etiquetas. El radio por defecto. */
  sm: 3,
  /** Solo avatares, sellos redondos y el botón de captura. */
  round: 999,
} as const;

/** Sombras como `boxShadow` (React Native 0.76+ y web). */
export const shadows = {
  /** Solo bajo fotos Polaroid: papel apoyado sobre papel. */
  photo: "1px 2px 0 rgba(59, 47, 36, 0.18)",
  /** Hoja inferior arrastrable en móvil. Ningún otro elemento lleva sombra difusa. */
  sheet: "0 -1px 0 rgba(59, 47, 36, 0.12), 0 -6px 16px rgba(59, 47, 36, 0.08)",
} as const;

/** Inclinaciones para piezas de papel. Nunca en texto ni en controles. */
export const tilts = {
  /** Foto destacada, variante izquierda. */
  photoL: "-1.5deg",
  /** Foto destacada, variante derecha. */
  photoR: "1deg",
  /** Notas manuscritas. */
  note: "-0.8deg",
  /** Sellos de desbloqueo. */
  stamp: "-12deg",
} as const;

/** Opacidades. */
export const opacity = {
  /** Textura de papel sobre fondos grandes (paper). Nunca sobre fotos ni sobre texto pequeño. */
  grain: 0.03,
  /** Tinta de los sellos, para que parezcan estampados. */
  stampInk: 0.88,
} as const;

/** Objetivo táctil mínimo: 44 × 44 px. */
export const touchTarget = 44;

/** Tamaños de icono: 22 navegación, 18 botones, 14 etiquetas. */
export const iconSizes = {
  nav: 22,
  button: 18,
  tag: 14,
} as const;

/** Puntos de corte: < 600 BottomNav, ≥ 600 SideNav, ≥ 1024 doble vista. */
export const breakpoints = {
  /** Desde aquí SideNav en lugar de BottomNav, con el mapa siempre visible. */
  sideNav: 600,
  /** Desde aquí doble vista: contenido a la izquierda, mapa sincronizado a la derecha. */
  doubleView: 1024,
} as const;

/** Duraciones en ms. */
export const motion = {
  /** Transiciones de controles. */
  fast: 180,
  /** Transiciones de hojas y paneles. Todo respeta "reducir movimiento". */
  base: 240,
} as const;
