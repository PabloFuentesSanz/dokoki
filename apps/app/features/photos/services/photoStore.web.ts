// En web no hay carrete ni SQLite nativo: almacén vacío en memoria.
import type { PhotoStore, PhotoStoreMeta } from './photoRecords';

export * from './photoRecords';

const EMPTY: PhotoStoreMeta = { newestTakenAt: null, scannedCount: 0, placesVersion: null };

export const sqlitePhotoStore: PhotoStore = {
  async load() {
    return { photos: [], unlocated: [], meta: EMPTY };
  },
  async save() {},
  async saveUnlocated() {},
  async assignManual() {},
  async saveMeta() {},
  async clear() {},
};
