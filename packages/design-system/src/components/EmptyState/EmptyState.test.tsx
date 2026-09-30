import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  it('dice qué falta y qué hacer, con la acción', () => {
    const onAction = vi.fn();
    render(
      <EmptyState
        title="Aún no hay fotos de Perú"
        body="Cuando viajes, aparecerán aquí solas."
        action="Marcar a mano"
        onAction={onAction}
      />,
    );
    expect(screen.getByRole('heading', { name: 'Aún no hay fotos de Perú' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Marcar a mano' }));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('sin acción no pinta botón', () => {
    render(
      <EmptyState title="Aún sin viajes" body="Los viajes se detectan solos con tus fotos." />,
    );
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
