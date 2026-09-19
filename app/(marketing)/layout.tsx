import { CartDrawer } from "@/components/cart/cart-drawer";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { MobileBar } from "@/components/layout/mobile-bar";
import { getNavCategories, getSiteSettings, getTopLevelCategories } from "@/lib/data";
import { navSecondaryLinks, navWholesaleLink } from "@/lib/nav";

export default async function MarketingLayout({ children }: LayoutProps<"/">) {
  const [settings, navCategories, footerCategories] = await Promise.all([
    getSiteSettings(),
    getNavCategories(),
    getTopLevelCategories(),
  ]);

  return (
    <>
      <AnnouncementBar
        phoneDisplay={settings.phoneDisplay}
        whatsappNumber={settings.whatsappNumber}
      />
      <Header
        categories={navCategories}
        secondaryLinks={navSecondaryLinks}
        wholesaleLink={navWholesaleLink}
      />
      <main id="contenido" className="pb-16 lg:pb-0">
        {children}
      </main>
      <Footer settings={settings} categories={footerCategories} />
      <MobileBar whatsappNumber={settings.whatsappNumber} />
      <CartDrawer />
    </>
  );
}
