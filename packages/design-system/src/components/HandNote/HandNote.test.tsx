import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { fontFaces } from '../../tokens';
import { HandNote } from './HandNote';

describe('HandNote', () => {
  it('muestra la nota del usuario en letra manuscrita y su meta a máquina', () => {
    render(<HandNote meta="Kioto, 11.04.2024">Volver en otoño, sin falta</HandNote>);
    expect(screen.getByText('Volver en otoño, sin falta')).toHaveStyle({
      fontFamily: fontFaces.hand['500'],
    });
    expect(screen.getByText('Kioto, 11.04.2024')).toHaveStyle({
      fontFamily: fontFaces.mono['400'],
    });
  });

  it('sin meta solo muestra la nota', () => {
    const { container } = render(<HandNote>El mejor ramen</HandNote>);
    expect(container.textContent).toBe('El mejor ramen');
  });
});
