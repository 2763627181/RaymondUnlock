"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";

export default function MarketingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container className="flex min-h-[60svh] flex-col items-center justify-center py-16 text-center">
      <p className="text-brand-red-600 text-sm font-semibold">Error inesperado</p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
        Algo salió mal
      </h1>
      <p className="text-muted-foreground mt-4 max-w-md text-[15px] leading-relaxed">
        No pudimos cargar esta página. Inténtalo de nuevo; si sigue fallando, escríbenos por
        WhatsApp.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button className="h-11 px-6 text-base" onClick={reset}>
          Intentar de nuevo
        </Button>
        <Button asChild variant="outline" className="h-11 px-6 text-base">
          <Link href="/">Ir al inicio</Link>
        </Button>
      </div>
    </Container>
  );
}
