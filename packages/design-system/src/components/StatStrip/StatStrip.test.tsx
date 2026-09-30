import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StatStrip } from './StatStrip';

describe('StatStrip', () => {
  it('cada cifra se lee con su etiqueta', () => {
    render(
      <StatStrip
        stats={[
          { value: '38 %', label: 'regiones' },
          { value: '11', label: 'ciudades' },
          { value: '640', label: 'fotos' },
        ]}
      />,
    );
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    expect(screen.getByRole('listitem', { name: '38 % regiones' })).toBeInTheDocument();
  });

  it('muestra como mucho 4 cifras', () => {
    const stats = ['a', 'b', 'c', 'd', 'e'].map((label, i) => ({ value: String(i), label }));
    render(<StatStrip stats={stats} />);
    expect(screen.getAllByRole('listitem')).toHaveLength(4);
  });
});
