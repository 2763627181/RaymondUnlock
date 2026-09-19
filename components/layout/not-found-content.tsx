import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";

export function NotFoundContent() {
  return (
    <Container className="flex min-h-[60svh] flex-col items-center justify-center py-16 text-center">
      <p className="text-brand-red-600 text-sm font-semibold">Error 404</p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
        Esta página no existe
      </h1>
      <p className="text-muted-foreground mt-4 max-w-md text-[15px] leading-relaxed">
        Puede que el enlace esté roto o que el producto ya no esté disponible. Busca en la tienda o
        vuelve al inicio.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild className="h-11 px-6 text-base">
          <Link href="/">Ir al inicio</Link>
        </Button>
        <Button asChild variant="outline" className="h-11 px-6 text-base">
          <Link href="/tienda">Ver la tienda</Link>
        </Button>
      </div>
    </Container>
  );
}
