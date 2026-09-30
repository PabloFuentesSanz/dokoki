/** "34,97° N  135,77° E": coma decimal, dos decimales, dos espacios entre ejes. */
export function formatCoordinate(lat: number, lng: number): string {
  const axis = (value: number, positive: string, negative: string): string =>
    `${Math.abs(value).toFixed(2).replace('.', ',')}° ${value >= 0 ? positive : negative}`;
  return `${axis(lat, 'N', 'S')}  ${axis(lng, 'E', 'O')}`;
}

/** Divisas sin decimales en la práctica. */
const ZERO_DECIMALS = new Set(['JPY', 'KRW', 'CLP', 'ISK', 'VND']);

/** "1.234,50 EUR" / "4.200 JPY": formato español, código ISO detrás. */
export function formatMoney(amount: number, currency = 'EUR'): string {
  const digits = ZERO_DECIMALS.has(currency) ? 0 : 2;
  const number = new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
    useGrouping: 'always',
  }).format(amount);
  return `${number} ${currency}`;
}
