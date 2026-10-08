import { colors, radii, shadows, spacing } from '@atlas/design-system';
import type { ReactNode } from 'react';
import { Modal, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface SheetProps {
  visible: boolean;
  onClose: () => void;
  /** Nombre del diálogo para lectores de pantalla. */
  label: string;
  children: ReactNode;
}

/** Hoja inferior sobre un velo de tinta: confirmaciones y opciones. La única con sombra difusa. */
export function Sheet({ visible, onClose, label, children }: SheetProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.scrim} onPress={onClose} aria-label="Cerrar" />
      <SafeAreaView edges={['bottom']} style={styles.sheet} role="dialog" aria-label={label}>
        {children}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: { flex: 1, backgroundColor: colors.ink, opacity: 0.3 },
  sheet: {
    gap: spacing[3],
    padding: spacing[5],
    backgroundColor: colors.paperRaised,
    borderTopLeftRadius: radii.sm,
    borderTopRightRadius: radii.sm,
    boxShadow: shadows.sheet,
    maxHeight: '85%',
  },
});
