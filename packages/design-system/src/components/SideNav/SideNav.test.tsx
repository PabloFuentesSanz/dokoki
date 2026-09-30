import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SideNav } from './SideNav';

describe('SideNav', () => {
  it('tiene las mismas secciones que la barra inferior y marca la activa', () => {
    render(<SideNav active="photos" />);
    expect(screen.getAllByRole('tab')).toHaveLength(4);
    expect(screen.getByRole('tab', { name: 'Fotos' })).toHaveAttribute('aria-selected', 'true');
  });

  it('la captura es un botón con texto y recuerda los atajos de teclado', () => {
    const onCapture = vi.fn();
    const { container } = render(<SideNav active="map" onCapture={onCapture} />);
    fireEvent.click(screen.getByRole('button', { name: 'Captura' }));
    expect(onCapture).toHaveBeenCalledTimes(1);
    expect(container).toHaveTextContent('⌘K');
  });

  it('avisa al navegar', () => {
    const onNavigate = vi.fn();
    render(<SideNav active="map" onNavigate={onNavigate} />);
    fireEvent.click(screen.getByRole('tab', { name: 'Tú' }));
    expect(onNavigate).toHaveBeenCalledWith('me');
  });
});
