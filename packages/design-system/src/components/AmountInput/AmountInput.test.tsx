import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AmountInput } from './AmountInput';

describe('AmountInput', () => {
  it('el importe se llama "Importe" por defecto y avisa de los cambios', () => {
    const onChangeAmount = vi.fn();
    render(<AmountInput onChangeAmount={onChangeAmount} />);
    fireEvent.change(screen.getByRole('textbox', { name: 'Importe' }), {
      target: { value: '42,50' },
    });
    expect(onChangeAmount).toHaveBeenCalledWith('42,50');
  });

  it('el selector de divisa recorre la lista y vuelve al principio', () => {
    const onChangeCurrency = vi.fn();
    render(
      <AmountInput
        currency="JPY"
        currencies={['EUR', 'JPY']}
        onChangeCurrency={onChangeCurrency}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Divisa: JPY. Cambiar' }));
    expect(onChangeCurrency).toHaveBeenLastCalledWith('EUR');
    fireEvent.click(screen.getByRole('button', { name: 'Divisa: EUR. Cambiar' }));
    expect(onChangeCurrency).toHaveBeenLastCalledWith('JPY');
  });

  it('muestra la conversión en la ayuda', () => {
    render(<AmountInput currency="JPY" hint="≈ 25,40 EUR al cambio del 12.04.2024" />);
    expect(screen.getByText('≈ 25,40 EUR al cambio del 12.04.2024')).toBeInTheDocument();
  });
});
