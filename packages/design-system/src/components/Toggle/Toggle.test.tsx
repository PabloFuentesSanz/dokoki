import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Toggle } from './Toggle';

describe('Toggle', () => {
  it('es un interruptor con nombre y estado', () => {
    render(<Toggle label="Solo con wifi" checked />);
    expect(screen.getByRole('switch', { name: 'Solo con wifi' })).toBeChecked();
  });

  it('cambia al pulsar y avisa del nuevo valor', () => {
    const onChange = vi.fn();
    render(<Toggle label="Seguir mi ruta" onChange={onChange} />);
    const toggle = screen.getByRole('switch', { name: 'Seguir mi ruta' });
    fireEvent.click(toggle);
    expect(onChange).toHaveBeenCalledWith(true);
    expect(toggle).toBeChecked();
  });
});
