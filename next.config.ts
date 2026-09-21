import type { NextConfig } from "next";
import createBundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = createBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

const nextConfig: NextConfig = {
  // Generadores de Excel y PDF: se cargan tal cual desde node_modules, sin empaquetarlos.
  serverExternalPackages: ["exceljs", "@react-pdf/renderer"],
  images: {
    // Fotos de productos y banners que se suben al bucket público "products".
    remotePatterns: supabaseUrl
      ? [
          {
            protocol: "https",
            hostname: new URL(supabaseUrl).hostname,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
  },
};

export default withBundleAnalyzer(nextConfig);
