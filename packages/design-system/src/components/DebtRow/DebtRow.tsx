import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { formatMoney } from '../../internal/format';
import { colors } from '../../tokens';
import { Avatar } from '../Avatar/Avatar';
import { Button } from '../Button/Button';
import { Tag } from '../Tag/Tag';
import { rowStyles } from '../TripRow/TripRow';

export interface DebtRowProps {
  /** Quien debe. */
  from: string;
  /** A quien ("Tú" si es el usuario). */
  to: string;
  amount: number;
  currency?: string;
  settled?: boolean;
  /** Tú debes: marcar como saldado. */
  onSettle?: () => void;
  /** Te deben: recordar a la otra persona. */
  onRemind?: () => void;
}

/**
 * Quién debe a quién, con la acción de saldar o recordar.
 * Rojo = debes; oliva = te deben; siempre con palabra, porque los dos colores se parecen en luminosidad.
 */
export function DebtRow({
  from,
  to,
  amount,
  currency = 'EUR',
  settled = false,
  onSettle,
  onRemind,
}: DebtRowProps) {
  const [isSettled, setSettled] = useState(settled);
  const owedToYou = to === 'Tú';
  const title = owedToYou ? `${from} te debe` : `Debes a ${to}`;

  return (
    <View style={rowStyles.row}>
      <Avatar name={owedToYou ? from : to} size={40} />
      <View style={rowStyles.body}>
        <Text style={rowStyles.title}>{title}</Text>
        {isSettled ? (
          <Tag tone="settled">Saldado</Tag>
        ) : (
          <Text
            style={[
              rowStyles.amount,
              styles.left,
              { color: owedToYou ? colors.oliveText : colors.stampRedText },
            ]}
          >
            {formatMoney(amount, currency)}
          </Text>
        )}
      </View>
      {isSettled ? null : owedToYou ? (
        <Button size="sm" variant="secondary" onPress={onRemind}>
          Recordar
        </Button>
      ) : (
        <Button
          size="sm"
          onPress={() => {
            setSettled(true);
            onSettle?.();
          }}
        >
          Saldar
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  left: { textAlign: 'left' },
});
