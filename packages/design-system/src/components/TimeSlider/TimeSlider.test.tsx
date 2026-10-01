import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TimeSlider } from './TimeSlider';

describe('TimeSlider', () => {
  it('es un deslizador con rango y valor, en el último año por defecto', () => {
    render(<TimeSlider min={2018} max={2026} />);
    const slider = screen.getByRole('slider', { name: 'Tu mapa hasta' });
    expect(slider).toHaveAttribute('aria-valuemin', '2018');
    expect(slider).toHaveAttribute('aria-valuemax', '2026');
    expect(slider).toHaveAttribute('aria-valuenow', '2026');
  });

  it('cambia de año al pulsar cada año de la pista', () => {
    const onChange = vi.fn();
    render(<TimeSlider min={2018} max={2026} value={2020} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Año 2022' }));
    expect(onChange).toHaveBeenCalledWith(2022);
    expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '2022');
    expect(screen.getAllByRole('button')).toHaveLength(9);
  });

  it('sigue al valor cuando cambia desde fuera (reproducir)', () => {
    const { rerender } = render(<TimeSlider min={2018} max={2026} value={2019} />);
    rerender(<TimeSlider min={2018} max={2026} value={2021} />);
    expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '2021');
  });

  it('funciona con un solo año', () => {
    render(<TimeSlider min={2026} max={2026} />);
    expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '2026');
  });
});
