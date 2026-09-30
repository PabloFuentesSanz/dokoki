import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { colors } from '../../tokens';
import { RouteLine } from './RouteLine';

describe('RouteLine', () => {
  it('recorrido: continua y roja, con su nombre', () => {
    const { container } = render(<RouteLine />);
    const line = container.querySelector('line');
    expect(line).toHaveAttribute('stroke', colors.stampRed);
    expect(line).not.toHaveAttribute('stroke-dasharray');
    expect(screen.getByText('Recorrido')).toBeInTheDocument();
  });

  it('planificado: discontinua y azul', () => {
    const { container } = render(<RouteLine kind="planned" />);
    expect(container.querySelector('line')).toHaveAttribute('stroke-dasharray', '7 5');
    expect(screen.getByText('Planificado')).toBeInTheDocument();
  });

  it('admite otra etiqueta u ocultarla', () => {
    const { container, rerender } = render(
      <RouteLine kind="unexplored" label="Kansai por descubrir" />,
    );
    expect(screen.getByText('Kansai por descubrir')).toBeInTheDocument();
    rerender(<RouteLine kind="unexplored" hideLabel />);
    expect(container.textContent).toBe('');
  });
});
