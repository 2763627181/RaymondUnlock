"use client";

import dynamic from "next/dynamic";
import { FormSkeleton } from "@/components/forms/form-skeleton";

/** Ver quote-form-lazy.tsx: mismo motivo (React Hook Form + Zod fuera de la carga inicial). */
export const RegisterForm = dynamic(
  () => import("@/components/auth/register-form").then((module) => module.RegisterForm),
  { ssr: false, loading: () => <FormSkeleton className="h-[34rem]" /> },
);
