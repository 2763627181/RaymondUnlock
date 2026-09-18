export const CURRENCY_CODE = "DOP";

const wholeFormatter = new Intl.NumberFormat("es-DO", {
  style: "currency",
  currency: CURRENCY_CODE,
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const preciseFormatter = new Intl.NumberFormat("es-DO", {
  style: "currency",
  currency: CURRENCY_CODE,
});

/** Para la interfaz: sin decimales cuando el monto es entero. */
export function formatPrice(amount: number): string {
  return Number.isInteger(amount) ? wholeFormatter.format(amount) : preciseFormatter.format(amount);
}

/** Para documentos (WhatsApp, correo): siempre con dos decimales. */
export function formatMoney(amount: number): string {
  return preciseFormatter.format(amount);
}

export function discountPercent(compareAt: number | null, price: number): number | null {
  if (compareAt === null || compareAt <= price) return null;
  return Math.round(((compareAt - price) / compareAt) * 100);
}
