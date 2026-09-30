import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Rect } from 'react-native-svg';
import { colors, radii, spacing, typography } from '../../tokens';
import { RouteLine } from '../RouteLine/RouteLine';

export interface MapLegendProps {
  /** Por defecto "Leyenda". */
  title?: string;
}

function Swatch({ fog }: { fog: boolean }) {
  return (
    <Svg width={18} height={12} aria-hidden>
      <Rect
        x={0.5}
        y={0.5}
        width={17}
        height={11}
        fill={fog ? colors.paperSunk : colors.landVisited}
        stroke={colors.ink}
      />
      {fog
        ? [3, 7, 11, 15, 19].map((x) => (
            <Line
              key={x}
              x1={x}
              y1={0}
              x2={x - 12}
              y2={12}
              stroke={colors.ink}
              strokeOpacity={0.45}
            />
          ))
        : null}
    </Svg>
  );
}

/** La leyenda del mapa como la de un atlas; en producto es también el filtro de capas (M1.2). */
export function MapLegend({ title = 'Leyenda' }: MapLegendProps) {
  return (
    <View role="group" aria-label="Leyenda del mapa" style={styles.legend}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.row}>
        <Swatch fog={false} />
        <Text style={styles.label}>Desbloqueado</Text>
      </View>
      <View style={styles.row}>
        <Swatch fog />
        <Text style={styles.label}>Por descubrir</Text>
      </View>
      <RouteLine kind="traveled" length={18} />
      <RouteLine kind="planned" length={18} />
      <View style={styles.row}>
        <Svg width={18} height={12} aria-hidden>
          <Circle
            cx={9}
            cy={6}
            r={4}
            fill={colors.stampRed}
            stroke={colors.paperRaised}
            strokeWidth={1.5}
          />
        </Svg>
        <Text style={styles.label}>Lugar con fotos</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  legend: {
    alignSelf: 'flex-start',
    gap: spacing[2],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    backgroundColor: colors.paperRaised,
    borderWidth: 1,
    borderColor: colors.ink,
    borderRadius: radii.sm,
  },
  title: { ...typography.bodyStrong, fontSize: 14, color: colors.ink },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  label: { ...typography.data, color: colors.ink },
});
