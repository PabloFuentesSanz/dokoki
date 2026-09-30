import { Fragment } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, typography } from '../../tokens';

export interface BreadcrumbsProps {
  /** Mundo › Asia › Japón › Kioto. El último es la página actual. */
  items: readonly string[];
  /** Índice del nivel pulsado. */
  onNavigate?: (index: number) => void;
}

/** Migas geográficas a máquina. */
export function Breadcrumbs({ items, onNavigate }: BreadcrumbsProps) {
  return (
    <View role="navigation" aria-label="Ubicación" style={styles.row}>
      {items.map((item, index) => {
        const last = index === items.length - 1;
        return (
          <Fragment key={`${index}-${item}`}>
            {last ? (
              <Text aria-current="page" style={[styles.crumb, styles.current]}>
                {item}
              </Text>
            ) : (
              <Pressable role="link" onPress={() => onNavigate?.(index)} hitSlop={12}>
                <Text style={[styles.crumb, styles.link]}>{item}</Text>
              </Pressable>
            )}
            {last ? null : (
              <Text aria-hidden style={styles.crumb}>
                ›
              </Text>
            )}
          </Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6 },
  crumb: { ...typography.data, color: colors.inkMuted },
  link: { textDecorationLine: 'underline', textDecorationStyle: 'dashed' },
  current: { color: colors.ink },
});
