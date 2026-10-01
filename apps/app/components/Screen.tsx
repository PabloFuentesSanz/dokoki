import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { breakpoints, colors, IconButton, Paper, spacing, typography } from '@atlas/design-system';

interface ScreenProps {
  title: string;
  children: ReactNode;
  /** Muestra el botón "Volver" (pantallas de detalle). */
  back?: boolean;
  /** Va encima del título (migas, etiquetas). */
  eyebrow?: ReactNode;
  /** `display` para el nombre de un lugar (uno por pantalla). */
  titleStyle?: 'title' | 'display';
  /** Botones de icono a la derecha del título (buscar, importar...). */
  actions?: ReactNode;
  /**
   * false cuando el cuerpo es una lista virtualizada (galerías): el cuerpo ocupa el resto de la
   * pantalla y la lista hace su propio scroll.
   */
  scroll?: boolean;
}

/** Margen lateral del sistema según el ancho. */
export function useGutter(): number {
  const { width } = useWindowDimensions();
  return width >= breakpoints.doubleView
    ? spacing[6]
    : width >= breakpoints.sideNav
      ? spacing[5]
      : spacing[4];
}

/** Pantalla sobre papel con grano, con cabecera (volver, título y acciones) y márgenes del sistema. */
export function Screen({
  title,
  children,
  back = false,
  eyebrow,
  titleStyle = 'title',
  actions,
  scroll = true,
}: ScreenProps) {
  const gutter = useGutter();
  const head = (
    <>
      {back ? (
        <View style={styles.back}>
          <IconButton icon="back" label="Volver" onPress={() => router.back()} />
        </View>
      ) : null}
      <View style={styles.head}>
        {eyebrow}
        <View style={styles.titleRow}>
          <Text
            role="heading"
            style={[titleStyle === 'display' ? styles.display : styles.title, styles.titleText]}
          >
            {title}
          </Text>
          {actions ? <View style={styles.actions}>{actions}</View> : null}
        </View>
      </View>
    </>
  );
  return (
    <Paper>
      <SafeAreaView edges={['top']} style={styles.safe}>
        {scroll ? (
          <ScrollView contentContainerStyle={[styles.content, { paddingHorizontal: gutter }]}>
            {head}
            <View style={styles.body}>{children}</View>
          </ScrollView>
        ) : (
          <View style={styles.fixed}>
            <View style={[styles.fixedHead, { paddingHorizontal: gutter }]}>{head}</View>
            <View style={styles.fill}>{children}</View>
          </View>
        )}
      </SafeAreaView>
    </Paper>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { paddingVertical: spacing[5], gap: spacing[5] },
  fixed: { flex: 1 },
  fixedHead: { paddingTop: spacing[5], paddingBottom: spacing[4], gap: spacing[5] },
  fill: { flex: 1 },
  back: { marginLeft: -spacing[3], marginBottom: -spacing[3] },
  head: { gap: spacing[2] },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  titleText: { flex: 1 },
  actions: { flexDirection: 'row', marginRight: -spacing[2] },
  title: { ...typography.title, color: colors.ink },
  display: { ...typography.display, color: colors.ink },
  body: { gap: spacing[5] },
});
