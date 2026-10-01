/**
 * Exportar y compartir una tarjeta (M8.5). La imagen es un PNG nuevo dibujado a partir de la
 * vista: no lleva metadatos de ubicación (HU-27).
 */
import { Asset, requestPermissionsAsync } from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import type { RefObject } from 'react';
import type { View } from 'react-native';
import { captureRef } from 'react-native-view-shot';

export async function captureCard(
  ref: RefObject<View | null>,
  width: number,
  height: number,
): Promise<string> {
  return captureRef(ref, { format: 'png', quality: 1, width, height, result: 'tmpfile' });
}

/** Hoja de compartir del sistema: historias de Instagram, WhatsApp, Mensajes… */
export async function shareImage(uri: string): Promise<void> {
  await Sharing.shareAsync(uri, {
    mimeType: 'image/png',
    dialogTitle: 'Compartir tarjeta',
    UTI: 'public.png',
  });
}

/** Guarda la tarjeta en el carrete (pide permiso solo de escritura). */
export async function saveImage(uri: string): Promise<boolean> {
  const permission = await requestPermissionsAsync(true);
  if (!permission.granted) return false;
  await Asset.create(uri);
  return true;
}

export const canShareImages = true;
