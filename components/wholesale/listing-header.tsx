import { formatListingDate } from "@/lib/wholesale/format";

/** Barra oscura de arriba: marca, título y cuándo se actualizó la lista. */
export function ListingHeader({
  businessName,
  updatedAt,
}: {
  businessName: string;
  updatedAt: string | null;
}) {
  const date = updatedAt ? formatListingDate(updatedAt) : null;

  return (
    <header className="bg-ink text-white">
      <div className="flex items-center gap-3 px-4 py-4">
        <span
          aria-hidden="true"
          className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-black text-lg font-bold ring-1 ring-white/15"
        >
          R<span className="text-brand-red">U</span>
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg leading-tight font-semibold">Listado al por mayor</h1>
          <p className="mt-0.5 flex items-center gap-1.5 text-white/65">
            <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-emerald-400" />
            {/* En el teléfono no cabe el nombre y la fecha: se deja la fecha, que es lo que cambia. */}
            <span className="truncate text-sm max-sm:hidden">{businessName}</span>
            <span className="truncate text-xs sm:hidden">{date ?? businessName}</span>
          </p>
        </div>
        {date ? (
          <p className="hidden shrink-0 rounded-lg bg-white/5 px-3 py-2 text-xs text-white/75 ring-1 ring-white/10 sm:block">
            {date}
          </p>
        ) : null}
      </div>
    </header>
  );
}
