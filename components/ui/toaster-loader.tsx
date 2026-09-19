"use client";

import dynamic from "next/dynamic";
import { useToastStore } from "@/lib/toast-store";

const Toaster = dynamic(() => import("@/components/ui/toaster").then((module) => module.Toaster), {
  ssr: false,
});

export function ToasterLoader() {
  const used = useToastStore((state) => state.used);
  return used ? <Toaster /> : null;
}
