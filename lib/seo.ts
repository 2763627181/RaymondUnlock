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
