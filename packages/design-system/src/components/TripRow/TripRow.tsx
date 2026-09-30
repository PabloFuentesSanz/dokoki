import { Pressable, StyleSheet, Text, View } from 'react-native';
import { focusRingStyle, useFocusRing } from '../../internal/useFocusRing';
import { colors, spacing, typography } from '../../tokens';
import { RouteMarker } from '../RouteMarker/RouteMarker';
import { Tag } from '../Tag/Tag';

export interface TripRowProps {
  n: number;
  title: string;
  /** Fechas, días, fotos: "abril 2024, 9 días, 312 fotos". */
  meta: string;
  /** Viaje futuro: azul y etiqueta "Próximo". */
  planned?: boolean;
  onPress?: () => void;
}

/** Fila de viaje con su número en círculo discontinuo. */
export function TripRow({ n, title, meta, planned = false, onPress }: TripRowProps) {
  const { focused, focusProps } = useFocusRing();
  return (
    <Pressable
      role="link"
      aria-label={`${title}, ${meta}`}
      onPress={onPress}
      {...focusProps}
      style={({ pressed }) => [
        rowStyles.row,
        pressed && rowStyles.pressed,
        focused && focusRingStyle,
      ]}
    >
      <RouteMarker n={n} tone={planned ? 'blue' : 'red'} />
      <View style={rowStyles.body}>
        <Text style={rowStyles.title}>{title}</Text>
        <Text style={rowStyles.meta}>{meta}</Text>
      </View>
      {planned ? <Tag tone="planned">Próximo</Tag> : null}
    </Pressable>
  );
}

/** Estilos compartidos por las filas (viajes, gastos, deudas). */
export const rowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    minHeight: 56,
    paddingVertical: spacing[2],
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
  },
  pressed: { backgroundColor: colors.paperRaised },
  body: { flex: 1, minWidth: 0, gap: 2 },
  title: { ...typography.bodyStrong, color: colors.ink },
  meta: { ...typography.data, color: colors.inkMuted },
  amount: { ...typography.dataStrong, fontSize: 15, textAlign: 'right', color: colors.ink },
});
