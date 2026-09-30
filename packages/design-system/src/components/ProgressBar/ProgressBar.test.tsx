import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ProgressBar } from './ProgressBar';

describe('ProgressBar', () => {
  it('expone el valor a tecnologías de apoyo y lo escribe', () => {
    render(<ProgressBar label="Japón" value={38} detail="18 de 47 regiones" />);
    const bar = screen.getByRole('progressbar', { name: 'Japón' });
    expect(bar).toHaveAttribute('aria-valuenow', '38');
    expect(screen.getByText('38 %')).toBeInTheDocument();
    expect(screen.getByText('18 de 47 regiones')).toBeInTheDocument();
  });

  it('limita el valor entre 0 y 100 y lo redondea', () => {
    const { rerender } = render(<ProgressBar label="Mundo" value={140} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
    rerender(<ProgressBar label="Mundo" value={-3} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
    rerender(<ProgressBar label="Mundo" value={7.6} />);
    expect(screen.getByText('8 %')).toBeInTheDocument();
  });
});
