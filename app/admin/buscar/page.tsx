import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminSearchForm } from "@/components/admin/admin-search-form";
import { PageHeader } from "@/components/admin/page-header";
import { ActiveBadge } from "@/components/admin/status-badge";
import { searchProducts } from "@/lib/admin/product-search";
import { requireAdmin } from "@/lib/auth/admin";
import { CONDITION_LABELS } from "@/lib/catalog/text";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = { title: "Buscar producto" };

export default async function AdminSearchPage(props: PageProps<"/admin/buscar">) {
  await requireAdmin("/admin/buscar");
  const { q } = await props.searchParams;
  const result = await searchProducts((Array.isArray(q) ? q[0] : q) ?? "");

  // Un código o un ID exacto va directo a la ficha del producto.
  if (result.exactProductId) redirect(`/admin/productos/${result.exactProductId}`);

  return (
    <>
      <PageHeader
        title="Buscar producto"
        description="Escribe el código del producto (el que llega en el mensaje de WhatsApp), su ID o parte del nombre."
      />
      <AdminSearchForm defaultValue={result.query} autoFocus className="mb-8 max-w-xl" />

      {result.query === "" ? null : result.hits.length === 0 ? (
        <p className="border-border text-muted-foreground rounded-xl border border-dashed p-8 text-center text-sm">
          No encontramos nada para “{result.query}”. Revisa el código o busca por nombre.
        </p>
      ) : (
        <ul className="space-y-4">
          {result.hits.map((hit) => (
            <li key={hit.id} className="border-border bg-surface rounded-xl border p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link
                    href={`/admin/productos/${hit.id}`}
                    className="text-brand-blue font-semibold hover:underline"
                  >
                    {hit.name}
                  </Link>
                  <p className="text-muted-foreground text-xs">
                    {[hit.categoryName, CONDITION_LABELS[hit.condition], `/producto/${hit.slug}`]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                <ActiveBadge active={hit.isActive} />
              </div>
              <ul className="divide-border mt-3 divide-y text-sm">
                {hit.variants.map((variant) => (
                  <li
                    key={variant.id}
                    className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-2"
                  >
                    <span className="min-w-0">
                      <span
                        className={
                          variant.matched
                            ? "bg-brand-red-600/10 rounded px-1.5 py-0.5 font-mono text-xs font-semibold"
                            : "font-mono text-xs"
                        }
                      >
                        {variant.code ?? "sin código"}
                      </span>{" "}
                      <span className="text-muted-foreground">{variant.label ?? ""}</span>
                    </span>
                    <span className="tabular-nums-price text-muted-foreground text-xs whitespace-nowrap">
                      {formatPrice(variant.priceRetail)} · {variant.stock} en stock
                    </span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
