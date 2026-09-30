import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Coordinate } from './Coordinate';

describe('Coordinate', () => {
  it('escribe lat y lng con coma decimal, hemisferio y dos espacios entre ejes', () => {
    const { container } = render(<Coordinate lat={34.9671} lng={135.7727} />);
    expect(container.textContent).toBe('34,97° N  135,77° E');
  });

  it('usa O para el oeste y S para el sur', () => {
    const { container } = render(<Coordinate lat={-33.45} lng={-70.66} />);
    expect(container.textContent).toBe('33,45° S  70,66° O');
  });
});
