import "server-only";
import { unstable_cache } from "next/cache";
import { z } from "zod";
import { createAnonClient } from "@/lib/supabase/anon";
import { SETTING_SCHEMAS } from "@/lib/validation/settings";
import type { SiteSettings } from "@/types/site";

/** Etiqueta para invalidar los ajustes desde /admin/ajustes con `updateTag`. */
export const SETTINGS_TAG = "settings";

const REVALIDATE_SECONDS = 300;

function readSetting<S extends z.ZodType>(
  values: Map<string, unknown>,
  key: string,
  schema: S,
  fallback?: z.output<S>,
): z.output<S> {
  if (fallback !== undefined && !values.has(key)) return fallback;
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
  const schemas = SETTING_SCHEMAS;

  return {
    ...readSetting(values, "business", schemas.business),
    guarantees: readSetting(values, "guarantees", schemas.guarantees),
    whyUs: readSetting(values, "why_us", schemas.why_us),
    repairProcess: readSetting(values, "repair_process", schemas.repair_process),
    testimonials: readSetting(values, "testimonials", schemas.testimonials),
    navPromos: readSetting(values, "nav_promos", schemas.nav_promos),
    hours: readSetting(values, "hours", schemas.hours, []),
  };
}

export const getSiteSettings = unstable_cache(loadSiteSettings, ["site-settings"], {
  tags: [SETTINGS_TAG],
  revalidate: REVALIDATE_SECONDS,
});
