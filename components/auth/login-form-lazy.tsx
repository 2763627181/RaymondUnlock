"use client";

import dynamic from "next/dynamic";
import { FormSkeleton } from "@/components/forms/form-skeleton";

/** Ver quote-form-lazy.tsx: mismo motivo (React Hook Form + Zod fuera de la carga inicial). */
export const LoginForm = dynamic(
  () => import("@/components/auth/login-form").then((module) => module.LoginForm),
  { ssr: false, loading: () => <FormSkeleton className="h-72" /> },
);
