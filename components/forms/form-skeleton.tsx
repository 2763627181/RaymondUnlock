import { cn } from "@/lib/utils";

/** Marcador mientras se descarga un formulario diferido: reserva su altura para no mover la página. */
export function FormSkeleton({ className }: { className?: string }) {
  return (
    <div
      role="status"
      aria-label="Cargando formulario"
      className={cn("skeleton w-full rounded-lg", className)}
    />
  );
}
