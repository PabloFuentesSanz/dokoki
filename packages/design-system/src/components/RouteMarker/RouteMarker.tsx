import { View } from 'react-native';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';
import { colors, fontFaces } from '../../tokens';

export interface RouteMarkerProps {
  n: number;
  /** red: hecho. blue: por hacer. */
  tone?: 'red' | 'blue';
}

/** Número de viaje o de día en un círculo discontinuo a máquina (N.º1, N.º2). */
export function RouteMarker({ n, tone = 'red' }: RouteMarkerProps) {
  const color = tone === 'red' ? colors.stampRed : colors.stampBlue;
  return (
    <View role="img" aria-label={`Viaje número ${n}`}>
      <Svg width={36} height={36} viewBox="0 0 36 36" aria-hidden>
        <Circle
          cx={18}
          cy={18}
          r={15}
          fill="none"
          stroke={color}
          strokeWidth={1.6}
          strokeDasharray="2.5 2.5"
        />
        <SvgText
          x={18}
          y={22}
          fontFamily={fontFaces.mono['700']}
          fontSize={11}
          fill={color}
          textAnchor="middle"
        >
          {`N.º${n}`}
        </SvgText>
      </Svg>
    </View>
  );
}
