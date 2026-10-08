export type DistanceUnit = 'km' | 'mi';

const KM_PER_MILE = 1.609344;

export function parseUnit(value: unknown): DistanceUnit {
  return value === 'mi' ? 'mi' : 'km';
}

/** Distancia redondeada en la unidad elegida, con su etiqueta: { value: '1.240', label: 'km' }. */
export function formatDistance(km: number, unit: DistanceUnit): { value: string; label: string } {
  const n = Math.round(unit === 'mi' ? km / KM_PER_MILE : km);
  return { value: n.toLocaleString('es-ES'), label: unit === 'mi' ? 'millas' : 'km' };
}
