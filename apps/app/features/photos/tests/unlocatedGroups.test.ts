import { describe, expect, it } from 'vitest';
import { groupByDay, suggestionFor } from '../services/unlocatedGroups';

const H = 60 * 60 * 1000;
const day = (d: number, h = 12) => Date.UTC(2024, 3, d, h);

describe('groupByDay', () => {
  it('agrupa por día, del más reciente al más antiguo', () => {
    const groups = groupByDay(
      [
        { id: 'a', takenAt: day(10, 9) },
        { id: 'b', takenAt: day(10, 20) },
        { id: 'c', takenAt: day(12) },
      ],
      0,
    );
    expect(groups.map((g) => [g.key, g.ids])).toEqual([
      ['2024-04-12', ['c']],
      ['2024-04-10', ['a', 'b']],
    ]);
    expect(groups[1]?.middleAt).toBe(day(10, 9) + (day(10, 20) - day(10, 9)) / 2);
  });

  it('usa la zona horaria del móvil para decidir el día', () => {
    // 23:30 UTC del día 10 es ya día 11 en Madrid (UTC+2 en abril).
    const groups = groupByDay([{ id: 'a', takenAt: Date.UTC(2024, 3, 10, 23, 30) }], -120);
    expect(groups[0]?.key).toBe('2024-04-11');
  });
});

describe('suggestionFor', () => {
  const located = [
    { id: 'k', takenAt: day(10, 8), location: { lat: 35, lng: 135.7 } },
    { id: 'l', takenAt: day(20), location: { lat: 38.7, lng: -9.1 } },
  ];

  it('propone la ubicación de la foto con GPS más cercana en el tiempo', () => {
    const [group] = groupByDay([{ id: 'a', takenAt: day(10, 14) }], 0);
    if (!group) throw new Error('sin grupo');
    expect(suggestionFor(group, located)).toEqual({
      photoId: 'k',
      location: { lat: 35, lng: 135.7 },
      gapMs: 6 * H,
    });
  });

  it('sin foto con GPS a menos de 12 h no hay sugerencia', () => {
    const [group] = groupByDay([{ id: 'a', takenAt: day(15) }], 0);
    if (!group) throw new Error('sin grupo');
    expect(suggestionFor(group, located)).toBeNull();
  });
});
