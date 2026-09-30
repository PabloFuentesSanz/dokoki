import { StyleSheet, Text, View } from 'react-native';
import { formatMoney } from '../../internal/format';
import { colors, radii } from '../../tokens';
import { Icon, type IconName } from '../Icon/Icon';
import { rowStyles } from '../TripRow/TripRow';

export type ExpenseCategory = 'food' | 'transport' | 'stay' | 'activity' | 'other';

export interface ExpenseRowProps {
  title: string;
  payer: string;
  amount: number;
  /** ISO 4217. */
  currency?: string;
  /** Importe en la divisa base: "≈ 25,40 EUR". */
  converted?: string;
  category?: ExpenseCategory;
  date?: string;
  /** Cómo se reparte: "a partes iguales entre 3". */
  split?: string;
}

const CATEGORY_ICON: Record<ExpenseCategory, IconName> = {
  food: 'food',
  transport: 'train',
  stay: 'bed',
  activity: 'ticket',
  other: 'coin',
};

/** Fila de gasto con categoría, quién pagó, importe y su conversión. */
export function ExpenseRow({
  title,
  payer,
  amount,
  currency = 'EUR',
  converted,
  category = 'other',
  date,
  split,
}: ExpenseRowProps) {
  const meta = [`Pagó ${payer}`, date, split].filter(Boolean).join(', ');
  return (
    <View style={rowStyles.row}>
      <View style={styles.category}>
        <Icon name={CATEGORY_ICON[category]} size={20} />
      </View>
      <View style={rowStyles.body}>
        <Text style={rowStyles.title}>{title}</Text>
        <Text style={rowStyles.meta}>{meta}</Text>
      </View>
      <View style={styles.amounts}>
        <Text style={rowStyles.amount}>{formatMoney(amount, currency)}</Text>
        {converted ? <Text style={rowStyles.meta}>{converted}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  category: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: colors.ink,
    borderRadius: radii.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amounts: { alignItems: 'flex-end', gap: 2 },
});
