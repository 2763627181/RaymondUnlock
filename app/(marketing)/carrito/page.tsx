import type { Metadata } from "next";
import { CartPage } from "@/components/cart/cart-page";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Container } from "@/components/layout/container";

export const metadata: Metadata = {
  title: "Tu cotización",
  description: "Revisa los productos de tu cotización y envíala por WhatsApp.",
  robots: { index: false, follow: true },
};

export default function CartRoute() {
  return (
    <Container className="py-8 sm:py-10">
      <Breadcrumbs
        items={[
          { name: "Inicio", path: "/" },
          { name: "Tu cotización", path: "/carrito" },
        ]}
      />
      <h1 className="mb-8 text-3xl font-semibold tracking-tight sm:text-4xl">Tu cotización</h1>
      <CartPage />
    </Container>
  );
}
