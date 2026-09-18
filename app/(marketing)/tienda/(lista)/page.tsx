import type { Metadata } from "next";
import { CatalogView } from "@/components/catalog/catalog-view";
import { parseCatalogFilters } from "@/lib/catalog/search-params";
import { buildCatalogMetadata } from "@/lib/catalog/metadata";

export async function generateMetadata(props: PageProps<"/tienda">): Promise<Metadata> {
  const filters = parseCatalogFilters(await props.searchParams, null);
  return buildCatalogMetadata({
    title: filters.query
      ? `Resultados para “${filters.query}”`
      : "Tienda de celulares y electrónicos",
    description:
      "Celulares, tablets, audio, smartwatches y accesorios en Santo Domingo, Distrito Nacional. Nuevos, open box y usados.",
    basePath: "/tienda",
    filters,
  });
}

export default async function StorePage(props: PageProps<"/tienda">) {
  const filters = parseCatalogFilters(await props.searchParams, null);
  return <CatalogView category={null} filters={filters} />;
}
