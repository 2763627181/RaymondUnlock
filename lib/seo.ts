import { CURRENCY_CODE } from "@/lib/format";
import type { ProductCondition, ProductDetail } from "@/types/catalog";
import type { SiteSettings } from "@/types/site";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://raymondunlock.com").replace(
  /\/$/,
  "",
);

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function localBusinessJsonLd(settings: SiteSettings): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "ElectronicsStore",
    name: settings.businessName,
    description: settings.description,
    url: SITE_URL,
    telephone: `+${settings.whatsappNumber}`,
    email: settings.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: settings.addressParts.street,
      addressLocality: settings.addressParts.locality,
      postalCode: settings.addressParts.postalCode,
      addressCountry: settings.addressParts.country,
    },
    sameAs: [settings.instagramUrl, settings.threadsUrl, settings.facebookUrl].filter(
      (url): url is string => Boolean(url),
    ),
  };
}

export function websiteJsonLd(settings: SiteSettings): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: settings.businessName,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/tienda?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
}

const ITEM_CONDITION: Record<ProductCondition, string> = {
  nuevo: "https://schema.org/NewCondition",
  // schema.org no tiene "open box": se declara como usado para no prometer más de lo real.
  open_box: "https://schema.org/UsedCondition",
  usado: "https://schema.org/UsedCondition",
  reacondicionado: "https://schema.org/RefurbishedCondition",
};

export function productJsonLd(product: ProductDetail): Record<string, unknown> {
  const url = absoluteUrl(`/producto/${product.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription ?? product.description ?? undefined,
    sku: product.variants[0]?.sku ?? undefined,
    category: product.category.name,
    brand: product.brand ? { "@type": "Brand", name: product.brand.name } : undefined,
    image:
      product.images.length > 0 ? product.images.map((image) => absoluteUrl(image.url)) : undefined,
    url,
    offers: product.variants.map((variant) => ({
      "@type": "Offer",
      sku: variant.sku ?? undefined,
      url,
      price: variant.priceRetail.toFixed(2),
      priceCurrency: CURRENCY_CODE,
      itemCondition: ITEM_CONDITION[product.condition],
      availability:
        variant.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    })),
  };
}

export function breadcrumbJsonLd(
  crumbs: { name: string; path: string }[],
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}
