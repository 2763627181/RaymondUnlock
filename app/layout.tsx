import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { MotionProvider } from "@/components/motion/motion-provider";
import { Toaster } from "@/components/ui/toaster";
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
  openGraph: {
    type: "website",
    locale: "es_DO",
    siteName: "Raymond Unlock",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-DO" data-scroll-behavior="smooth" className={cn(geist.variable)}>
      <body className="font-sans antialiased">
        <a
          href="#contenido"
          className="bg-ink text-surface focus:ring-ring sr-only z-100 rounded-md px-4 py-2 text-sm focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:ring-2"
        >
          Saltar al contenido
        </a>
        <MotionProvider>
          {children}
          <Toaster />
        </MotionProvider>
      </body>
    </html>
  );
}
