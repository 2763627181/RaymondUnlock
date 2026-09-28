"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { applyTheme, readTheme, subscribeTheme } from "@/lib/theme";

const getServerSnapshot = () => "light" as const;

/**
 * Botón claro/oscuro. En el servidor no hay tema (el snapshot es "light", igual
 * que ve el HTML inicial); al montar lee lo que ya puso el script de
 * app/layout.tsx en <html>, sin useEffect+setState (dispara cascading renders).
 */
export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribeTheme, readTheme, getServerSnapshot);
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={() => applyTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      className="hover:bg-muted flex size-9 items-center justify-center rounded-md transition-colors"
    >
      {isDark ? (
        <Sun className="text-ink-700 size-5" aria-hidden="true" />
      ) : (
        <Moon className="text-ink-700 size-5" aria-hidden="true" />
      )}
    </button>
  );
}
