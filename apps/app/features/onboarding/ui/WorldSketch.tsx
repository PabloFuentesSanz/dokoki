import { colors } from '@atlas/design-system';
import { useEffect, useState } from 'react';
import Svg, {
  ClipPath,
  Circle,
  Defs,
  Ellipse,
  G,
  Line,
  Path,
  Pattern,
  Rect,
} from 'react-native-svg';
import { useReducedMotion } from '@atlas/design-system';

/** Continentes del boceto (lienzo M0.1/M0.2), en un plano de 1000 × 500. */
const LAND = [
  'M33.3 66.7 L111.1 55.6 L236.1 41.7 L291.7 55.6 L333.3 97.2 L347.2 116.7 L305.6 130.6 L277.8 161.1 L275.0 180.6 L230.6 177.8 L230.6 200.0 L255.6 208.3 L283.3 227.8 L263.9 216.7 L208.3 194.4 L180.6 166.7 L155.6 138.9 L152.8 111.1 L111.1 83.3 L41.7 83.3 Z',
  'M347.2 22.2 L430.6 22.2 L444.4 55.6 L375.0 83.3 L347.2 61.1 Z',
  'M283.3 227.8 L333.3 222.2 L361.1 250.0 L402.8 269.4 L388.9 311.1 L366.7 327.8 L338.9 355.6 L319.4 402.8 L300.0 388.9 L300.0 333.3 L305.6 300.0 L277.8 263.9 Z',
  'M472.2 150.0 L475.0 130.6 L494.4 127.8 L486.1 116.7 L500.0 111.1 L513.9 102.8 L522.2 91.7 L513.9 77.8 L541.7 58.3 L577.8 52.8 L611.1 63.9 L611.1 97.2 L583.3 125.0 L577.8 136.1 L555.6 138.9 L541.7 144.4 L533.3 127.8 L513.9 130.6 L500.0 141.7 Z',
  'M486.1 111.1 L502.8 108.3 L500.0 102.8 L494.4 94.4 L486.1 88.9 L483.3 94.4 L491.7 100.0 Z',
  'M452.8 191.7 L486.1 150.0 L527.8 147.2 L588.9 163.9 L619.4 216.7 L641.7 216.7 L611.1 263.9 L611.1 291.7 L597.2 319.4 L555.6 347.2 L541.7 327.8 L533.3 263.9 L522.2 238.9 L477.8 236.1 L452.8 211.1 Z',
  'M577.8 136.1 L611.1 138.9 L638.9 125.0 L666.7 97.2 L611.1 97.2 L611.1 63.9 L694.4 47.2 L805.6 36.1 L888.9 50.0 L972.2 61.1 L1000.0 69.4 L944.4 83.3 L888.9 97.2 L875.0 125.0 L838.9 138.9 L833.3 166.7 L805.6 194.4 L791.7 222.2 L777.8 208.3 L763.9 202.8 L750.0 188.9 L722.2 208.3 L713.9 227.8 L700.0 194.4 L666.7 180.6 L638.9 172.2 L625.0 208.3 L611.1 180.6 L597.2 161.1 Z',
  'M861.1 163.9 L875.0 155.6 L888.9 150.0 L894.4 138.9 L891.7 130.6 L902.8 127.8 L894.4 125.0 L888.9 136.1 L880.6 147.2 L866.7 155.6 Z',
  'M816.7 311.1 L838.9 300.0 L863.9 283.3 L880.6 283.3 L894.4 280.6 L905.6 302.8 L925.0 325.0 L916.7 352.8 L888.9 355.6 L863.9 336.1 L819.4 344.4 Z',
  'M763.9 236.1 L791.7 266.7 L819.4 272.2 L833.3 275.0 L827.8 261.1 L805.6 255.6 L777.8 244.4 Z',
];

/** Trozos que se desbloquean en la lámina 2 (Europa, Japón, México...). */
const UNLOCKED = [
  'M473.6 147.2 L475.0 130.6 L494.4 129.2 L508.3 133.3 L500.0 141.7 L494.4 147.8 L483.3 150.0 Z',
  'M488.9 116.7 L505.6 108.3 L522.2 113.9 L519.4 127.8 L508.3 130.6 L497.2 129.2 Z',
  'M519.4 127.8 L536.1 122.2 L536.1 127.8 L544.4 136.1 L550.0 138.9 L544.4 144.4 L533.3 136.1 L525.0 127.8 Z',
  'M486.1 111.1 L502.8 108.3 L500.0 102.8 L494.4 94.4 L486.1 88.9 L483.3 94.4 L491.7 100.0 Z',
  'M472.2 166.7 L483.3 150.0 L497.2 152.8 L494.4 166.7 L475.0 172.2 Z',
  'M861.1 163.9 L875.0 155.6 L888.9 150.0 L894.4 138.9 L891.7 130.6 L902.8 127.8 L894.4 125.0 L888.9 136.1 L880.6 147.2 L866.7 155.6 Z',
  'M555.6 138.9 L572.2 136.1 L566.7 147.2 L558.3 147.2 Z',
  'M175.0 161.1 L230.6 177.8 L230.6 200.0 L208.3 194.4 L194.4 183.3 Z',
  'M772.2 194.4 L788.9 205.6 L783.3 216.7 L777.8 230.6 L775.0 213.9 Z',
];

const REVEAL_STEP_MS = 260;

interface WorldSketchProps {
  /** globe: el globo de la portada. map: el plano de la lámina 2. */
  variant: 'globe' | 'map';
  width: number;
  /** Levanta la niebla de algunos países, uno tras otro. */
  unlock?: boolean;
  label: string;
}

/** Boceto del mundo bajo la niebla rayada (portada y bienvenida). Ilustración, no datos reales. */
export function WorldSketch({ variant, width, unlock = false, label }: WorldSketchProps) {
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(0);
  const target = unlock ? UNLOCKED.length : 0;
  useEffect(() => {
    if (shown >= target) return undefined;
    const timer = setTimeout(() => setShown((n) => n + 1), reduced ? 0 : REVEAL_STEP_MS);
    return () => clearTimeout(timer);
  }, [shown, target, reduced]);

  const globe = variant === 'globe';
  const height = globe ? width : width * 0.88;
  const viewBox = globe ? '-10 -10 320 320' : '410 80 230 200';
  const land = (
    <G transform={globe ? 'translate(-350 -37.5) scale(0.9)' : undefined}>
      {LAND.map((d) => (
        <Path
          key={d}
          d={d}
          fill={colors.paperSunk}
          stroke={colors.ink}
          strokeWidth={globe ? 1.2 : 0.8}
        />
      ))}
      {LAND.map((d) => (
        <Path key={`fog-${d}`} d={d} fill="url(#atlas-hatch)" />
      ))}
      {UNLOCKED.slice(0, shown).map((d) => (
        <Path key={d} d={d} fill={colors.landVisited} stroke={colors.ink} strokeWidth={0.9} />
      ))}
    </G>
  );

  return (
    <Svg width={width} height={height} viewBox={viewBox} role="img" aria-label={label}>
      <Defs>
        <Pattern
          id="atlas-hatch"
          width={7}
          height={7}
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <Line
            x1={0}
            y1={0}
            x2={0}
            y2={7}
            stroke={colors.ink}
            strokeWidth={1.3}
            strokeOpacity={0.42}
          />
        </Pattern>
        <ClipPath id="atlas-globe">
          <Circle cx={150} cy={150} r={146} />
        </ClipPath>
      </Defs>
      {globe ? (
        <>
          <G clipPath="url(#atlas-globe)">
            <Rect width={300} height={300} fill={colors.water} />
            {land}
            {[37.5, 75, 112.5].map((rx) => (
              <Ellipse
                key={rx}
                cx={150}
                cy={150}
                rx={rx}
                ry={146}
                fill="none"
                stroke={colors.ink}
                strokeOpacity={0.22}
                strokeDasharray="4 5"
              />
            ))}
            {[77, 150, 223].map((y) => (
              <Line
                key={y}
                x1={0}
                y1={y}
                x2={300}
                y2={y}
                stroke={colors.ink}
                strokeOpacity={0.22}
                strokeDasharray="4 5"
              />
            ))}
          </G>
          <Circle cx={150} cy={150} r={146} fill="none" stroke={colors.ink} strokeWidth={1.5} />
          <Circle
            cx={150}
            cy={150}
            r={149}
            fill="none"
            stroke={colors.ink}
            strokeWidth={0.6}
            strokeDasharray="2 3"
          />
        </>
      ) : (
        <>
          <Rect x={0} y={0} width={1000} height={500} fill={colors.water} />
          {land}
        </>
      )}
    </Svg>
  );
}
