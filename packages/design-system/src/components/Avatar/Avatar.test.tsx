import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Avatar, initials } from './Avatar';

describe('Avatar', () => {
  it('muestra las iniciales y se anuncia con el nombre completo', () => {
    render(<Avatar name="Marta Gil" />);
    expect(screen.getByRole('img', { name: 'Marta Gil' })).toHaveTextContent('MG');
  });

  it('usa como mucho dos iniciales y aguanta nombres vacíos', () => {
    expect(initials('lucía de la  fuente')).toBe('LD');
    expect(initials('  ')).toBe('?');
  });

  it('respeta el tamaño pedido', () => {
    render(<Avatar name="Tú" size={40} />);
    expect(screen.getByRole('img')).toHaveStyle({ width: '40px', height: '40px' });
  });
});
