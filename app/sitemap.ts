import type { MetadataRoute } from "next";
import { getAllProductSlugs, getCategories, getServices } from "@/lib/data";
import { absoluteUrl } from "@/lib/seo";

const STATIC_ROUTES = [
  "/",
  "/tienda",
  "/servicios",
  "/mayorista",
  "/proveedores",
  "/nosotros",
  "/contacto",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, services, productSlugs] = await Promise.all([
    getCategories(),
    getServices(),
    getAllProductSlugs(),
  ]);

  return [
    ...STATIC_ROUTES.map((path) => ({ url: absoluteUrl(path) })),
    ...categories.map((category) => ({ url: absoluteUrl(`/tienda/${category.slug}`) })),
    ...productSlugs.map((slug) => ({ url: absoluteUrl(`/producto/${slug}`) })),
    ...services.map((service) => ({ url: absoluteUrl(`/servicios/${service.slug}`) })),
  ];
}
