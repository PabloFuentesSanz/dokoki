import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Polaroid } from './Polaroid';

describe('Polaroid', () => {
  it('sin foto muestra el marcador con nombre accesible y las coordenadas', () => {
    const { container } = render(<Polaroid caption="Fushimi Inari" lat={34.9671} lng={135.7727} />);
    expect(screen.getByRole('img', { name: 'Foto de Fushimi Inari' })).toBeInTheDocument();
    expect(container).toHaveTextContent('34,97° N');
    expect(screen.getByText('Fushimi Inari')).toBeInTheDocument();
  });

  it('con foto usa el pie como texto alternativo por defecto', () => {
    render(<Polaroid caption="Arashiyama" src="file:///fotos/arashiyama.jpg" />);
    expect(screen.getByRole('img', { name: 'Arashiyama' })).toBeInTheDocument();
  });

  it('solo la destacada lleva inclinación', () => {
    const { container, rerender } = render(<Polaroid caption="Nara" tilt="left" tape />);
    expect(container.firstElementChild).toHaveStyle({ transform: 'rotate(-1.5deg)' });
    rerender(<Polaroid caption="Nara" />);
    expect(container.firstElementChild).toHaveStyle({ transform: 'rotate(0deg)' });
  });
});
