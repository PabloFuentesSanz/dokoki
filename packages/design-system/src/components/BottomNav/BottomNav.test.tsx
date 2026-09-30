import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { BottomNav } from './BottomNav';

describe('BottomNav', () => {
  it('tiene las 4 secciones y la captura en el centro', () => {
    render(<BottomNav active="map" />);
    expect(screen.getAllByRole('tab').map((tab) => tab.getAttribute('aria-label'))).toEqual([
      'Mapa',
      'Viajes',
      'Fotos',
      'Tú',
    ]);
    expect(screen.getByRole('button', { name: /Captura rápida/ })).toBeInTheDocument();
  });

  it('marca la sección activa', () => {
    render(<BottomNav active="trips" />);
    expect(screen.getByRole('tab', { name: 'Viajes' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Mapa' })).toHaveAttribute('aria-selected', 'false');
  });

  it('avisa al navegar y al capturar', () => {
    const onNavigate = vi.fn();
    const onCapture = vi.fn();
    render(<BottomNav active="map" onNavigate={onNavigate} onCapture={onCapture} />);
    fireEvent.click(screen.getByRole('tab', { name: 'Fotos' }));
    fireEvent.click(screen.getByRole('button', { name: /Captura rápida/ }));
    expect(onNavigate).toHaveBeenCalledWith('photos');
    expect(onCapture).toHaveBeenCalledTimes(1);
  });
});
