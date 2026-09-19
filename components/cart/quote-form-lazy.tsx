"use client";

import dynamic from "next/dynamic";
import { FormSkeleton } from "@/components/forms/form-skeleton";

/**
 * El formulario trae React Hook Form y Zod (~90 KB). Se descarga aparte para que
 * las demás páginas, que solo precargan esta ruta, no paguen ese peso.
 */
export const QuoteForm = dynamic(
  () => import("@/components/cart/quote-form").then((module) => module.QuoteForm),
  { ssr: false, loading: () => <FormSkeleton className="h-[38rem]" /> },
);
