import "server-only";
import { unstable_cache } from "next/cache";
import { createAnonClient } from "@/lib/supabase/anon";
import type { Service } from "@/types/site";

/** Etiqueta para invalidar los servicios desde /admin/servicios con `revalidateTag`. */
export const SERVICES_TAG = "services";

const REVALIDATE_SECONDS = 300;

async function loadServices(): Promise<Service[]> {
  // El RLS ya oculta los servicios inactivos a los visitantes.
  const { data, error } = await createAnonClient().from("services").select("*").order("sort_order");
  if (error) throw new Error(`No se pudo leer services: ${error.message}`);

  return data.map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    icon: row.icon,
    priceFrom: row.price_from,
    turnaround: row.turnaround,
    deviceTypes: row.device_types,
    sortOrder: row.sort_order,
  }));
}

export const getServices = unstable_cache(loadServices, ["services"], {
  tags: [SERVICES_TAG],
  revalidate: REVALIDATE_SECONDS,
});

export async function getServiceBySlug(slug: string): Promise<Service | null> {
  return (await getServices()).find((service) => service.slug === slug) ?? null;
}
