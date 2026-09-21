import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/api/og"],
      disallow: ["/admin", "/api/", "/carrito", "/login"],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
