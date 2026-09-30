import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { breakpoints, colors, spacing, typography } from '@atlas/design-system';

interface ScreenProps {
  title: string;
  children: ReactNode;
}

/** Pantalla de lista sobre papel, con los márgenes laterales del sistema según el ancho. */
export function Screen({ title, children }: ScreenProps) {
  const { width } = useWindowDimensions();
  const gutter =
    width >= breakpoints.doubleView
      ? spacing[6]
      : width >= breakpoints.sideNav
        ? spacing[5]
        : spacing[4];
  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <ScrollView contentContainerStyle={[styles.content, { paddingHorizontal: gutter }]}>
        <Text role="heading" style={styles.title}>
          {title}
        </Text>
        <View style={styles.body}>{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  content: { paddingVertical: spacing[5], gap: spacing[5] },
  title: { ...typography.title, color: colors.ink },
  body: { gap: spacing[5] },
});
