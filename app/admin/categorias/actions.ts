"use server";

import { failure, success, validationFailure, type ActionResult } from "@/lib/actions/result";
import { dbFailure, publish, withAdmin } from "@/lib/admin/action-helpers";
import { categorySchema, reorderSchema } from "@/lib/validation/admin/taxonomy";

export async function saveCategory(input: unknown): Promise<ActionResult<{ id: string }>> {
  return withAdmin(async ({ supabase }) => {
    const parsed = categorySchema.safeParse(input);
    if (!parsed.success) return validationFailure(parsed.error);
    const value = parsed.data;

    if (value.parentId) {
      if (value.parentId === value.id) {
        return failure("Una categoría no puede ser subcategoría de sí misma.");
      }
      const { data: parent } = await supabase
        .from("categories")
        .select("parent_id")
        .eq("id", value.parentId)
        .maybeSingle();
      if (!parent) return failure("La categoría padre ya no existe.");
      if (parent.parent_id) return failure("Solo se permiten dos niveles de categorías.");
      if (value.id) {
        const { count } = await supabase
          .from("categories")
          .select("id", { count: "exact", head: true })
          .eq("parent_id", value.id);
        if ((count ?? 0) > 0) {
          return failure("Esta categoría tiene subcategorías, así que no puede ser subcategoría.");
        }
      }
    }

    const row = {
      name: value.name,
      slug: value.slug,
      description: value.description ?? null,
      icon: value.icon ?? null,
      parent_id: value.parentId,
      is_active: value.isActive,
    };
    const uniqueMessage = "Ya existe una categoría con ese slug.";

    if (value.id) {
      const { error } = await supabase.from("categories").update(row).eq("id", value.id);
      if (error) return dbFailure(error, { unique: uniqueMessage });
      publish("catalog");
      return success({ id: value.id });
    }

    let siblings = supabase.from("categories").select("sort_order");
    siblings = value.parentId
      ? siblings.eq("parent_id", value.parentId)
      : siblings.is("parent_id", null);
    const { data: last } = await siblings.order("sort_order", { ascending: false }).limit(1);
    const sortOrder = (last?.[0]?.sort_order ?? 0) + 1;

    const { data, error } = await supabase
      .from("categories")
      .insert({ ...row, sort_order: sortOrder })
      .select("id")
      .single();
    if (error) return dbFailure(error, { unique: uniqueMessage });
    publish("catalog");
    return success({ id: data.id });
  });
}

export async function deleteCategory(id: string): Promise<ActionResult<void>> {
  return withAdmin(async ({ supabase }) => {
    const parsed = categorySchema.shape.id.safeParse(id);
    if (!parsed.success || !parsed.data) return failure("Categoría no válida.");

    const [children, products] = await Promise.all([
      supabase
        .from("categories")
        .select("id", { count: "exact", head: true })
        .eq("parent_id", parsed.data),
      supabase
        .from("products")
        .select("id", { count: "exact", head: true })
        .eq("category_id", parsed.data),
    ]);
    if ((children.count ?? 0) > 0) {
      return failure("Tiene subcategorías. Muévelas o elimínalas primero.");
    }
    if ((products.count ?? 0) > 0) {
      return failure(
        `Tiene ${products.count} producto(s). Muévelos a otra categoría o desactiva esta categoría.`,
      );
    }

    const { error } = await supabase.from("categories").delete().eq("id", parsed.data);
    if (error) return dbFailure(error);
    publish("catalog");
    return success();
  });
}

export async function reorderCategories(ids: string[]): Promise<ActionResult<void>> {
  return withAdmin(async ({ supabase }) => {
    const parsed = reorderSchema.safeParse({ ids });
    if (!parsed.success) return validationFailure(parsed.error);

    const results = await Promise.all(
      parsed.data.ids.map((id, index) =>
        supabase
          .from("categories")
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
