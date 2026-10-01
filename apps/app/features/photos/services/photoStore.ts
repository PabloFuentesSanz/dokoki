/**
 * Índice local de fotos en expo-sqlite (offline-first). Solo vive en el dispositivo:
 * las coordenadas nunca se sincronizan.
 */
import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';
import type { PhotoStore, PhotoStoreMeta, StoredPhoto } from './photoRecords';

export * from './photoRecords';

interface PhotoRow {
  id: string;
  taken_at: number;
  lat: number;
  lng: number;
  country: string | null;
  region: string | null;
  city: string | null;
  manual: number;
}

const EMPTY_META: PhotoStoreMeta = {
  newestTakenAt: null,
  scannedCount: 0,
  placesVersion: null,
};

async function insertPhotos(
  database: SQLiteDatabase,
  photos: readonly StoredPhoto[],
): Promise<void> {
  await database.withExclusiveTransactionAsync(async (txn) => {
    const insert = await txn.prepareAsync(
      'INSERT OR REPLACE INTO photos (id, taken_at, lat, lng, country, region, city, manual) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    );
    const unqueue = await txn.prepareAsync('DELETE FROM unlocated WHERE id = ?');
    try {
      for (const p of photos) {
        await insert.executeAsync([
          p.id,
          p.takenAt,
          p.location.lat,
          p.location.lng,
          p.countryCode,
          p.regionId,
          p.cityId,
          p.manual ? 1 : 0,
        ]);
        if (p.manual) await unqueue.executeAsync([p.id]);
      }
    } finally {
      await insert.finalizeAsync();
      await unqueue.finalizeAsync();
    }
  });
}

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
      CREATE TABLE IF NOT EXISTS unlocated (id TEXT PRIMARY KEY NOT NULL, taken_at INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL);
    `);
    // Migración: columna "manual" (ubicación puesta a mano) en bases de datos anteriores.
    const columns = await database.getAllAsync<{ name: string }>('PRAGMA table_info(photos)');
    if (!columns.some((c) => c.name === 'manual')) {
      await database.execAsync('ALTER TABLE photos ADD COLUMN manual INTEGER NOT NULL DEFAULT 0');
    }
    return database;
  });
  return dbPromise;
}

export const sqlitePhotoStore: PhotoStore = {
  async load() {
    const database = await db();
    const rows = await database.getAllAsync<PhotoRow>('SELECT * FROM photos ORDER BY taken_at');
    const unlocated = await database.getAllAsync<{ id: string; taken_at: number }>(
      'SELECT id, taken_at FROM unlocated ORDER BY taken_at',
    );
    const metaRow = await database.getFirstAsync<{ value: string }>(
      "SELECT value FROM meta WHERE key = 'scan'",
    );
    const meta: PhotoStoreMeta = metaRow
      ? { ...EMPTY_META, ...(JSON.parse(metaRow.value) as Partial<PhotoStoreMeta>) }
      : EMPTY_META;
    return {
      meta,
      unlocated: unlocated.map((u) => ({ id: u.id, takenAt: u.taken_at })),
      photos: rows.map((r) => ({
        id: r.id,
        takenAt: r.taken_at,
        location: { lat: r.lat, lng: r.lng },
        countryCode: r.country,
        regionId: r.region,
        cityId: r.city,
        manual: r.manual === 1,
      })),
    };
  },
  async save(photos) {
    if (photos.length === 0) return;
    await insertPhotos(await db(), photos);
  },
  async saveUnlocated(photos) {
    if (photos.length === 0) return;
    const database = await db();
    await database.withExclusiveTransactionAsync(async (txn) => {
      const statement = await txn.prepareAsync(
        'INSERT OR REPLACE INTO unlocated (id, taken_at) SELECT ?, ? WHERE NOT EXISTS (SELECT 1 FROM photos WHERE id = ? AND manual = 1)',
      );
      try {
        for (const p of photos) await statement.executeAsync([p.id, p.takenAt, p.id]);
      } finally {
        await statement.finalizeAsync();
      }
    });
  },
  async assignManual(photos) {
    if (photos.length === 0) return;
    await insertPhotos(
      await db(),
      photos.map((p) => ({ ...p, manual: true })),
    );
  },
  async saveMeta(meta) {
    const database = await db();
    await database.runAsync("INSERT OR REPLACE INTO meta (key, value) VALUES ('scan', ?)", [
      JSON.stringify(meta),
    ]);
  },
  async clear() {
    const database = await db();
    await database.execAsync(
      'DELETE FROM photos WHERE manual = 0; DELETE FROM unlocated; DELETE FROM meta;',
    );
  },
};
