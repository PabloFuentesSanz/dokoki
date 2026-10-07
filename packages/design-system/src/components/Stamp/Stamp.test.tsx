import { act, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { colors } from '../../tokens';
import { Stamp, serratedPoints } from './Stamp';

describe('Stamp', () => {
  it('país: sello redondo con nombre en mayúsculas, fecha y "entrada"', () => {
    const { container } = render(<Stamp label="Japón" date="10.04.2024" />);
    expect(screen.getByRole('img', { name: 'Sello de Japón, 10.04.2024' })).toBeInTheDocument();
    expect(container.querySelectorAll('circle')).toHaveLength(2);
    expect(container).toHaveTextContent('JAPÓN');
    expect(container).toHaveTextContent('entrada');
  });

  it('ciudad: rectangular', () => {
    const { container } = render(<Stamp kind="city" label="Kioto" />);
    expect(container.querySelectorAll('rect')).toHaveLength(2);
    expect(screen.getByRole('img', { name: 'Sello de Kioto' })).toBeInTheDocument();
  });

  it('logro: dentado de 16 puntas y se anuncia como logro', () => {
    const { container } = render(<Stamp kind="achievement" label="5 continentes" tone="olive" />);
    expect(screen.getByRole('img', { name: 'Logro 5 continentes' })).toBeInTheDocument();
    expect(container.querySelector('polygon')).toHaveAttribute('stroke', colors.olive);
    expect(serratedPoints().split(' ')).toHaveLength(16);
  });

  it('inclinado por defecto; recto en el pasaporte', () => {
    const { rerender } = render(<Stamp label="Perú" tone="blue" />);
    expect(screen.getByRole('img')).toHaveStyle({ transform: 'rotate(-12deg)' });
    rerender(<Stamp label="Perú" tone="blue" straight />);
    expect(screen.getByRole('img').style.transform).toBe('');
  });

  it('se puede estampar al aparecer y acaba entero y legible', async () => {
    vi.useFakeTimers();
    render(<Stamp label="Japón" date="10.04.2024" stampIn delay={100} />);
    expect(screen.getByRole('img', { name: 'Sello de Japón, 10.04.2024' })).toBeInTheDocument();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });
    const art = screen.getByRole('img').firstElementChild;
    expect(art).toHaveStyle({ opacity: '1' });
    vi.useRealTimers();
  });
});
