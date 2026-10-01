import { render, screen } from '@testing-library/react';
import { Text } from 'react-native';
import { describe, expect, it } from 'vitest';
import { colors } from '../../tokens';
import { grainDots, Paper } from './Paper';

describe('Paper', () => {
  it('pinta el contenido sobre papel con grano decorativo', () => {
    const { container } = render(
      <Paper>
        <Text>Viajes</Text>
      </Paper>,
    );
    expect(screen.getByText('Viajes')).toBeInTheDocument();
    // El grano es decoración: oculto a los lectores de pantalla y sin recibir toques.
    expect(container.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
    expect(container.firstElementChild).toHaveStyle({ backgroundColor: colors.paper });
  });

  it('usa el papel elevado en hojas y tarjetas', () => {
    const { container } = render(<Paper tone="raised" />);
    expect(container.firstElementChild).toHaveStyle({ backgroundColor: colors.paperRaised });
  });

  it('el grano es siempre el mismo (no cambia entre renders) y cabe en su tesela', () => {
    const a = grainDots();
    expect(a).toEqual(grainDots());
    expect(a.length).toBeGreaterThan(100);
    for (const d of a) {
      expect(d.x).toBeGreaterThanOrEqual(0);
      expect(d.x).toBeLessThan(160);
      expect(d.y).toBeGreaterThanOrEqual(0);
      expect(d.y).toBeLessThan(160);
    }
  });
});
