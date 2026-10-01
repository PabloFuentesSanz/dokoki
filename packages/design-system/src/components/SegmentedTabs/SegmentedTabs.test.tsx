import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SegmentedTabs } from './SegmentedTabs';

const OPTIONS = [
  { value: 'place', label: 'Por lugar' },
  { value: 'time', label: 'Por tiempo' },
] as const;

describe('SegmentedTabs', () => {
  it('es una lista de pestañas con nombre y marca la elegida', () => {
    render(<SegmentedTabs label="Ver fotos" options={OPTIONS} value="time" />);
    expect(screen.getByRole('tablist', { name: 'Ver fotos' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Por tiempo' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByRole('tab', { name: 'Por lugar' })).toHaveAttribute(
      'aria-selected',
      'false',
    );
  });

  it('avisa del valor al tocar una pestaña', () => {
    const onChange = vi.fn();
    render(<SegmentedTabs label="Ver" options={OPTIONS} value="place" onChange={onChange} />);
    fireEvent.click(screen.getByRole('tab', { name: 'Por tiempo' }));
    expect(onChange).toHaveBeenCalledWith('time');
  });
});
