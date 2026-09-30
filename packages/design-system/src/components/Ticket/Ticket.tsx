import { StyleSheet, Text, View } from 'react-native';
import { colors, iconSizes, spacing, typography } from '../../tokens';
import { Icon, type IconName } from '../Icon/Icon';

export type TicketKind = 'flight' | 'train' | 'hotel' | 'entry';

export interface TicketProps {
  kind?: TicketKind;
  /** Ruta o nombre. */
  title: string;
  /** Fecha, hora, duración. */
  meta?: string;
  /** Aerolínea, hotel… */
  provider?: string;
  /** Localizador. */
  code: string;
  /** Etiqueta de la matriz. */
  stubLabel?: string;
  /** Hora bajo el código. */
  time?: string;
  /** Borde discontinuo azul si aún no está confirmada ("Por revisar"). */
  planned?: boolean;
}

const KINDS: Record<TicketKind, [IconName, string]> = {
  flight: ['plane', 'Vuelo'],
  train: ['train', 'Tren'],
  hotel: ['bed', 'Alojamiento'],
  entry: ['ticket', 'Entrada'],
};

/** Reserva como billete perforado: datos a la izquierda, matriz con código a la derecha. */
export function Ticket({
  kind = 'flight',
  title,
  meta,
  provider,
  code,
  stubLabel = 'Código',
  time,
  planned = false,
}: TicketProps) {
  const [icon, kindLabel] = KINDS[kind];
  return (
    <View
      role="group"
      aria-label={`${kindLabel}: ${title}`}
      style={[styles.ticket, planned && styles.planned]}
    >
      <View style={styles.main}>
        <View style={styles.kind}>
          <Icon name={icon} size={iconSizes.tag} color={colors.inkMuted} />
          <Text style={styles.kindText}>{provider ? `${kindLabel}, ${provider}` : kindLabel}</Text>
        </View>
        <Text style={styles.route}>{title}</Text>
        {meta ? <Text style={styles.meta}>{meta}</Text> : null}
      </View>
      <View style={[styles.stub, planned && styles.stubPlanned]}>
        <View aria-hidden style={[styles.notch, styles.notchTop]} />
        <View aria-hidden style={[styles.notch, styles.notchBottom]} />
        <Text style={[styles.kindText, styles.center]}>{stubLabel}</Text>
        <Text style={styles.code}>{code}</Text>
        {time ? <Text style={[styles.meta, styles.center]}>{time}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ticket: {
    flexDirection: 'row',
    minWidth: 320,
    maxWidth: 420,
    backgroundColor: colors.paperRaised,
    borderWidth: 1,
    borderColor: colors.ink,
    borderRadius: 0,
    overflow: 'hidden',
  },
  planned: { borderStyle: 'dashed', borderColor: colors.stampBlue },
  main: { flex: 1, paddingVertical: spacing[3], paddingHorizontal: spacing[4], gap: 4 },
  kind: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  kindText: { ...typography.dataS, color: colors.inkMuted },
  route: {
    fontFamily: typography.heading.fontFamily,
    fontSize: 22,
    lineHeight: 26,
    color: colors.ink,
  },
  meta: { ...typography.data, color: colors.inkMuted },
  stub: {
    width: 104,
    padding: spacing[3],
    justifyContent: 'center',
    gap: 4,
    borderLeftWidth: 2,
    borderStyle: 'dashed',
    borderLeftColor: colors.ink,
  },
  stubPlanned: { borderLeftColor: colors.stampBlue },
  notch: {
    position: 'absolute',
    left: -9,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.paper,
  },
  notchTop: { top: -9 },
  notchBottom: { bottom: -9 },
  center: { textAlign: 'center' },
  code: {
    ...typography.dataStrong,
    fontSize: 15,
    letterSpacing: 1.2,
    textAlign: 'center',
    color: colors.ink,
  },
});
