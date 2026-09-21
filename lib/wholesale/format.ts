const MONTHS = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

// Solo números de Intl: el texto de fechas cambia entre versiones de ICU (Node y el
// navegador no coinciden) y eso rompía la hidratación del encabezado.
const parts = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/Santo_Domingo",
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  hourCycle: "h23",
});

/** "19 de septiembre de 2026, 9:50 a. m." en hora de Santo Domingo. */
export function formatListingDate(iso: string): string {
  const value = new Map(parts.formatToParts(new Date(iso)).map((part) => [part.type, part.value]));
  const hour = Number(value.get("hour")) % 24;
  const minute = (value.get("minute") ?? "0").padStart(2, "0");
  const month = MONTHS[Number(value.get("month")) - 1] ?? "";
  const period = hour < 12 ? "a. m." : "p. m.";
  return `${value.get("day")} de ${month} de ${value.get("year")}, ${hour % 12 || 12}:${minute} ${period}`;
}

/** 1234 → "1,234", igual en el servidor y en el navegador. */
export function formatCount(count: number): string {
  return String(count).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/** "18097123062" → "+1 (809) 712-3062"; otros formatos, "+" y los dígitos. */
export function formatWhatsappNumber(digits: string): string {
  const match = /^1(\d{3})(\d{3})(\d{4})$/.exec(digits);
  return match ? `+1 (${match[1]}) ${match[2]}-${match[3]}` : `+${digits}`;
}
