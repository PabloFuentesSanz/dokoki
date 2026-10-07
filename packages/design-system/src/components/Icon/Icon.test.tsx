import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Icon, iconNames } from './Icon';

describe('Icon', () => {
  it('con etiqueta es una imagen con nombre accesible', () => {
    render(<Icon name="share" label="Compartir" />);
    expect(screen.getByRole('img', { name: 'Compartir' })).toBeInTheDocument();
  });

  it('sin etiqueta es decorativo y queda oculto al lector de pantalla', () => {
    render(<Icon name="map" />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('dibuja un trazo por cada subtrazo, en rejilla de 24 y 22 px por defecto', () => {
    const { container } = render(<Icon name="close" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
    expect(svg).toHaveAttribute('width', '22');
    expect(container.querySelectorAll('path')).toHaveLength(2);
  });

  it('tiene los 24 iconos del sistema', () => {
    expect(iconNames).toHaveLength(26);
  });
});
