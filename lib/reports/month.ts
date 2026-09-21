/**
 * Meses del informe de ventas, siempre en hora de Santo Domingo (UTC−4 todo el
 * año, sin horario de verano): una venta cerrada el 30 a las 10 pm cuenta en
 * ese mes aunque en UTC ya sea el día 1 del siguiente.
 */
const TIME_ZONE = "America/Santo_Domingo";
const UTC_OFFSET_HOURS = -4;
const OFFSET_SUFFIX = "-04:00";
const MONTH_PATTERN = /^(\d{4})-(0[1-9]|1[0-2])$/;

const monthFormat = new Intl.DateTimeFormat("es-DO", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export function isMonth(value: string): boolean {
  const match = MONTH_PATTERN.exec(value);
  const year = Number(match?.[1]);
  return match !== null && year >= 2000 && year <= 2100;
}

/** El mes en curso ("2026-09"), visto desde Santo Domingo. */
export function currentMonth(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
  }).formatToParts(now);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  return `${year}-${month}`;
}

/** Un mes válido de la URL o, si falta o viene mal, el mes en curso. */
export function parseMonth(value: string | undefined, now: Date = new Date()): string {
  return value !== undefined && isMonth(value) ? value : currentMonth(now);
}

export function shiftMonth(month: string, delta: number): string {
  const [year = 0, monthNumber = 1] = month.split("-").map(Number);
  const index = year * 12 + (monthNumber - 1) + delta;
  return `${Math.floor(index / 12)}-${String((index % 12) + 1).padStart(2, "0")}`;
}

/** Intervalo [start, end) del mes, con la hora de Santo Domingo, listo para PostgREST. */
export function monthRange(month: string): { start: string; end: string } {
  return {
    start: `${month}-01T00:00:00${OFFSET_SUFFIX}`,
    end: `${shiftMonth(month, 1)}-01T00:00:00${OFFSET_SUFFIX}`,
  };
}

/** "Septiembre 2026". */
export function monthLabel(month: string): string {
  const [year = 0, monthNumber = 1] = month.split("-").map(Number);
  const parts = monthFormat.formatToParts(new Date(Date.UTC(year, monthNumber - 1, 1)));
  const name = parts.find((part) => part.type === "month")?.value ?? "";
  return `${name.charAt(0).toUpperCase()}${name.slice(1)} ${year}`;
}

/** "2026-09-21": la fecha de hoy en Santo Domingo, para nombrar archivos. */
export function dateStamp(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/**
 * Excel guarda las fechas sin zona horaria y muestra los campos UTC: se mueve el
 * instante para que se lea la hora de Santo Domingo y no la de Greenwich.
 */
export function toExcelWallClock(date: Date): Date {
  return new Date(date.getTime() + UTC_OFFSET_HOURS * 3_600_000);
}
