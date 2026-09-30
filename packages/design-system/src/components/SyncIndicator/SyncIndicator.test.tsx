import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SyncIndicator } from './SyncIndicator';

describe('SyncIndicator', () => {
  it('anuncia el estado de guardado de forma educada', () => {
    render(<SyncIndicator />);
    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('Todo guardado');
    expect(status).toHaveAttribute('aria-live', 'polite');
  });

  it('sin conexión explica que está guardado en el móvil', () => {
    render(<SyncIndicator state="offline" />);
    expect(screen.getByRole('status')).toHaveTextContent('Sin conexión, guardado en el móvil');
  });

  it('admite otro texto', () => {
    render(<SyncIndicator state="pending" label="Subiendo 12 miniaturas" />);
    expect(screen.getByRole('status')).toHaveTextContent('Subiendo 12 miniaturas');
  });
});
