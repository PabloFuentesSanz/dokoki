/** Ajustes guardados en el móvil (expo-sqlite, misma base de datos que las fotos). */
import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';

let dbPromise: Promise<SQLiteDatabase> | null = null;

function db(): Promise<SQLiteDatabase> {
  dbPromise ??= openDatabaseAsync('atlas.db').then(async (database) => {
    await database.execAsync(
      'CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL);',
    );
    return database;
  });
  return dbPromise;
}

export async function readSetting(key: string): Promise<unknown> {
  const row = await (
    await db()
  ).getFirstAsync<{ value: string }>('SELECT value FROM settings WHERE key = ?', [key]);
  return row ? JSON.parse(row.value) : null;
}

export async function writeSetting(key: string, value: unknown): Promise<void> {
  await (
    await db()
  ).runAsync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [
    key,
    JSON.stringify(value),
  ]);
}
