// En web las tarjetas se crean y comparten desde el móvil por ahora (W.4 llegará con el visor).
import type { RefObject } from 'react';
import type { View } from 'react-native';

export async function captureCard(
  _ref: RefObject<View | null>,
  _width: number,
  _height: number,
): Promise<string> {
  throw new Error('Crea la tarjeta desde el móvil.');
}

export async function shareImage(_uri: string): Promise<void> {}

export async function saveImage(_uri: string): Promise<boolean> {
  return false;
}

export const canShareImages = false;
