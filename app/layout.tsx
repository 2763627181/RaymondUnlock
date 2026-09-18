import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { MotionProvider } from "@/components/motion/motion-provider";
import { Toaster } from "@/components/ui/toaster";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileBar } from "@/components/layout/mobile-bar";
import { navCategories, navSecondaryLinks, navWholesaleLink } from "@/lib/nav-data";
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
      <body className="font-sans antialiased">
        <MotionProvider>
          <AnnouncementBar />
          <Header
            categories={navCategories}
            secondaryLinks={navSecondaryLinks}
            wholesaleLink={navWholesaleLink}
          />
          <main className="pb-16 lg:pb-0">{children}</main>
          <Footer />
          <MobileBar />
          <Toaster />
        </MotionProvider>
      </body>
    </html>
  );
}
