import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CountryChip } from './CountryChip';

describe('CountryChip', () => {
  it('muestra el código ISO en mayúsculas y el nombre', () => {
    render(<CountryChip code="jp" name="Japón" />);
    expect(screen.getByText('JP')).toBeInTheDocument();
    expect(screen.getByText('Japón')).toBeInTheDocument();
  });

  it('con onPress es un enlace con el nombre del país', () => {
    const onPress = vi.fn();
    render(<CountryChip code="PT" name="Portugal" onPress={onPress} />);
    fireEvent.click(screen.getByRole('link', { name: 'Portugal' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('pendiente de desbloquear lleva borde discontinuo', () => {
    const { container } = render(<CountryChip code="PE" name="Perú" pending />);
    expect(container.firstElementChild).toHaveStyle({ borderStyle: 'dashed' });
  });
});
