// En web no hay carrete: el visor web solo muestra miniaturas sincronizadas (HU-30).
// Metro elige este archivo en web para no cargar el módulo nativo de expo-media-library.
import type { PhotoAccess } from './expoPhotoSource';
import type { PhotoSource } from './scanLibrary';

export async function requestPhotoAccess(): Promise<PhotoAccess> {
  return 'denied';
}

export async function hasPhotoAccess(): Promise<PhotoAccess | null> {
  return null;
}

export async function pickMorePhotos(): Promise<void> {}

export const expoPhotoSource: PhotoSource = {
  async listPage() {
    return [];
  },
  async getLocation() {
    return null;
  },
};
