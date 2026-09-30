import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { colors } from '../../tokens';
import { RouteMarker } from './RouteMarker';

describe('RouteMarker', () => {
  it('se anuncia como número de viaje y escribe N.º', () => {
    render(<RouteMarker n={2} />);
    expect(screen.getByRole('img', { name: 'Viaje número 2' })).toHaveTextContent('N.º2');
  });

  it('rojo = hecho, azul = por hacer', () => {
    const { container, rerender } = render(<RouteMarker n={1} />);
    expect(container.querySelector('circle')).toHaveAttribute('stroke', colors.stampRed);
    rerender(<RouteMarker n={1} tone="blue" />);
    expect(container.querySelector('circle')).toHaveAttribute('stroke', colors.stampBlue);
  });
});
