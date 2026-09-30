import type { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Polygon, Rect, Text as SvgText } from 'react-native-svg';
import { colors, fontFaces, opacity, tilts } from '../../tokens';

export type StampKind = 'country' | 'city' | 'achievement';
export type StampTone = 'red' | 'blue' | 'olive';

export interface StampProps {
  kind?: StampKind;
  /** Nombre del lugar o logro. */
  label: string;
  /** dd.mm.aaaa. */
  date?: string;
  /** red: desbloqueado. blue: planificado. olive: logro. */
  tone?: StampTone;
  /** 104 por defecto. */
  size?: number;
  /** Sin inclinación, para las rejillas del pasaporte. */
  straight?: boolean;
}

const TONES: Record<StampTone, string> = {
  red: colors.stampRed,
  blue: colors.stampBlue,
  olive: colors.olive,
};
const SUBTITLE: Record<StampKind, string> = {
  country: 'entrada',
  city: 'visitada',
  achievement: 'logro',
};
const BOLD = fontFaces.mono['700'];
const REGULAR = fontFaces.mono['400'];

/** Estrella de 16 puntas para el borde dentado de los logros. */
export function serratedPoints(): string {
  return Array.from({ length: 16 }, (_, i) => {
    const angle = (Math.PI * 2 * i) / 16;
    const radius = i % 2 ? 40 : 47;
    return `${(50 + radius * Math.cos(angle)).toFixed(1)},${(50 + radius * Math.sin(angle)).toFixed(1)}`;
  }).join(' ');
}

function label(
  x: number,
  y: number,
  size: number,
  fill: string,
  text: string,
  bold = false,
): ReactNode {
  return (
    <SvgText
      x={x}
      y={y}
      fontFamily={bold ? BOLD : REGULAR}
      fontSize={size}
      fill={fill}
      textAnchor="middle"
    >
      {text}
    </SvgText>
  );
}

/**
 * El sello de tinta: redondo para países, rectangular para ciudades, dentado para logros.
 * Es el toque firma principal: máximo uno grande por pantalla, y nunca como botón.
 */
export function Stamp({
  kind = 'country',
  label: name,
  date = '',
  tone = 'red',
  size = 104,
  straight = false,
}: StampProps) {
  const c = TONES[tone];
  const title = name.toUpperCase();
  const alt = `${kind === 'achievement' ? 'Logro' : 'Sello de'} ${name}${date ? `, ${date}` : ''}`;

  let art: ReactNode;
  if (kind === 'city') {
    art = (
      <>
        <Rect x={6} y={18} width={88} height={64} rx={3} fill="none" stroke={c} strokeWidth={2.5} />
        <Rect
          x={12}
          y={24}
          width={76}
          height={52}
          rx={2}
          fill="none"
          stroke={c}
          strokeWidth={1}
          strokeDasharray="3 2"
        />
        {label(50, 48, 13, c, title, true)}
        {label(50, 64, 9, c, date)}
      </>
    );
  } else if (kind === 'achievement') {
    art = (
      <>
        <Polygon points={serratedPoints()} fill="none" stroke={c} strokeWidth={2.5} />
        <Circle
          cx={50}
          cy={50}
          r={30}
          fill="none"
          stroke={c}
          strokeWidth={1}
          strokeDasharray="2 2"
        />
        {label(50, 48, 10, c, title, true)}
        {label(50, 61, 8, c, date)}
      </>
    );
  } else {
    art = (
      <>
        <Circle cx={50} cy={50} r={46} fill="none" stroke={c} strokeWidth={2.5} />
        <Circle cx={50} cy={50} r={38} fill="none" stroke={c} strokeWidth={1} />
        {label(50, 46, 13, c, title, true)}
        {label(50, 61, 9, c, date)}
        {label(50, 74, 8, c, SUBTITLE[kind])}
      </>
    );
  }

  return (
    <View
      role="img"
      aria-label={alt}
      style={{
        width: size,
        height: size,
        opacity: opacity.stampInk,
        transform: straight ? [] : [{ rotate: tilts.stamp }],
      }}
    >
      <Svg width={size} height={size} viewBox="0 0 100 100" aria-hidden>
        {art}
      </Svg>
    </View>
  );
}
