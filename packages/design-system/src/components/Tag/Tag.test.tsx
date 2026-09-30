import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Tag } from './Tag';

describe('Tag', () => {
  it('siempre muestra la palabra, no solo el color', () => {
    render(<Tag tone="visited">Visitado</Tag>);
    expect(screen.getByText('Visitado')).toBeInTheDocument();
  });

  it('el borde informa: discontinuo = planificado, punteado = por descubrir', () => {
    const { container, rerender } = render(<Tag tone="planned">Próximo</Tag>);
    expect(container.firstElementChild).toHaveStyle({ borderStyle: 'dashed' });
    rerender(<Tag tone="unexplored">Por descubrir</Tag>);
    expect(container.firstElementChild).toHaveStyle({ borderStyle: 'dotted' });
  });

  it('los estados llevan icono de refuerzo y el neutro no', () => {
    const { container, rerender } = render(<Tag tone="settled">Saldado</Tag>);
    expect(container.querySelector('svg')).not.toBeNull();
    rerender(<Tag>Kioto</Tag>);
    expect(container.querySelector('svg')).toBeNull();
  });
});
