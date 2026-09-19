"use server";

import { failure, success, validationFailure, type ActionResult } from "@/lib/actions/result";
import { dbFailure, publish, withAdmin } from "@/lib/admin/action-helpers";
import { brandSchema, reorderSchema } from "@/lib/validation/admin/taxonomy";

export async function saveBrand(input: unknown): Promise<ActionResult<{ id: string }>> {
  return withAdmin(async ({ supabase }) => {
    const parsed = brandSchema.safeParse(input);
    if (!parsed.success) return validationFailure(parsed.error);
    const value = parsed.data;
    const uniqueMessage = "Ya existe una marca con ese slug.";

    if (value.id) {
      const { error } = await supabase
        .from("brands")
        .update({ name: value.name, slug: value.slug })
        .eq("id", value.id);
      if (error) return dbFailure(error, { unique: uniqueMessage });
      publish("catalog");
      return success({ id: value.id });
    }

    const { data: last } = await supabase
      .from("brands")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1);
    const { data, error } = await supabase
      .from("brands")
      .insert({ name: value.name, slug: value.slug, sort_order: (last?.[0]?.sort_order ?? 0) + 1 })
      .select("id")
      .single();
    if (error) return dbFailure(error, { unique: uniqueMessage });
    publish("catalog");
    return success({ id: data.id });
  });
}

export async function deleteBrand(id: string): Promise<ActionResult<void>> {
  return withAdmin(async ({ supabase }) => {
    const parsed = brandSchema.shape.id.safeParse(id);
    if (!parsed.success || !parsed.data) return failure("Marca no válida.");

    const { count } = await supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("brand_id", parsed.data);
    if ((count ?? 0) > 0) {
      return failure(`Tiene ${count} producto(s). Cámbiales la marca antes de eliminarla.`);
    }

    const { error } = await supabase.from("brands").delete().eq("id", parsed.data);
    if (error) return dbFailure(error);
    publish("catalog");
    return success();
  });
}

export async function reorderBrands(ids: string[]): Promise<ActionResult<void>> {
  return withAdmin(async ({ supabase }) => {
    const parsed = reorderSchema.safeParse({ ids });
    if (!parsed.success) return validationFailure(parsed.error);

    const results = await Promise.all(
      parsed.data.ids.map((id, index) =>
        supabase
          .from("brands")
          .update({ sort_order: index + 1 })
          .eq("id", id),
      ),
    );
    const failed = results.find((result) => result.error);
    if (failed?.error) return dbFailure(failed.error);
    publish("catalog");
    return success();
  });
}
