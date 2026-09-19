"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Search } from "lucide-react";

const SearchDialogPanel = dynamic(
  () =>
    import("@/components/layout/search-dialog-panel").then((module) => module.SearchDialogPanel),
  { ssr: false },
);

/** El diálogo se descarga la primera vez que se abre; el botón es lo único de la carga inicial. */
export function SearchDialog() {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label="Buscar productos"
        aria-haspopup="dialog"
        onClick={() => {
          setLoaded(true);
          setOpen(true);
        }}
        className="hover:bg-muted flex size-9 items-center justify-center rounded-md transition-colors"
      >
        <Search className="text-ink-700 size-5" aria-hidden="true" />
      </button>
      {loaded ? <SearchDialogPanel open={open} onOpenChange={setOpen} /> : null}
    </>
  );
}
