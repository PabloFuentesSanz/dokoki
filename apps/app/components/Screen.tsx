import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { breakpoints, colors, IconButton, spacing, typography } from '@atlas/design-system';

interface ScreenProps {
  title: string;
  children: ReactNode;
  /** Muestra el botón "Volver" (pantallas de detalle). */
  back?: boolean;
  /** Va encima del título (migas, etiquetas). */
  eyebrow?: ReactNode;
  /** `display` para el nombre de un lugar (uno por pantalla). */
  titleStyle?: 'title' | 'display';
}

/** Pantalla sobre papel, con los márgenes laterales del sistema según el ancho. */
export function Screen({
  title,
  children,
  back = false,
  eyebrow,
  titleStyle = 'title',
}: ScreenProps) {
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
        {back ? (
          <View style={styles.back}>
            <IconButton icon="back" label="Volver" onPress={() => router.back()} />
          </View>
        ) : null}
        <View style={styles.head}>
          {eyebrow}
          <Text role="heading" style={titleStyle === 'display' ? styles.display : styles.title}>
            {title}
          </Text>
        </View>
        <View style={styles.body}>{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  content: { paddingVertical: spacing[5], gap: spacing[5] },
  back: { marginLeft: -spacing[3], marginBottom: -spacing[3] },
  head: { gap: spacing[2] },
  title: { ...typography.title, color: colors.ink },
  display: { ...typography.display, color: colors.ink },
  body: { gap: spacing[5] },
});
