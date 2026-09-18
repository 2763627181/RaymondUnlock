import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CatalogView } from "@/components/catalog/catalog-view";
import { getCategoryBySlug } from "@/lib/data";
import { buildCatalogMetadata } from "@/lib/catalog/metadata";
import { parseCatalogFilters } from "@/lib/catalog/search-params";

export async function generateMetadata(props: PageProps<"/tienda/[category]">): Promise<Metadata> {
  const { category: slug } = await props.params;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};

  const filters = parseCatalogFilters(await props.searchParams, slug);
  return buildCatalogMetadata({
    title: `${category.name} en Santo Domingo`,
    description: `${category.description ?? `Compra ${category.name.toLowerCase()}`} Raymond Unlock, Santo Domingo, Distrito Nacional.`,
    basePath: `/tienda/${category.slug}`,
    filters,
  });
}

export default async function CategoryPage(props: PageProps<"/tienda/[category]">) {
  const { category: slug } = await props.params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const filters = parseCatalogFilters(await props.searchParams, slug);
  return <CatalogView category={category} filters={filters} />;
}
