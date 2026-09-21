import Link from "next/link";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";

export function WholesaleCta() {
  return (
    <section className="pb-16 sm:pb-20">
      <Container>
        <div className="bg-ink text-surface flex flex-col items-start justify-between gap-6 rounded-xl p-8 sm:p-12 lg:flex-row lg:items-center">
          <div className="max-w-xl">
            <p className="text-sm font-medium text-white/60">Al por mayor</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              ¿Tienes un negocio? Precios especiales por volumen.
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-white/70">
              Escríbenos con lo que necesitas y te damos el precio por cantidad.
            </p>
          </div>
          <Button asChild className="h-11 shrink-0 px-6 text-base">
            <Link href="/mayorista">Cotizar al por mayor</Link>
          </Button>
        </div>
      </Container>
    </section>
  );
}
