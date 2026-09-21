import type { Metadata } from "next";
import { WholesaleApp } from "@/components/wholesale/wholesale-app";
import { getSiteSettings, getWholesaleListing } from "@/lib/data";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { contactPhones } from "@/lib/contact";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Listado al por mayor",
  description:
    "Lista de precios al por mayor de Raymond Unlock: busca por producto, categoría o condición, arma tu pedido y envíalo por WhatsApp.",
  alternates: { canonical: "/proveedores" },
};

export default async function WholesaleListingPage() {
  const [listing, settings] = await Promise.all([getWholesaleListing(), getSiteSettings()]);

  return (
    <WholesaleApp
      listing={listing}
      business={{
        name: settings.businessName,
        phones: contactPhones(settings),
        whatsappUrl: buildWhatsAppUrl(
          settings.whatsappNumber,
          "Hola, quiero información del listado al por mayor.",
        ),
        address: settings.address,
      }}
    />
  );
}
