/** "Foto del 12 de abril de 2024": nombre accesible de una miniatura. */
export function photoLabel(takenAt: number): string {
  return `Foto del ${new Date(takenAt).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })}`;
}
