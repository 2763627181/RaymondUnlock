import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { Logo } from "@/components/layout/logo";
import { NotFoundContent } from "@/components/layout/not-found-content";

export const metadata: Metadata = {
  title: "Página no encontrada",
  robots: { index: false, follow: true },
};

/** Se muestra cuando la URL no coincide con ninguna ruta (sin el chrome de la tienda). */
export default function RootNotFound() {
  return (
    <main id="contenido">
      <Container className="pt-6">
        <Logo />
      </Container>
      <NotFoundContent />
    </main>
  );
}
