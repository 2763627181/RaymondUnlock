import type { NextConfig } from "next";
import createBundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = createBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  images: {
    // Fase 2: se agrega el hostname del proyecto Supabase (Storage) aqui.
    remotePatterns: [],
  },
};

export default withBundleAnalyzer(nextConfig);
