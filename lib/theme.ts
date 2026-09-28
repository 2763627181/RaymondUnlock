export type Theme = "light" | "dark";

// Debe coincidir con la clave que usa el script embebido en app/layout.tsx
// (ese script no puede importar este módulo: corre antes de que cargue nada).
export const THEME_STORAGE_KEY = "ru-theme";

const listeners = new Set<() => void>();

/** El script embebido en <head> ya puso data-theme en <html> antes de pintar. */
export function readTheme(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

export function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Modo privado o almacenamiento bloqueado: el tema no persiste, pero no rompe nada.
  }
  for (const listener of listeners) listener();
}

/** Para useSyncExternalStore: avisa a cada <ThemeToggle> cuando otro cambia el tema. */
export function subscribeTheme(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Texto del script que fija data-theme ANTES del primer pintado, para que la
 * página nunca parpadee en claro y luego salte a oscuro. Debe ser una función
 * autocontenida (sin imports): se inyecta tal cual en el <head>.
 */
export function themeBootstrapScript(): string {
  return `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.dataset.theme=t}catch(e){}})();`;
}
