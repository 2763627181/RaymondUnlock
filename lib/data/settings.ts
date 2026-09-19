import "server-only";
import { unstable_cache } from "next/cache";
import { z } from "zod";
import { createAnonClient } from "@/lib/supabase/anon";
import type { SiteSettings } from "@/types/site";

/** Etiqueta para invalidar los ajustes desde /admin/ajustes con `revalidateTag`. */
export const SETTINGS_TAG = "settings";

const REVALIDATE_SECONDS = 300;

const iconCopySchema = z.object({ icon: z.string(), title: z.string(), text: z.string() });

const businessSchema = z.object({
  businessName: z.string(),
  tagline: z.string(),
  description: z.string(),
  address: z.string(),
  addressParts: z.object({
    street: z.string(),
    locality: z.string(),
    postalCode: z.string(),
    country: z.string(),
  }),
  phoneDisplay: z.string(),
  shippingNote: z.string(),
  whatsappNumber: z.string(),
  email: z.string(),
  instagramUrl: z.string(),
  threadsUrl: z.string(),
  facebookUrl: z.string().nullable(),
});

const guaranteesSchema = z.array(iconCopySchema);
const repairProcessSchema = z.array(z.object({ title: z.string(), text: z.string() }));
const testimonialsSchema = z.array(
  z.object({ id: z.string(), name: z.string(), detail: z.string(), quote: z.string() }),
);
const navPromosSchema = z.record(
  z.string(),
  z.object({ title: z.string(), subtitle: z.string(), href: z.string() }),
);

function readSetting<S extends z.ZodType>(
  values: Map<string, unknown>,
  key: string,
  schema: S,
): z.output<S> {
  const result = schema.safeParse(values.get(key));
  if (!result.success) {
    throw new Error(`site_settings.${key} no es válido: ${z.prettifyError(result.error)}`);
  }
  return result.data;
}

async function loadSiteSettings(): Promise<SiteSettings> {
  const { data, error } = await createAnonClient().from("site_settings").select("key, value");
  if (error) throw new Error(`No se pudo leer site_settings: ${error.message}`);
  const values = new Map<string, unknown>(data.map((row) => [row.key, row.value]));

  return {
    ...readSetting(values, "business", businessSchema),
    guarantees: readSetting(values, "guarantees", guaranteesSchema),
    whyUs: readSetting(values, "why_us", guaranteesSchema),
    repairProcess: readSetting(values, "repair_process", repairProcessSchema),
    testimonials: readSetting(values, "testimonials", testimonialsSchema),
    navPromos: readSetting(values, "nav_promos", navPromosSchema),
  };
}

export const getSiteSettings = unstable_cache(loadSiteSettings, ["site-settings"], {
  tags: [SETTINGS_TAG],
  revalidate: REVALIDATE_SECONDS,
});
