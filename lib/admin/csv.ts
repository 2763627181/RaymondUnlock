type Cell = string | number | boolean | null | undefined;

/**
 * Una hoja de cálculo ejecuta como fórmula una celda de texto que empieza por
 * = + - @ (o tabulador / retorno). Como el CSV incluye texto escrito por
 * clientes, se antepone una comilla para que se lea siempre como texto.
 */
function guardFormula(value: string): string {
  return /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
}

function escapeCell(cell: Cell): string {
  if (cell === null || cell === undefined) return "";
  const text = typeof cell === "string" ? guardFormula(cell) : String(cell);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** CSV con BOM UTF-8 (Excel lo necesita para leer bien los acentos) y saltos CRLF. */
export function toCsv(headers: string[], rows: Cell[][]): string {
  const lines = [headers, ...rows].map((row) => row.map(escapeCell).join(","));
  return `\uFEFF${lines.join("\r\n")}\r\n`;
}
