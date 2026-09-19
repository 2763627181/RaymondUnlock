import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Raymond Unlock",
    short_name: "Raymond Unlock",
    description:
      "Desbloqueo, reparación y venta de celulares y artículos electrónicos en Santo Domingo.",
    start_url: "/",
    display: "standalone",
    lang: "es-DO",
    background_color: "#ffffff",
    theme_color: "#0b0b0c",
    icons: [{ src: "/icon", sizes: "512x512", type: "image/png" }],
  };
}
