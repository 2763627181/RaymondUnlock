import Link from "next/link";
import { MessageCircle, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Category } from "@/types/catalog";

export function EmptyState({
  categories,
  whatsappNumber,
  query,
  hasFilters,
  clearHref,
}: {
  categories: Category[];
  whatsappNumber: string;
  query: string | null;
  hasFilters: boolean;
  clearHref: string;
}) {
  const message = query
    ? `Hola, busco "${query}" y no lo encontré en la tienda. ¿Lo tienen disponible?`
    : "Hola, no encontré lo que buscaba en la tienda. ¿Me pueden ayudar?";
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

  return (
    <div className="border-border flex flex-col items-center rounded-lg border border-dashed px-6 py-16 text-center">
      <SearchX className="text-muted-foreground mb-4 size-10" aria-hidden="true" />
      <h2 className="text-xl font-semibold">No encontramos productos con esos criterios</h2>
      <p className="text-muted-foreground mt-2 max-w-md text-[15px] leading-relaxed">
        Prueba con otra palabra, quita algún filtro o mira las categorías.
      </p>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {hasFilters ? (
          <Button asChild variant="outline">
            <Link href={clearHref}>Quitar filtros</Link>
          </Button>
        ) : null}
        {categories.slice(0, 5).map((category) => (
          <Button key={category.id} asChild variant="secondary">
            <Link href={`/tienda/${category.slug}`}>{category.name}</Link>
          </Button>
        ))}
      </div>

      <div className="border-border mt-8 w-full max-w-md border-t pt-6">
        <p className="text-sm font-medium">¿No encuentras lo que buscas? Escríbenos.</p>
        <Button asChild className="mt-3 h-11 px-6 text-base">
          <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
            <MessageCircle aria-hidden="true" /> Escribir por WhatsApp
          </a>
        </Button>
      </div>
    </div>
  );
}
