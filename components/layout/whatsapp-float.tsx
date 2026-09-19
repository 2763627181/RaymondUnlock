"use client";

import { m, useReducedMotion } from "motion/react";
import { MessageCircle } from "lucide-react";
import { floatingButtonVariants, floatingPulseTransition } from "@/lib/motion";

/** Solo escritorio: en móvil el mismo acceso vive en la barra inferior. */
export function WhatsAppFloat({ whatsappNumber }: { whatsappNumber: string }) {
  const reduceMotion = useReducedMotion();
  const href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    "Hola, quiero hacer una consulta.",
  )}`;

  return (
    <m.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribir por WhatsApp"
      variants={floatingButtonVariants}
      initial="hidden"
      animate="visible"
      className="bg-success fixed right-6 bottom-6 z-40 hidden size-14 items-center justify-center rounded-full text-white shadow-lg outline-none focus-visible:ring-4 focus-visible:ring-green-300 lg:flex"
    >
      {reduceMotion ? null : (
        <m.span
          aria-hidden="true"
          className="bg-success absolute inset-0 rounded-full"
          animate={{ scale: [1, 1.35], opacity: [0.35, 0] }}
          transition={floatingPulseTransition}
        />
      )}
      <MessageCircle className="relative size-7" aria-hidden="true" />
    </m.a>
  );
}
