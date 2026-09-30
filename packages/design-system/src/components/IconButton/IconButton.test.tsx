import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { IconButton } from './IconButton';

describe('IconButton', () => {
  it('se anuncia por su etiqueta, no por el icono', () => {
    const onPress = vi.fn();
    render(<IconButton icon="back" label="Volver" onPress={onPress} />);
    fireEvent.click(screen.getByRole('button', { name: 'Volver' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('mide 44 × 44 px', () => {
    render(<IconButton icon="share" label="Compartir Japón" />);
    expect(screen.getByRole('button')).toHaveStyle({ width: '44px', height: '44px' });
  });

  it('deshabilitado no responde', () => {
    const onPress = vi.fn();
    render(<IconButton icon="layers" label="Capas" disabled onPress={onPress} />);
    fireEvent.click(screen.getByRole('button', { name: 'Capas' }));
    expect(onPress).not.toHaveBeenCalled();
  });
});
