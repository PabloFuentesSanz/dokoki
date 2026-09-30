import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TripRow } from './TripRow';

describe('TripRow', () => {
  it('viaje pasado: número en rojo, título y metadatos', () => {
    render(<TripRow n={2} title="Kioto, Nara y Osaka" meta="abril 2024, 9 días, 312 fotos" />);
    const row = screen.getByRole('link', {
      name: 'Kioto, Nara y Osaka, abril 2024, 9 días, 312 fotos',
    });
    expect(row).toHaveTextContent('N.º2');
    expect(row).not.toHaveTextContent('Próximo');
  });

  it('viaje futuro: etiqueta Próximo', () => {
    render(<TripRow n={3} title="Perú" meta="octubre 2026, 14 días" planned />);
    expect(screen.getByRole('link')).toHaveTextContent('Próximo');
  });

  it('abre el viaje al pulsar', () => {
    const onPress = vi.fn();
    render(<TripRow n={1} title="Lisboa" meta="julio 2019" onPress={onPress} />);
    fireEvent.click(screen.getByRole('link'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
