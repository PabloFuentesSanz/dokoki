import { describe, expect, it, vi } from 'vitest';
import { scanLibrary, type PhotoSource, type ScanProgress } from '../services/scanLibrary';

/** Carrete falso: `total` fotos; las pares tienen GPS. */
function fakeSource(total: number): PhotoSource & { listPage: ReturnType<typeof vi.fn> } {
  const listPage = vi.fn(async (offset: number, limit: number) =>
    Array.from({ length: Math.max(0, Math.min(limit, total - offset)) }, (_, i) => ({
      id: `p${offset + i}`,
      creationTime: 1_700_000_000_000 + offset + i,
    })),
  );
  return {
    listPage,
    getLocation: async (id: string) => {
      const n = Number(id.slice(1));
      if (n === 7) throw new Error('iCloud');
      return n % 2 === 0 ? { latitude: 35 + n / 1000, longitude: 135 } : null;
    },
  };
}

describe('scanLibrary', () => {
  it('recorre el carrete por páginas y devuelve solo las fotos con GPS', async () => {
    const source = fakeSource(1203);
    const result = await scanLibrary(source, { pageSize: 500, concurrency: 8 });

    expect(source.listPage).toHaveBeenCalledTimes(3);
    expect(result.scanned).toBe(1203);
    expect(result.located).toHaveLength(602);
    expect(result.located[0]).toEqual({
      id: 'p0',
      takenAt: 1_700_000_000_000,
      location: { lat: 35, lng: 135 },
    });
  });

  it('una foto cuya ubicación falla cuenta como sin GPS y no para la lectura', async () => {
    const result = await scanLibrary(fakeSource(10), { pageSize: 4 });
    expect(result.scanned).toBe(10);
    expect(result.located.map((p) => p.id)).toEqual(['p0', 'p2', 'p4', 'p6', 'p8']);
  });

  it('avisa del progreso tras cada página, con tiempos', async () => {
    const progress: ScanProgress[] = [];
    await scanLibrary(fakeSource(5), { pageSize: 2, onProgress: (p) => progress.push({ ...p }) });
    expect(progress.map((p) => [p.scanned, p.located])).toEqual([
      [2, 1],
      [4, 2],
      [5, 3],
    ]);
    expect(progress.every((p) => p.elapsedMs >= 0)).toBe(true);
  });

  it('se puede cancelar entre páginas', async () => {
    const controller = new AbortController();
    const result = await scanLibrary(fakeSource(100), {
      pageSize: 10,
      signal: controller.signal,
      onProgress: (p) => {
        if (p.scanned >= 20) controller.abort();
      },
    });
    expect(result.scanned).toBe(20);
    expect(result.cancelled).toBe(true);
  });

  it('un carrete vacío termina sin fotos', async () => {
    const result = await scanLibrary(fakeSource(0));
    expect(result).toMatchObject({ scanned: 0, located: [], cancelled: false });
  });
});
