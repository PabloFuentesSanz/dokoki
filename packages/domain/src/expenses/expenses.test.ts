import { describe, expect, it } from 'vitest';
import { calculateDebts, minimizeTransactions, type Debt, type Expense } from './index';

// Importes en céntimos de la divisa base del viaje (enteros: nada de coma flotante con dinero).
function equal(id: string, paidBy: string, amount: number, participants: string[]): Expense {
  return { id, paidBy, amount, split: { kind: 'equal', participants } };
}

/** Saldo neto de cada persona: positivo = le deben, negativo = debe. */
function net(debts: readonly Debt[]): Record<string, number> {
  const balance: Record<string, number> = {};
  for (const { from, to, amount } of debts) {
    balance[from] = (balance[from] ?? 0) - amount;
    balance[to] = (balance[to] ?? 0) + amount;
  }
  return Object.fromEntries(Object.entries(balance).filter(([, v]) => v !== 0));
}

describe('calculateDebts', () => {
  it('reparto a partes iguales: cada uno debe su parte a quien pagó', () => {
    expect(calculateDebts([equal('cena', 'ana', 9000, ['ana', 'bea', 'carlos'])])).toEqual([
      { from: 'bea', to: 'ana', amount: 3000 },
      { from: 'carlos', to: 'ana', amount: 3000 },
    ]);
  });

  it('reparte los céntimos sobrantes de forma determinista (por id)', () => {
    expect(calculateDebts([equal('taxi', 'carlos', 1000, ['carlos', 'bea', 'ana'])])).toEqual([
      { from: 'ana', to: 'carlos', amount: 334 },
      { from: 'bea', to: 'carlos', amount: 333 },
    ]);
  });

  it('reparto por partes (pesos)', () => {
    const expense: Expense = {
      id: 'hotel',
      paidBy: 'ana',
      amount: 1000,
      split: { kind: 'shares', shares: { ana: 2, bea: 1, carlos: 1 } },
    };
    expect(calculateDebts([expense])).toEqual([
      { from: 'bea', to: 'ana', amount: 250 },
      { from: 'carlos', to: 'ana', amount: 250 },
    ]);
  });

  it('el sobrante de un reparto por partes va a quien tiene mayor resto', () => {
    const expense: Expense = {
      id: 'museo',
      paidBy: 'ana',
      amount: 100,
      split: { kind: 'shares', shares: { bea: 1, carlos: 2 } },
    };
    expect(calculateDebts([expense])).toEqual([
      { from: 'bea', to: 'ana', amount: 33 },
      { from: 'carlos', to: 'ana', amount: 67 },
    ]);
  });

  it('importes exactos por persona', () => {
    const expense: Expense = {
      id: 'tren',
      paidBy: 'ana',
      amount: 1000,
      split: { kind: 'exact', amounts: { bea: 700, carlos: 300 } },
    };
    expect(calculateDebts([expense])).toEqual([
      { from: 'bea', to: 'ana', amount: 700 },
      { from: 'carlos', to: 'ana', amount: 300 },
    ]);
  });

  it('compensa las deudas cruzadas entre dos personas', () => {
    const debts = calculateDebts([
      equal('cena', 'ana', 100, ['ana', 'bea']),
      equal('café', 'bea', 30, ['ana', 'bea']),
    ]);
    expect(debts).toEqual([{ from: 'bea', to: 'ana', amount: 35 }]);

    const reversed = calculateDebts([
      equal('café', 'bea', 30, ['ana', 'bea']),
      equal('cena', 'ana', 100, ['ana', 'bea']),
    ]);
    expect(reversed).toEqual(debts);
  });

  it('suma varios gastos entre las mismas personas y ordena por deudor y acreedor', () => {
    const debts = calculateDebts([
      equal('cena', 'carlos', 200, ['bea', 'carlos']),
      equal('taxi', 'ana', 100, ['ana', 'bea']),
      equal('café', 'ana', 60, ['ana', 'bea']),
    ]);
    expect(debts).toEqual([
      { from: 'bea', to: 'ana', amount: 80 },
      { from: 'bea', to: 'carlos', amount: 100 },
    ]);
  });

  it('si las deudas cruzadas se anulan, no queda nada', () => {
    const debts = calculateDebts([
      equal('a', 'ana', 100, ['ana', 'bea']),
      equal('b', 'bea', 100, ['ana', 'bea']),
    ]);
    expect(debts).toEqual([]);
  });

  it('rechaza importes no enteros, negativos o repartos vacíos o que no cuadran', () => {
    expect(() => calculateDebts([equal('x', 'ana', 10.5, ['ana'])])).toThrow(RangeError);
    expect(() => calculateDebts([equal('x', 'ana', 0, ['ana'])])).toThrow(RangeError);
    expect(() => calculateDebts([equal('x', 'ana', 100, [])])).toThrow(RangeError);
    expect(() =>
      calculateDebts([
        { id: 'x', paidBy: 'ana', amount: 100, split: { kind: 'shares', shares: { bea: 0 } } },
      ]),
    ).toThrow(RangeError);
    expect(() =>
      calculateDebts([
        { id: 'x', paidBy: 'ana', amount: 100, split: { kind: 'exact', amounts: { bea: 60 } } },
      ]),
    ).toThrow(RangeError);
  });
});

describe('minimizeTransactions', () => {
  it('convierte una cadena en un solo pago', () => {
    expect(
      minimizeTransactions([
        { from: 'ana', to: 'bea', amount: 1000 },
        { from: 'bea', to: 'carlos', amount: 1000 },
      ]),
    ).toEqual([{ from: 'ana', to: 'carlos', amount: 1000 }]);
  });

  it('conserva el saldo de cada persona con como mucho n − 1 pagos', () => {
    const debts: Debt[] = [
      { from: 'ana', to: 'bea', amount: 4000 },
      { from: 'ana', to: 'carlos', amount: 1500 },
      { from: 'bea', to: 'dani', amount: 2500 },
      { from: 'carlos', to: 'dani', amount: 3000 },
      { from: 'dani', to: 'ana', amount: 500 },
    ];
    const settled = minimizeTransactions(debts);
    expect(net(settled)).toEqual(net(debts));
    expect(settled.length).toBeLessThanOrEqual(3);
    expect(settled.every((d) => d.amount > 0)).toBe(true);
  });

  it('empareja primero a quien más debe con quien más le deben', () => {
    expect(
      minimizeTransactions([
        { from: 'ana', to: 'carlos', amount: 700 },
        { from: 'bea', to: 'carlos', amount: 300 },
        { from: 'bea', to: 'dani', amount: 200 },
      ]),
    ).toEqual([
      { from: 'ana', to: 'carlos', amount: 700 },
      { from: 'bea', to: 'carlos', amount: 300 },
      { from: 'bea', to: 'dani', amount: 200 },
    ]);
  });

  it('si todo está saldado no hay pagos', () => {
    expect(
      minimizeTransactions([
        { from: 'ana', to: 'bea', amount: 500 },
        { from: 'bea', to: 'ana', amount: 500 },
      ]),
    ).toEqual([]);
    expect(minimizeTransactions([])).toEqual([]);
  });
});
