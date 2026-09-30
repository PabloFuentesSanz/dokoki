import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { focusRingStyle, useFocusRing } from '../../internal/useFocusRing';
import { colors, spacing, typography } from '../../tokens';
import { fieldStyles } from '../TextField/TextField';

export interface AmountInputProps {
  /** Por defecto "Importe". */
  label?: string;
  /** ISO 4217. */
  currency?: string;
  currencies?: readonly string[];
  value?: string;
  onChangeAmount?: (text: string) => void;
  onChangeCurrency?: (currency: string) => void;
  /** Útil para mostrar la conversión: no conviertas en silencio. */
  hint?: string;
}

const DEFAULT_CURRENCIES = ['EUR', 'JPY', 'USD', 'GBP'] as const;

/** Importe con selector de divisa a la izquierda y cifra alineada a la derecha. */
export function AmountInput({
  label = 'Importe',
  currency,
  currencies = DEFAULT_CURRENCIES,
  value,
  onChangeAmount,
  onChangeCurrency,
  hint,
}: AmountInputProps) {
  const [current, setCurrent] = useState(currency ?? currencies[0] ?? 'EUR');
  const { focused, focusProps } = useFocusRing();

  const nextCurrency = () => {
    const next = currencies[(currencies.indexOf(current) + 1) % currencies.length] ?? current;
    setCurrent(next);
    onChangeCurrency?.(next);
  };

  return (
    <View style={styles.field}>
      <Text style={fieldStyles.label}>{label}</Text>
      <View style={styles.row}>
        <Pressable
          role="button"
          aria-label={`Divisa: ${current}. Cambiar`}
          onPress={nextCurrency}
          {...focusProps}
          style={[fieldStyles.input, styles.currency, focused && focusRingStyle]}
        >
          <Text style={styles.currencyText}>{current}</Text>
        </Pressable>
        <TextInput
          aria-label={label}
          inputMode="decimal"
          keyboardType="decimal-pad"
          value={value}
          onChangeText={onChangeAmount}
          placeholder="0,00"
          placeholderTextColor={colors.inkMuted}
          style={[fieldStyles.input, styles.amount]}
        />
      </View>
      {hint ? <Text style={fieldStyles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 6, minWidth: 240 },
  row: { flexDirection: 'row' },
  currency: {
    width: 88,
    justifyContent: 'center',
    borderRightWidth: 1,
    borderStyle: 'dashed',
    borderRightColor: colors.ink,
    borderTopRightRadius: 0,
  },
  currencyText: { ...typography.dataStrong, fontSize: 16, color: colors.ink },
  amount: {
    flex: 1,
    textAlign: 'right',
    fontFamily: typography.dataStrong.fontFamily,
    borderTopLeftRadius: 0,
    paddingHorizontal: spacing[3],
  },
});
