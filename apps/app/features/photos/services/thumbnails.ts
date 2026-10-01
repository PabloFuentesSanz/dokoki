import { Platform } from 'react-native';

/**
 * URI de miniatura de una foto del carrete, sin copiarla: en iOS el id es el identificador de
 * PhotoKit (`ph://`), en Android el id de MediaStore. Solo se usa dentro del móvil.
 */
export function thumbnailUri(id: string): string {
  return Platform.OS === 'ios' ? `ph://${id}` : `content://media/external/images/media/${id}`;
}
