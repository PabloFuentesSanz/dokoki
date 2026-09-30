import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ExpenseRow } from './ExpenseRow';

describe('ExpenseRow', () => {
  it('muestra quién pagó, cuándo, cómo se reparte y el importe', () => {
    const { container } = render(
      <ExpenseRow
        title="Ramen Ichiran"
        payer="Lucía"
        amount={4200}
        currency="JPY"
        converted="≈ 25,40 EUR"
        category="food"
        date="12 abr."
        split="a partes iguales"
      />,
    );
    expect(container).toHaveTextContent('Ramen Ichiran');
    expect(container).toHaveTextContent('Pagó Lucía, 12 abr., a partes iguales');
    expect(container).toHaveTextContent('4.200 JPY');
    expect(container).toHaveTextContent('≈ 25,40 EUR');
  });

  it('sin fecha ni reparto solo dice quién pagó', () => {
    const { container } = render(<ExpenseRow title="Taxi" payer="Tú" amount={18.5} />);
    expect(container).toHaveTextContent('Pagó Tú');
    expect(container).toHaveTextContent('18,50 EUR');
  });
});
