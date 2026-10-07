import { describe, expect, it } from 'vitest';
import { parseHidden, withoutHidden } from '../services/hiddenPhotos';

describe('fotos ocultas', () => {
  it('lee solo ids de texto', () => {
    expect([...parseHidden(['a', 3, 'b', null])]).toEqual(['a', 'b']);
    expect(parseHidden(null).size).toBe(0);
  });

  it('quita las ocultas y no copia la lista si no hay ninguna', () => {
    const photos = [{ id: 'a' }, { id: 'b' }];
    expect(withoutHidden(photos, new Set(['a']), (p) => p.id)).toEqual([{ id: 'b' }]);
    expect(withoutHidden(photos, new Set(), (p) => p.id)).toBe(photos);
  });
});
