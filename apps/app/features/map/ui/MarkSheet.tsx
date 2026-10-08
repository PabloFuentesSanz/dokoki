import { Button, TextField, colors, typography } from '@atlas/design-system';
import { useState } from 'react';
import { Text } from 'react-native';
import { Sheet } from '../../../components/Sheet';

interface MarkSheetProps {
  visible: boolean;
  /** "Perú", "Kansai". */
  place: string;
  onClose: () => void;
  /** Año aproximado de la visita (opcional). */
  onMark: (year: number | null) => void;
}

const toYear = (text: string): number | null => {
  const n = Number.parseInt(text, 10);
  return Number.isInteger(n) && n > 1900 && n <= new Date().getFullYear() ? n : null;
};

/** M1.4c · Marcar a mano un sitio donde estuviste sin fotos que lo prueben. */
export function MarkSheet({ visible, place, onClose, onMark }: MarkSheetProps) {
  const [year, setYear] = useState('');
  const invalid = year.trim().length > 0 && toYear(year) === null;
  return (
    <Sheet visible={visible} onClose={onClose} label={`Marcar ${place}`}>
      <Text role="heading" style={{ ...typography.heading, color: colors.ink }}>
        {`¿Estuviste en ${place}?`}
      </Text>
      <Text style={{ ...typography.bodyS, color: colors.inkMuted }}>
        Se levanta la niebla aunque no tengas fotos. Lo marcado a mano se distingue de lo que
        detectan tus fotos.
      </Text>
      <TextField
        label="Año (opcional)"
        value={year}
        onChangeText={setYear}
        placeholder="2019"
        type="number"
        error={invalid ? 'Escribe un año entre 1900 y hoy' : undefined}
      />
      <Button
        block
        icon="check"
        disabled={invalid}
        onPress={() => {
          onMark(toYear(year));
          setYear('');
        }}
      >
        Marcar como visitado
      </Button>
      <Button block variant="ghost" onPress={onClose}>
        Cancelar
      </Button>
    </Sheet>
  );
}
