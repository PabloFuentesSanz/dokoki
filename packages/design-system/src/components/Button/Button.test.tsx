import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('es un botón con el texto de la acción y responde al pulsar', () => {
    const onPress = vi.fn();
    render(<Button onPress={onPress}>Guardar gasto</Button>);
    fireEvent.click(screen.getByRole('button', { name: 'Guardar gasto' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('deshabilitado no responde y lo anuncia', () => {
    const onPress = vi.fn();
    render(
      <Button onPress={onPress} disabled>
        Saldar
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Saldar' });
    fireEvent.click(button);
    expect(onPress).not.toHaveBeenCalled();
    expect(button).toHaveAttribute('aria-disabled', 'true');
  });

  it('cargando queda bloqueado y marcado como ocupado', () => {
    const onPress = vi.fn();
    render(
      <Button onPress={onPress} loading>
        Planificar viaje
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Planificar viaje' });
    fireEvent.click(button);
    expect(onPress).not.toHaveBeenCalled();
    expect(button).toHaveAttribute('aria-busy', 'true');
  });

  it('mide al menos 44 px de alto (objetivo táctil)', () => {
    render(<Button>Empezar</Button>);
    expect(screen.getByRole('button')).toHaveStyle({ minHeight: '44px' });
  });
});
