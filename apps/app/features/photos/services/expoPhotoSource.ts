import {
  Asset,
  AssetField,
  getPermissionsAsync,
  MediaType,
  presentPermissionsPicker,
  Query,
  requestPermissionsAsync,
} from 'expo-media-library';
import type { PhotoSource } from './scanLibrary';

/** ¿Ya hay permiso? Sirve para la lectura incremental al abrir, sin mostrar ningún diálogo. */
export async function hasPhotoAccess(): Promise<PhotoAccess | null> {
  const response = await getPermissionsAsync(false, ['photo']);
  if (!response.granted) return null;
  return response.accessPrivileges === 'limited' ? 'limited' : 'all';
}

export type PhotoAccess = 'all' | 'limited' | 'denied';

/** Pide acceso al carrete (M0.4). En iOS la persona puede dar acceso solo a algunas fotos. */
export async function requestPhotoAccess(): Promise<PhotoAccess> {
  const response = await requestPermissionsAsync(false, ['photo']);
  if (!response.granted) return 'denied';
  return response.accessPrivileges === 'limited' ? 'limited' : 'all';
}

/** Con acceso limitado, abre el selector del sistema para elegir más fotos. */
export async function pickMorePhotos(): Promise<void> {
  await presentPermissionsPicker(['photo']);
}

/** Fuente real: expo-media-library (API nueva de SDK 57). */
export const expoPhotoSource: PhotoSource = {
  async listPage(offset, limit, since) {
    let query = new Query().eq(AssetField.MEDIA_TYPE, MediaType.IMAGE);
    if (since !== undefined) query = query.gt(AssetField.CREATION_TIME, since);
    const page = await query
      .orderBy({ key: AssetField.CREATION_TIME, ascending: false })
      .offset(offset)
      .limit(limit)
      .exeForMetadata();
    return page.map((asset) => ({ id: asset.id, creationTime: asset.creationTime }));
  },
  getLocation(id) {
    return new Asset(id).getLocation();
  },
};
