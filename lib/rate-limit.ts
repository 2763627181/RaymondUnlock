const MAX_KEYS = 5000;
const hits = new Map<string, number[]>();

/**
 * Límite de intentos en memoria (ventana deslizante). Es un freno básico contra
 * abuso de formularios que envían correo; en serverless cada instancia lleva
 * su propia cuenta, así que no sustituye a un límite compartido (Redis/WAF).
 * Devuelve true si el intento está permitido.
 */
export function allowAttempt(
  key: string,
  options: { limit: number; windowMs: number },
  now: number = Date.now(),
): boolean {
  const recent = (hits.get(key) ?? []).filter((time) => now - time < options.windowMs);
  if (recent.length >= options.limit) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);

  if (hits.size > MAX_KEYS) {
    const oldest = hits.keys().next().value;
    if (oldest !== undefined) hits.delete(oldest);
  }
  return true;
}

/** Solo para pruebas. */
export function resetRateLimits(): void {
  hits.clear();
}
