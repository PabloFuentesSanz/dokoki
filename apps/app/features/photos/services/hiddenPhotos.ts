/** Fotos ocultas de Atlas (M3.7): siguen en el carrete, pero no cuentan en mapa, viajes ni tarjetas. */

/** Lee la lista guardada; ignora lo que no sean ids. */
export function parseHidden(value: unknown): Set<string> {
  return new Set(
    Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [],
  );
}

/** Quita las fotos ocultas de una lista. Sin ocultas devuelve la misma lista (no recalcula nada). */
export function withoutHidden<T>(
  items: readonly T[],
  hidden: ReadonlySet<string>,
  idOf: (item: T) => string,
): readonly T[] {
  return hidden.size === 0 ? items : items.filter((item) => !hidden.has(idOf(item)));
}
