import { Button, TextField, colors, typography } from '@atlas/design-system';
import { useState } from 'react';
import { Text } from 'react-native';
import { Sheet } from '../../../components/Sheet';

interface NoteSheetProps {
  visible: boolean;
  /** "Kioto, Nara y Osaka" o "12 abr: Kioto". */
  title: string;
  initial: string;
  onClose: () => void;
  onSave: (text: string) => void;
}

/** Escribir o editar una nota a mano. Se guarda en el móvil y se ve con letra manuscrita. */
export function NoteSheet({ visible, title, initial, onClose, onSave }: NoteSheetProps) {
  const [text, setText] = useState(initial);
  const [lastInitial, setLastInitial] = useState(initial);
  if (initial !== lastInitial) {
    setLastInitial(initial);
    setText(initial);
  }
  return (
    <Sheet visible={visible} onClose={onClose} label={`Nota: ${title}`}>
      <Text role="heading" style={{ ...typography.heading, color: colors.ink }}>
        {title}
      </Text>
      <TextField
        label="Tu nota"
        value={text}
        onChangeText={setText}
        placeholder="Lo que no quieres olvidar…"
        multiline
      />
      <Button block icon="note" onPress={() => onSave(text)}>
        {text.trim().length === 0 && initial.length > 0 ? 'Borrar nota' : 'Guardar nota'}
      </Button>
      <Button block variant="ghost" onPress={onClose}>
        Cancelar
      </Button>
    </Sheet>
  );
}
