import { StyleSheet, Text, TextInput, View, type KeyboardTypeOptions } from 'react-native';
import { useFocusRing } from '../../internal/useFocusRing';
import { colors, radii, spacing, touchTarget, typography } from '../../tokens';

export type TextFieldType = 'text' | 'email' | 'password' | 'number';

export interface TextFieldProps {
  /** Obligatorio y siempre fuera del campo. */
  label: string;
  /** Valor controlado. */
  value?: string;
  /** Valor inicial si no se controla. */
  defaultValue?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  /** Ayuda bajo el campo. */
  hint?: string;
  /** Sustituye a hint y marca el campo en rojo. Dice qué pasa y cómo arreglarlo. */
  error?: string;
  type?: TextFieldType;
  disabled?: boolean;
}

const KEYBOARD: Record<TextFieldType, KeyboardTypeOptions> = {
  text: 'default',
  email: 'email-address',
  password: 'default',
  number: 'decimal-pad',
};

/** Campo con etiqueta en serif y valor a máquina de escribir, subrayado como una línea de formulario de papel. */
export function TextField({
  label,
  value,
  defaultValue,
  onChangeText,
  placeholder,
  hint,
  error,
  type = 'text',
  disabled = false,
}: TextFieldProps) {
  const { focused, focusProps } = useFocusRing();
  const note = error ?? hint;
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        aria-label={label}
        accessibilityHint={note}
        value={value}
        defaultValue={defaultValue}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.inkMuted}
        editable={!disabled}
        aria-disabled={disabled}
        keyboardType={KEYBOARD[type]}
        secureTextEntry={type === 'password'}
        autoCapitalize={type === 'text' ? 'sentences' : 'none'}
        {...focusProps}
        style={[
          styles.input,
          error ? styles.inputError : null,
          focused && styles.inputFocused,
          disabled && styles.inputDisabled,
        ]}
      />
      {note ? <Text style={[styles.hint, error ? styles.hintError : null]}>{note}</Text> : null}
    </View>
  );
}

export const fieldStyles = StyleSheet.create({
  label: { ...typography.bodyStrong, fontSize: 14, lineHeight: 20, color: colors.ink },
  hint: { ...typography.data, color: colors.inkMuted },
  input: {
    minHeight: touchTarget,
    paddingHorizontal: spacing[3],
    backgroundColor: colors.paperRaised,
    borderBottomWidth: 1,
    borderBottomColor: colors.ink,
    borderTopLeftRadius: radii.sm,
    borderTopRightRadius: radii.sm,
    color: colors.ink,
    fontFamily: typography.data.fontFamily,
    fontSize: 16,
  },
});

const styles = StyleSheet.create({
  field: { gap: 6, minWidth: 240 },
  label: fieldStyles.label,
  input: fieldStyles.input,
  inputError: { borderBottomWidth: 2, borderBottomColor: colors.stampRedText },
  inputFocused: { borderBottomWidth: 2, borderBottomColor: colors.focus },
  inputDisabled: { backgroundColor: colors.paperSunk, color: colors.inkMuted },
  hint: fieldStyles.hint,
  hintError: { color: colors.stampRedText },
});
