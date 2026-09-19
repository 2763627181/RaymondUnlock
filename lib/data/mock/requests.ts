import "server-only";

const sequences = new Map<string, number>();

/**
 * Códigos correlativos por prefijo y año (RU-2026-0001). En la Fase 2 se
 * reemplaza por una secuencia de Postgres, que es la única forma segura de
 * evitar códigos repetidos con solicitudes simultáneas.
 */
export async function nextRequestCode(prefix: string): Promise<string> {
  const year = new Date().getFullYear();
  const key = `${prefix}-${year}`;
  const next = (sequences.get(key) ?? 0) + 1;
  sequences.set(key, next);
  return `${key}-${String(next).padStart(4, "0")}`;
}
