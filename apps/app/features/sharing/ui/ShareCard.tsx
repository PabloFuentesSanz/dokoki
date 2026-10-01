import {
  Polaroid,
  RouteMarker,
  Stamp,
  colors,
  fontFaces,
  spacing,
  typography,
} from '@atlas/design-system';
import { forwardRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { CardTemplate } from '../services/cardFormats';

export interface CardStamp {
  kind: 'country' | 'city';
  label: string;
  date: string;
}

export interface ShareCardProps {
  template: CardTemplate;
  width: number;
  height: number;
  title: string;
  /** Fechas y cifras: "abril 2024, 9 días, 312 fotos". */
  meta: string;
  /** URI local de la foto de portada (postal). */
  coverUri?: string;
  /** Lugares en orden (ruta). Solo nombres: nunca coordenadas. */
  places: readonly string[];
  stamps: readonly CardStamp[];
}

/**
 * La tarjeta que se comparte (M8.4). Muestra ciudad y país, nunca coordenadas ni la base (HU-27).
 * Un solo toque firma por plantilla: la foto con celo, la ruta numerada o los sellos.
 */
export const ShareCard = forwardRef<View, ShareCardProps>(function ShareCard(
  { template, width, height, title, meta, coverUri, places, stamps },
  ref,
) {
  const unit = width / 360;
  const stamp = stamps[0];
  return (
    <View
      ref={ref}
      collapsable={false}
      style={[styles.card, { width, height, padding: spacing[5] * unit }]}
    >
      {template === 'postal' ? (
        <View style={styles.center}>
          <Polaroid
            caption={places.slice(0, 3).join(', ')}
            src={coverUri}
            tape
            tilt="left"
            width={260 * unit}
          />
          {stamp ? (
            <View style={styles.stamp}>
              <Stamp kind={stamp.kind} label={stamp.label} date={stamp.date} size={92 * unit} />
            </View>
          ) : null}
        </View>
      ) : null}

      {template === 'route' ? (
        <View style={[styles.route, { gap: spacing[3] * unit }]}>
          {places.slice(0, 8).map((place, i) => (
            <View key={`${i}-${place}`} style={styles.routeRow}>
              <RouteMarker n={i + 1} />
              <Text style={[styles.place, { fontSize: 20 * unit, lineHeight: 26 * unit }]}>
                {place}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {template === 'passport' ? (
        <View style={[styles.grid, { gap: spacing[2] * unit }]}>
          {stamps.slice(0, 12).map((s) => (
            <Stamp
              key={`${s.kind}-${s.label}`}
              kind={s.kind}
              label={s.label}
              date={s.date}
              size={86 * unit}
              straight
            />
          ))}
        </View>
      ) : null}

      <View style={styles.footer}>
        <Text
          style={[styles.title, { fontSize: 30 * unit, lineHeight: 36 * unit }]}
          numberOfLines={2}
        >
          {title}
        </Text>
        <Text style={[styles.meta, { fontSize: 13 * unit, lineHeight: 18 * unit }]}>{meta}</Text>
        <Text style={[styles.brand, { fontSize: 11 * unit }]}>Atlas</Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: { backgroundColor: colors.paper, justifyContent: 'space-between', overflow: 'hidden' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  stamp: { position: 'absolute', right: 0, bottom: 0 },
  route: { flex: 1, justifyContent: 'center' },
  routeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  place: { fontFamily: typography.bodyStrong.fontFamily, color: colors.ink },
  grid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignContent: 'center',
    justifyContent: 'center',
  },
  footer: { gap: spacing[1] },
  title: { fontFamily: typography.title.fontFamily, color: colors.ink },
  meta: { fontFamily: typography.data.fontFamily, color: colors.inkMuted },
  brand: { fontFamily: fontFaces.mono['700'], color: colors.stampRedText, letterSpacing: 2 },
});
