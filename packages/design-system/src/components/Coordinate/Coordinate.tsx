import { StyleSheet, Text } from 'react-native';
import { formatCoordinate } from '../../internal/format';
import { colors, typography } from '../../tokens';

export interface CoordinateProps {
  lat: number;
  lng: number;
  color?: string;
}

/**
 * Latitud y longitud a máquina, con coma decimal. Solo se pinta en el dispositivo:
 * las coordenadas de las fotos nunca salen del móvil ni aparecen en lo que se comparte.
 */
export function Coordinate({ lat, lng, color = colors.inkMuted }: CoordinateProps) {
  return <Text style={[styles.coord, { color }]}>{formatCoordinate(lat, lng)}</Text>;
}

const styles = StyleSheet.create({
  coord: { ...typography.dataS },
});
