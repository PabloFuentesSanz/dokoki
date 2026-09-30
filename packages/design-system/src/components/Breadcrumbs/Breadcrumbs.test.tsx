import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Breadcrumbs } from './Breadcrumbs';

describe('Breadcrumbs', () => {
  const items = ['Mundo', 'Asia', 'Japón', 'Kioto'];

  it('es una navegación con enlaces y el último nivel como página actual', () => {
    render(<Breadcrumbs items={items} />);
    expect(screen.getByRole('navigation', { name: 'Ubicación' })).toBeInTheDocument();
    expect(screen.getAllByRole('link')).toHaveLength(3);
    expect(screen.getByText('Kioto')).toHaveAttribute('aria-current', 'page');
  });

  it('avisa del nivel pulsado', () => {
    const onNavigate = vi.fn();
    render(<Breadcrumbs items={items} onNavigate={onNavigate} />);
    fireEvent.click(screen.getByRole('link', { name: 'Asia' }));
    expect(onNavigate).toHaveBeenCalledWith(1);
  });
});
