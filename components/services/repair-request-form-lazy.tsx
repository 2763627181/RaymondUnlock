"use client";

import dynamic from "next/dynamic";
import { FormSkeleton } from "@/components/forms/form-skeleton";

/** Ver quote-form-lazy.tsx: mismo motivo (React Hook Form + Zod fuera de la carga inicial). */
export const RepairRequestForm = dynamic(
  () =>
    import("@/components/services/repair-request-form").then((module) => module.RepairRequestForm),
  { ssr: false, loading: () => <FormSkeleton className="h-[40rem]" /> },
);
