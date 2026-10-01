/** Formatos de tarjeta (HU-25): historia 9:16 y post 4:5, exportados a 1080 px de ancho. */
export type CardFormat = 'story' | 'post';
export type CardTemplate = 'postal' | 'route' | 'passport';

export const CARD_FORMATS: Record<CardFormat, { label: string; width: number; height: number }> = {
  story: { label: 'Historia 9:16', width: 1080, height: 1920 },
  post: { label: 'Post 4:5', width: 1080, height: 1350 },
};

/** Tamaño de la vista previa para un ancho disponible, con la proporción del formato. */
export function previewSize(
  format: CardFormat,
  availableWidth: number,
): { width: number; height: number } {
  const { width, height } = CARD_FORMATS[format];
  const w = Math.min(availableWidth, 360);
  return { width: w, height: Math.round((w * height) / width) };
}
