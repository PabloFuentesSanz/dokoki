import { describe, expect, it } from 'vitest';
import { photoDays } from '../services/photoDays';

describe('photoDays', () => {
  it('cuenta días distintos, no fotos', () => {
    const at = (d: number, h: number) => new Date(2024, 3, d, h).getTime();
    expect(
      photoDays([{ takenAt: at(10, 9) }, { takenAt: at(10, 20) }, { takenAt: at(12, 8) }]),
    ).toBe(2);
    expect(photoDays([])).toBe(0);
  });
});
