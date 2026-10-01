import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CARD_FORMATS, previewSize } from '../services/cardFormats';
import { ShareCard } from '../ui/ShareCard';

describe('cardFormats', () => {
  it('historia 9:16 y post 4:5 a 1080 px de ancho', () => {
    expect(CARD_FORMATS.story).toMatchObject({ width: 1080, height: 1920 });
    expect(CARD_FORMATS.post).toMatchObject({ width: 1080, height: 1350 });
  });

  it('la vista previa mantiene la proporción', () => {
    expect(previewSize('story', 300)).toEqual({ width: 300, height: 533 });
    expect(previewSize('post', 1000)).toEqual({ width: 360, height: 450 });
  });
});

describe('ShareCard', () => {
  const props = {
    width: 360,
    height: 640,
    title: 'Kioto, Nara y Osaka',
    meta: 'abril 2024, 9 días, 312 fotos',
    places: ['Kyoto', 'Nara', 'Osaka'],
    stamps: [{ kind: 'country' as const, label: 'Japón', date: '10.04.2024' }],
  };

  it('postal: título, fechas, lugares y sello; nunca coordenadas (HU-27)', () => {
    const { container } = render(<ShareCard template="postal" {...props} />);
    expect(container).toHaveTextContent('Kioto, Nara y Osaka');
    expect(container).toHaveTextContent('JAPÓN');
    expect(container.textContent).not.toMatch(/°\s*[NS]/);
  });

  it('ruta: los lugares numerados en orden', () => {
    const { container } = render(<ShareCard template="route" {...props} />);
    expect(container).toHaveTextContent('N.º1');
    expect(container).toHaveTextContent('Osaka');
  });

  it('pasaporte: los sellos', () => {
    const { getByRole } = render(<ShareCard template="passport" {...props} />);
    expect(getByRole('img', { name: 'Sello de Japón, 10.04.2024' })).toBeInTheDocument();
  });
});
