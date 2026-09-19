import "server-only";
import { unstable_cache } from "next/cache";
import { createAnonClient } from "@/lib/supabase/anon";
import type { Banner } from "@/types/site";
import { buildCatalogIndex, cardFor, type CatalogIndex } from "./catalog-index";
import { listProducts } from "./catalog-list";
import { getCatalogSnapshot } from "./snapshot";

/** Etiqueta para invalidar los banners desde /admin/banners con `revalidateTag`. */
export const BANNERS_TAG = "banners";

const REVALIDATE_SECONDS = 300;

type BannerBase = Omit<Banner, "fromPrice">;

async function loadBanners(): Promise<BannerBase[]> {
  // El RLS ya oculta los banners inactivos a los visitantes.
  const { data, error } = await createAnonClient().from("banners").select("*").order("sort_order");
  if (error) throw new Error(`No se pudo leer banners: ${error.message}`);

  return data.map((row) => ({
    id: row.id,
    title: row.title,
    subtitle: row.subtitle,
    imageUrl: row.image_url,
    ctaLabel: row.cta_label,
    ctaHref: row.cta_href,
    theme: row.theme === "light" ? "light" : "dark",
    sortOrder: row.sort_order,
  }));
}

const getBannerBases = unstable_cache(loadBanners, ["banners"], {
  tags: [BANNERS_TAG],
  revalidate: REVALIDATE_SECONDS,
});

/** Precio "desde" del producto o de la categoría a la que apunta el enlace del banner. */
function fromPriceFor(index: CatalogIndex, href: string | null): number | null {
  if (!href) return null;

  const productSlug = /^\/producto\/([a-z0-9-]+)$/.exec(href)?.[1];
  if (productSlug) {
    const product = index.productBySlug.get(productSlug);
    return product ? cardFor(index, product).minPrice : null;
  }

  const categorySlug = /^\/tienda\/([a-z0-9-]+)$/.exec(href)?.[1];
  if (categorySlug) {
    const page = listProducts(index, {
      categorySlug,
      brandSlugs: [],
      conditions: [],
      priceMin: null,
      priceMax: null,
      capacities: [],
      onlyInStock: false,
      query: null,
      sort: "precio-asc",
      limit: 1,
    });
    return page.items[0]?.minPrice ?? null;
  }

  return null;
}

export async function getBanners(): Promise<Banner[]> {
  const [banners, snapshot] = await Promise.all([getBannerBases(), getCatalogSnapshot()]);
  const index = buildCatalogIndex(snapshot);
  return banners.map((banner) => ({ ...banner, fromPrice: fromPriceFor(index, banner.ctaHref) }));
}
