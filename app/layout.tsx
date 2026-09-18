import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://raymondunlock.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Raymond Unlock — Celulares y Más",
    template: "%s | Raymond Unlock",
  },
  description:
    "Desbloqueo, reparación y venta de celulares y artículos electrónicos en Santo Domingo, República Dominicana.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-DO" data-scroll-behavior="smooth" className={cn(geist.variable)}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
