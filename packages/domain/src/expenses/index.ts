/**
 * Gastos compartidos: reparto y liquidación mínima (M7, fase V2).
 *
 * Todos los importes son ENTEROS en unidades menores (céntimos) de la divisa base del viaje.
 * La conversión desde la divisa del gasto, con el tipo de cambio de su día, ocurre antes.
 */

/** Cómo se reparte un gasto. */
export type Split =
  /** A partes iguales entre estas personas. */
  | { kind: 'equal'; participants: readonly string[] }
  /** Por partes: { ana: 2, bea: 1 } → Ana paga el doble que Bea. */
  | { kind: 'shares'; shares: Readonly<Record<string, number>> }
  /** Importes exactos por persona; tienen que sumar el total. */
  | { kind: 'exact'; amounts: Readonly<Record<string, number>> };

export interface Expense {
  id: string;
  /** Quién pagó. */
  paidBy: string;
  /** Total en céntimos de la divisa base. */
  amount: number;
  split: Split;
}

/** `from` debe `amount` céntimos a `to`. */
export interface Debt {
  from: string;
  to: string;
  amount: number;
}

const byId = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0);

/**
 * Reparto proporcional con el método del mayor resto: nunca se pierde ni se inventa un céntimo.
 * A igual resto, el céntimo va al id menor, para que el resultado sea determinista.
 */
function allocate(amount: number, weights: Readonly<Record<string, number>>): Map<string, number> {
  const entries = Object.entries(weights).sort(([a], [b]) => byId(a, b));
  const totalWeight = entries.reduce((sum, [, w]) => sum + w, 0);
  if (entries.length === 0 || entries.some(([, w]) => !(w > 0))) {
    throw new RangeError('El reparto necesita personas con pesos positivos.');
  }

  const parts = entries.map(([id, weight]) => {
    const exact = (amount * weight) / totalWeight;
    return { id, value: Math.floor(exact), remainder: exact - Math.floor(exact) };
  });
  let left = amount - parts.reduce((sum, part) => sum + part.value, 0);
  const byRemainder = [...parts].sort((a, b) => b.remainder - a.remainder || byId(a.id, b.id));
  for (const part of byRemainder) {
    if (left === 0) break;
    part.value += 1;
    left -= 1;
  }
  return new Map(parts.map((part) => [part.id, part.value]));
}

function shareOf(expense: Expense): Map<string, number> {
  const { amount, split } = expense;
  if (!Number.isInteger(amount) || amount <= 0) {
    throw new RangeError(`Importe no válido en "${expense.id}": usa céntimos enteros y positivos.`);
  }
  switch (split.kind) {
    case 'equal':
      return allocate(amount, Object.fromEntries(split.participants.map((id) => [id, 1])));
    case 'shares':
      return allocate(amount, split.shares);
    case 'exact': {
      const sum = Object.values(split.amounts).reduce((total, value) => total + value, 0);
      if (sum !== amount) {
        throw new RangeError(
          `Los importes de "${expense.id}" suman ${sum} y el gasto es ${amount}.`,
        );
      }
      return new Map(Object.entries(split.amounts));
    }
  }
}

function sortDebts(debts: Debt[]): Debt[] {
  return debts.sort((a, b) => byId(a.from, b.from) || byId(a.to, b.to));
}

/**
 * Quién debe a quién, persona a persona: cada participante debe su parte a quien pagó, y las
 * deudas cruzadas entre dos personas se compensan. Ordenado por deudor y acreedor.
 */
export function calculateDebts(expenses: readonly Expense[]): Debt[] {
  const pairKey = (from: string, to: string): string => JSON.stringify([from, to]);
  const pairs = new Map<string, Debt>();

  for (const expense of expenses) {
    for (const [participant, share] of shareOf(expense)) {
      if (participant === expense.paidBy) continue;
      const key = pairKey(participant, expense.paidBy);
      const pair = pairs.get(key);
      if (pair) pair.amount += share;
      else pairs.set(key, { from: participant, to: expense.paidBy, amount: share });
    }
  }

  const debts: Debt[] = [];
  const done = new Set<string>();
  for (const [key, { from, to, amount }] of pairs) {
    const reverseKey = pairKey(to, from);
    if (done.has(reverseKey)) continue;
    done.add(key);
    const netAmount = amount - (pairs.get(reverseKey)?.amount ?? 0);
    if (netAmount > 0) debts.push({ from, to, amount: netAmount });
    else if (netAmount < 0) debts.push({ from: to, to: from, amount: -netAmount });
  }
  return sortDebts(debts);
}

/**
 * Liquidación mínima: reduce las deudas al menor número práctico de pagos (como mucho n − 1).
 *
 * Algoritmo voraz: calcula el saldo neto de cada persona y empareja siempre a quien más debe
 * con quien más le deben, por el menor de los dos importes. Encontrar el mínimo exacto es
 * NP-difícil; el voraz da n − 1 como cota y en grupos de viaje suele ser óptimo.
 */
export function minimizeTransactions(debts: readonly Debt[]): Debt[] {
  const balance = new Map<string, number>();
  for (const { from, to, amount } of debts) {
    balance.set(from, (balance.get(from) ?? 0) - amount);
    balance.set(to, (balance.get(to) ?? 0) + amount);
  }

  const people = [...balance.entries()].map(([id, amount]) => ({ id, amount }));
  const largestFirst = (
    a: { id: string; amount: number },
    b: { id: string; amount: number },
  ): number => b.amount - a.amount || byId(a.id, b.id);
  const debtors = people.filter((p) => p.amount < 0).map((p) => ({ id: p.id, amount: -p.amount }));
  const creditors = people.filter((p) => p.amount > 0);

  const result: Debt[] = [];
  for (;;) {
    debtors.sort(largestFirst);
    creditors.sort(largestFirst);
    const debtor = debtors[0];
    const creditor = creditors[0];
    if (!debtor || !creditor || debtor.amount === 0) break;
    const amount = Math.min(debtor.amount, creditor.amount);
    result.push({ from: debtor.id, to: creditor.id, amount });
    debtor.amount -= amount;
    creditor.amount -= amount;
  }
  return result;
}
