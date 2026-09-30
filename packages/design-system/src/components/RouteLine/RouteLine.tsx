import { StyleSheet, Text, View } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import { colors, spacing, typography } from '../../tokens';

export type RouteKind = 'traveled' | 'planned' | 'unexplored';

export interface RouteLineProps {
  kind?: RouteKind;
  length?: number;
  label?: string;
  hideLabel?: boolean;
}

/** El trazo informa: continua = recorrido, discontinua = planificado, punteada = por descubrir. */
export const ROUTE_STYLES: Record<
  RouteKind,
  { label: string; color: string; dash: string | undefined }
> = {
  traveled: { label: 'Recorrido', color: colors.stampRed, dash: undefined },
  planned: { label: 'Planificado', color: colors.stampBlue, dash: '7 5' },
  unexplored: { label: 'Por descubrir', color: colors.inkMuted, dash: '1.5 4' },
};

/** Las tres líneas del mapa. El trazo siempre informa, nunca decora. */
export function RouteLine({
  kind = 'traveled',
  length = 56,
  label,
  hideLabel = false,
}: RouteLineProps) {
  const route = ROUTE_STYLES[kind];
  return (
    <View style={styles.row}>
      <Svg width={length} height={10} aria-hidden>
        <Line
          x1={2}
          y1={5}
          x2={length - 2}
          y2={5}
          stroke={route.color}
          strokeWidth={2.2}
          strokeDasharray={route.dash}
          strokeLinecap="round"
        />
      </Svg>
      {hideLabel ? null : <Text style={styles.label}>{label ?? route.label}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  label: { ...typography.data, color: colors.ink },
});
