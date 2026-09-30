import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Checkbox } from './Checkbox';

describe('Checkbox', () => {
  it('es una casilla con nombre y estado', () => {
    render(<Checkbox label="Pasaporte" checked />);
    expect(screen.getByRole('checkbox', { name: 'Pasaporte' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
  });

  it('se marca y desmarca al pulsar', () => {
    const onChange = vi.fn();
    render(<Checkbox label="Lucía" onChange={onChange} />);
    const box = screen.getByRole('checkbox', { name: 'Lucía' });
    fireEvent.click(box);
    expect(onChange).toHaveBeenLastCalledWith(true);
    expect(box).toHaveAttribute('aria-checked', 'true');
    fireEvent.click(box);
    expect(onChange).toHaveBeenLastCalledWith(false);
  });

  it('toda la fila es el objetivo táctil (44 px)', () => {
    render(<Checkbox label="Adaptador de enchufe" />);
    expect(screen.getByRole('checkbox')).toHaveStyle({ minHeight: '44px' });
  });
});
