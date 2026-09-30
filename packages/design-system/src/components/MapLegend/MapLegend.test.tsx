import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MapLegend } from './MapLegend';

describe('MapLegend', () => {
  it('es un grupo con las 5 entradas del mapa', () => {
    render(<MapLegend />);
    const legend = screen.getByRole('group', { name: 'Leyenda del mapa' });
    for (const entry of [
      'Leyenda',
      'Desbloqueado',
      'Por descubrir',
      'Recorrido',
      'Planificado',
      'Lugar con fotos',
    ]) {
      expect(legend).toHaveTextContent(entry);
    }
  });

  it('admite otro título', () => {
    render(<MapLegend title="Capas" />);
    expect(screen.getByText('Capas')).toBeInTheDocument();
  });
});
