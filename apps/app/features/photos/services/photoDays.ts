/** Días distintos (en hora local) en que se hicieron unas fotos. */
export function photoDays(photos: readonly { takenAt: number }[]): number {
  return new Set(photos.map((p) => new Date(p.takenAt).toDateString())).size;
}
