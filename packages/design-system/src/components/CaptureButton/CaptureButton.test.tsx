import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CaptureButton } from './CaptureButton';

describe('CaptureButton', () => {
  it('tiene un nombre accesible que explica qué captura', () => {
    render(<CaptureButton />);
    expect(
      screen.getByRole('button', { name: 'Captura rápida: foto, nota, gasto o lugar' }),
    ).toBeInTheDocument();
  });

  it('abre la captura al pulsar', () => {
    const onPress = vi.fn();
    render(<CaptureButton label="Captura" onPress={onPress} />);
    fireEvent.click(screen.getByRole('button', { name: 'Captura' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('es redondo y supera el objetivo táctil (56 px)', () => {
    render(<CaptureButton />);
    expect(screen.getByRole('button')).toHaveStyle({ width: '56px', height: '56px' });
  });
});
