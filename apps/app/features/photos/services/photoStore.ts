/**
 * Índice local de fotos en expo-sqlite (offline-first). Solo vive en el dispositivo:
 * las coordenadas nunca se sincronizan.
 */
import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';
import type { PhotoStore, PhotoStoreMeta } from './photoRecords';

export * from './photoRecords';

interface PhotoRow {
  id: string;
  taken_at: number;
  lat: number;
  lng: number;
  country: string | null;
  region: string | null;
  city: string | null;
}

const EMPTY_META: PhotoStoreMeta = { newestTakenAt: null, scannedCount: 0, placesVersion: null };

let dbPromise: Promise<SQLiteDatabase> | null = null;

function db(): Promise<SQLiteDatabase> {
  dbPromise ??= openDatabaseAsync('atlas.db').then(async (database) => {
    await database.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS photos (
        id TEXT PRIMARY KEY NOT NULL,
        taken_at INTEGER NOT NULL,
        lat REAL NOT NULL,
        lng REAL NOT NULL,
        country TEXT,
        region TEXT,
        city TEXT
      );
      CREATE INDEX IF NOT EXISTS photos_country ON photos (country);
      CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL);
    `);
    return database;
  });
  return dbPromise;
}

export const sqlitePhotoStore: PhotoStore = {
  async load() {
    const database = await db();
    const rows = await database.getAllAsync<PhotoRow>('SELECT * FROM photos ORDER BY taken_at');
    const metaRow = await database.getFirstAsync<{ value: string }>(
      "SELECT value FROM meta WHERE key = 'scan'",
    );
    const meta: PhotoStoreMeta = metaRow
      ? { ...EMPTY_META, ...(JSON.parse(metaRow.value) as Partial<PhotoStoreMeta>) }
      : EMPTY_META;
    return {
      meta,
      photos: rows.map((r) => ({
        id: r.id,
        takenAt: r.taken_at,
        location: { lat: r.lat, lng: r.lng },
        countryCode: r.country,
        regionId: r.region,
        cityId: r.city,
      })),
    };
  },
  async save(photos) {
    if (photos.length === 0) return;
    const database = await db();
    await database.withExclusiveTransactionAsync(async (txn) => {
      const statement = await txn.prepareAsync(
        'INSERT OR REPLACE INTO photos (id, taken_at, lat, lng, country, region, city) VALUES (?, ?, ?, ?, ?, ?, ?)',
      );
      try {
        for (const p of photos) {
          await statement.executeAsync([
            p.id,
            p.takenAt,
            p.location.lat,
            p.location.lng,
            p.countryCode,
            p.regionId,
            p.cityId,
          ]);
        }
      } finally {
        await statement.finalizeAsync();
      }
    });
  },
  async saveMeta(meta) {
    const database = await db();
    await database.runAsync("INSERT OR REPLACE INTO meta (key, value) VALUES ('scan', ?)", [
      JSON.stringify(meta),
    ]);
  },
  async clear() {
    const database = await db();
    await database.execAsync('DELETE FROM photos; DELETE FROM meta;');
  },
};
