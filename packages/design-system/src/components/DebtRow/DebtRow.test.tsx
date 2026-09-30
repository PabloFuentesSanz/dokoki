import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DebtRow } from './DebtRow';

describe('DebtRow', () => {
  it('cuando debes: lo dice con palabras y ofrece Saldar, que pasa a Saldado', () => {
    const onSettle = vi.fn();
    const { container } = render(
      <DebtRow from="Tú" to="Lucía" amount={32.5} onSettle={onSettle} />,
    );
    expect(container).toHaveTextContent('Debes a Lucía');
    expect(container).toHaveTextContent('32,50 EUR');
    fireEvent.click(screen.getByRole('button', { name: 'Saldar' }));
    expect(onSettle).toHaveBeenCalledTimes(1);
    expect(container).toHaveTextContent('Saldado');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('cuando te deben: lo dice con palabras y ofrece Recordar', () => {
    const onRemind = vi.fn();
    const { container } = render(
      <DebtRow from="Carlos" to="Tú" amount={1200} currency="JPY" onRemind={onRemind} />,
    );
    expect(container).toHaveTextContent('Carlos te debe');
    fireEvent.click(screen.getByRole('button', { name: 'Recordar' }));
    expect(onRemind).toHaveBeenCalledTimes(1);
  });

  it('saldada desde el principio no tiene acción', () => {
    render(<DebtRow from="Tú" to="Bea" amount={10} settled />);
    expect(screen.getByText('Saldado')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
