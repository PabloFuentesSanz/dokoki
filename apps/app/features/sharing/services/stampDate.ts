/** Fecha de sello: "dd.mm.aaaa". */
export function stampDate(ms: number | null): string {
  if (ms === null) return '';
  const d = new Date(ms);
  const pad = (n: number): string => String(n).padStart(2, '0');
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;
}
