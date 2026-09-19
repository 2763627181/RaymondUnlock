"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";

export interface FilterSelect {
  name: string;
  label: string;
  options: { value: string; label: string }[];
}

const SEARCH_DEBOUNCE_MS = 350;

/**
 * Búsqueda y filtros de un listado. El estado vive en la URL (compartible y con
 * botón "atrás"); el servidor lee esos parámetros y pagina. Al cambiar un filtro
 * se vuelve a la página 1.
 */
export function ListFilters({
  searchPlaceholder,
  selects = [],
}: {
  searchPlaceholder: string;
  selects?: FilterSelect[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const urlQuery = params.get("q") ?? "";
  const [query, setQuery] = useState(urlQuery);

  function update(changes: Record<string, string>) {
    const next = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    next.delete("page");
    const search = next.toString();
    startTransition(() => router.replace(search ? `${pathname}?${search}` : pathname));
  }

  useEffect(() => {
    if (query === urlQuery) return;
    const timer = setTimeout(() => update({ q: query.trim() }), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
    // `update` cambia con la URL; solo debe reaccionar a lo que escribe la persona.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return (
    <div
      className="mb-4 flex flex-wrap items-end gap-3"
      role="search"
      aria-busy={pending}
      data-pending={pending || undefined}
    >
      <div className="relative min-w-56 flex-1">
        <Search
          className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
          aria-hidden="true"
        />
        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
          className="h-11 pl-9"
        />
      </div>
      {selects.map((select) => (
        <div key={select.name} className="w-full sm:w-auto sm:min-w-44">
          <NativeSelect
            aria-label={select.label}
            value={params.get(select.name) ?? ""}
            onChange={(event) => update({ [select.name]: event.target.value })}
          >
            <option value="">{select.label}</option>
            {select.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </NativeSelect>
        </div>
      ))}
    </div>
  );
}
