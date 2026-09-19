"use server";

import { failure, success, validationFailure, type ActionResult } from "@/lib/actions/result";
import { dbFailure, publish, withAdmin } from "@/lib/admin/action-helpers";
import { serviceSchema } from "@/lib/validation/admin/content";
import { reorderSchema } from "@/lib/validation/admin/taxonomy";

export async function saveService(input: unknown): Promise<ActionResult<{ id: string }>> {
  return withAdmin(async ({ supabase }) => {
    const parsed = serviceSchema.safeParse(input);
    if (!parsed.success) return validationFailure(parsed.error);
    const value = parsed.data;
    const row = {
      name: value.name,
      slug: value.slug,
      description: value.description ?? null,
      icon: value.icon ?? null,
      price_from: value.priceFrom ?? null,
      turnaround: value.turnaround ?? null,
      device_types: value.deviceTypes,
      is_active: value.isActive,
    };
    const uniqueMessage = "Ya existe un servicio con ese slug.";

    if (value.id) {
      const { error } = await supabase.from("services").update(row).eq("id", value.id);
      if (error) return dbFailure(error, { unique: uniqueMessage });
      publish("services");
      return success({ id: value.id });
    }

    const { data: last } = await supabase
      .from("services")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1);
    const { data, error } = await supabase
      .from("services")
      .insert({ ...row, sort_order: (last?.[0]?.sort_order ?? 0) + 1 })
      .select("id")
      .single();
    if (error) return dbFailure(error, { unique: uniqueMessage });
    publish("services");
    return success({ id: data.id });
  });
}

export async function deleteService(id: string): Promise<ActionResult<void>> {
  return withAdmin(async ({ supabase }) => {
    const parsed = serviceSchema.shape.id.safeParse(id);
    if (!parsed.success || !parsed.data) return failure("Servicio no válido.");

    const { count } = await supabase
      .from("repair_requests")
      .select("id", { count: "exact", head: true })
      .eq("service_id", parsed.data);
    if ((count ?? 0) > 0) {
      return failure(
        `Tiene ${count} solicitud(es) de reparación asociadas. Desactívalo para ocultarlo sin perder el historial.`,
      );
    }

    const { error } = await supabase.from("services").delete().eq("id", parsed.data);
    if (error) return dbFailure(error);
    publish("services");
    return success();
  });
}

export async function reorderServices(ids: string[]): Promise<ActionResult<void>> {
  return withAdmin(async ({ supabase }) => {
    const parsed = reorderSchema.safeParse({ ids });
    if (!parsed.success) return validationFailure(parsed.error);
    const results = await Promise.all(
      parsed.data.ids.map((id, index) =>
        supabase
          .from("services")
          .update({ sort_order: index + 1 })
          .eq("id", id),
      ),
    );
    const failed = results.find((result) => result.error);
    if (failed?.error) return dbFailure(failed.error);
    publish("services");
    return success();
  });
}
