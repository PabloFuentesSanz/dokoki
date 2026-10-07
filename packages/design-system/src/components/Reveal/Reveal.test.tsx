import { act, render, screen } from '@testing-library/react';
import { Text } from 'react-native';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Reveal } from './Reveal';

describe('Reveal', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('pinta su contenido desde el primer render (accesible aunque esté apareciendo)', () => {
    render(
      <Reveal>
        <Text>Japón</Text>
      </Reveal>,
    );
    expect(screen.getByText('Japón')).toBeInTheDocument();
  });

  it('termina visible y en su sitio', async () => {
    vi.useFakeTimers();
    const { container } = render(
      <Reveal delay={60}>
        <Text>Kioto</Text>
      </Reveal>,
    );
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });
    expect(container.firstElementChild).toHaveStyle({ opacity: '1' });
  });
});
