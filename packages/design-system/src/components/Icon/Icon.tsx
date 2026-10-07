import Svg, { Path } from 'react-native-svg';
import { colors, iconSizes } from '../../tokens';

/** Trazos en una rejilla de 24; cada `|` separa un subtrazo. */
const PATHS = {
  map: 'M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3z|M9 3v15|M15 6v15',
  trips: 'M3 7h18v13H3z|M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2',
  plus: 'M12 5v14|M5 12h14',
  photos: 'M3 4h18v16H3z|M21 16l-5-5-9 9|M9 8a2 2 0 1 0 0 4 2 2 0 1 0 0-4',
  me: 'M12 4a4 4 0 1 0 0 8 4 4 0 1 0 0-8|M4 21c0-4 4-7 8-7s8 3 8 7',
  back: 'M15 18l-6-6 6-6',
  share: 'M12 3v12|M7 8l5-5 5 5|M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5',
  pin: 'M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z|M12 7a2.5 2.5 0 1 0 0 5 2.5 2.5 0 1 0 0-5',
  camera: 'M4 8h3l2-3h6l2 3h3v11H4z|M12 10a3.5 3.5 0 1 0 0 7 3.5 3.5 0 1 0 0-7',
  note: 'M5 3h10l4 4v14H5z|M15 3v4h4|M8 12h8|M8 16h6',
  coin: 'M12 3a9 9 0 1 0 0 18 9 9 0 1 0 0-18|M14.5 8.5c-.7-.9-1.6-1.3-2.7-1.3-1.6 0-2.8.9-2.8 2.2 0 3.1 5.8 1.7 5.8 4.9 0 1.3-1.3 2.4-3 2.4-1.2 0-2.3-.5-3-1.4|M12 5.5v1.7|M12 16.8v1.7',
  check: 'M5 12.5l4.5 4.5L19 7',
  close: 'M6 6l12 12|M18 6L6 18',
  search: 'M10.5 4a6.5 6.5 0 1 0 0 13 6.5 6.5 0 1 0 0-13|M20 20l-4.8-4.8',
  layers: 'M12 3l9 5-9 5-9-5z|M3 13l9 5 9-5',
  calendar: 'M4 5h16v15H4z|M4 10h16|M9 3v4|M15 3v4',
  plane: 'M2.5 13.5l19-7-5 15-3.5-6.5z|M13 15l3-3.5',
  train: 'M6 3h12v12a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3z|M6 10h12|M8 21l2-3|M16 21l-2-3',
  bed: 'M3 18V6|M3 13h18v5|M21 13a3 3 0 0 0-3-3h-7v3',
  ticket: 'M3 7h18v3a2 2 0 0 0 0 4v3H3v-3a2 2 0 0 0 0-4z|M14 7v10',
  food: 'M7 3v8a2 2 0 0 0 2 2v8|M5 3v5a2 2 0 0 0 4 0V3|M17 3c-2 0-3 3-3 6s1 4 3 4v8',
  compass: 'M12 3a9 9 0 1 0 0 18 9 9 0 1 0 0-18|M15.5 8.5l-2 5-5 2 2-5z',
  cloud: 'M7 18a4 4 0 0 1-.5-8 6 6 0 0 1 11.5 1.5A3.5 3.5 0 0 1 17.5 18z',
  sync: 'M20 11a8 8 0 0 0-14.3-4.9L4 8|M4 3v5h5|M4 13a8 8 0 0 0 14.3 4.9L20 16|M20 21v-5h-5',
  settings: 'M4 7h9|M17 7h3|M15 5v4|M4 17h3|M11 17h9|M9 15v4',
  eyeOff:
    'M3 3l18 18|M10.6 6.1A9 9 0 0 1 12 6c5 0 8.5 4 9.5 6a12 12 0 0 1-2.6 3.4|M6.4 7.6A12 12 0 0 0 2.5 12c1 2 4.5 6 9.5 6a9 9 0 0 0 4-.9|M9.9 9.9a3 3 0 0 0 4.2 4.2',
} as const;

export type IconName = keyof typeof PATHS;
export const iconNames = Object.keys(PATHS) as IconName[];

export interface IconProps {
  /** Qué icono. */
  name: IconName;
  /** Lado en px; 22 por defecto, 18 dentro de botones, 14 en etiquetas. */
  size?: number;
  /** Solo si el icono va solo y significa algo; si no, queda oculto al lector de pantalla. */
  label?: string;
  /** En React Native no hay `currentColor`: pasa el color del texto al que acompaña. */
  color?: string;
  strokeWidth?: number;
}

/** Iconos de trazo 1,6 px con puntas redondeadas, dibujados como un plumín de cuaderno. */
export function Icon({
  name,
  size = iconSizes.nav,
  label,
  color = colors.ink,
  strokeWidth = 1.6,
}: IconProps) {
  // Props aria-* y role: React Native y react-native-svg en web las entienden igual.
  const a11y = label ? { role: 'img' as const, 'aria-label': label } : { 'aria-hidden': true };
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...a11y}
    >
      {PATHS[name].split('|').map((d) => (
        <Path key={d} d={d} />
      ))}
    </Svg>
  );
}
