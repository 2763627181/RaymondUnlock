"use server";

import { z } from "zod";
import { failure, success, validationFailure, type ActionResult } from "@/lib/actions/result";
import { dbFailure, publish, removeStoredImages, withAdmin } from "@/lib/admin/action-helpers";
import { unreferencedImageUrls } from "@/lib/admin/image-references";
import { createAdminClient } from "@/lib/supabase/admin";
import { imageAltSchema, imageInputSchema } from "@/lib/validation/admin/product";
import { nullableUuid } from "@/lib/validation/admin/common";

const addSchema = z.object({
  productId: z.uuid(),
  images: z.array(imageInputSchema).min(1).max(20),
});

const updateSchema = z.object({
  id: z.uuid(),
  alt: imageAltSchema,
  variantId: nullableUuid,
});

const reorderSchema = z.object({ productId: z.uuid(), ids: z.array(z.uuid()).min(1).max(100) });

/** Una imagen solo puede asignarse a una variante del mismo producto. */
async function variantsBelongToProduct(
  productId: string,
  variantIds: (string | null)[],
): Promise<boolean> {
  const wanted = [...new Set(variantIds.flatMap((id) => (id ? [id] : [])))];
  if (wanted.length === 0) return true;
  const { count } = await createAdminClient()
    .from("product_variants")
    .select("id", { count: "exact", head: true })
    .eq("product_id", productId)
    .in("id", wanted);
  return count === wanted.length;
}

/** Registra imágenes ya subidas a Storage (la subida la hace el navegador con la sesión del admin). */
export async function addProductImages(input: unknown): Promise<ActionResult<void>> {
  return withAdmin(async ({ supabase }) => {
    const parsed = addSchema.safeParse(input);
    if (!parsed.success) return validationFailure(parsed.error);
    const { productId, images } = parsed.data;

    if (
      !(await variantsBelongToProduct(
        productId,
        images.map((image) => image.variantId),
      ))
    ) {
      return failure("Una de las variantes no pertenece a este producto.");
    }

    const { data: last } = await supabase
      .from("product_images")
      .select("sort_order")
      .eq("product_id", productId)
      .order("sort_order", { ascending: false })
      .limit(1);
    const start = (last?.[0]?.sort_order ?? 0) + 1;

    const { error } = await supabase.from("product_images").insert(
      images.map((image, index) => ({
        product_id: productId,
        variant_id: image.variantId,
        url: image.url,
        alt: image.alt,
        sort_order: start + index,
      })),
    );
    if (error) return dbFailure(error, { foreignKey: "El producto ya no existe." });
    publish("catalog");
    return success();
  });
}

export async function updateProductImage(input: unknown): Promise<ActionResult<void>> {
  return withAdmin(async ({ supabase }) => {
    const parsed = updateSchema.safeParse(input);
    if (!parsed.success) return validationFailure(parsed.error);
    const { id, alt, variantId } = parsed.data;

    const { data: image } = await supabase
      .from("product_images")
      .select("product_id")
      .eq("id", id)
      .maybeSingle();
    if (!image) return failure("No encontramos la imagen.");
    if (!(await variantsBelongToProduct(image.product_id, [variantId]))) {
      return failure("Esa variante no pertenece a este producto.");
    }

    const { error } = await supabase
      .from("product_images")
      .update({ alt, variant_id: variantId })
      .eq("id", id);
    if (error) return dbFailure(error);
    publish("catalog");
    return success();
  });
}

export async function reorderProductImages(input: unknown): Promise<ActionResult<void>> {
  return withAdmin(async ({ supabase }) => {
    const parsed = reorderSchema.safeParse(input);
    if (!parsed.success) return validationFailure(parsed.error);
    const { productId, ids } = parsed.data;

    const results = await Promise.all(
      ids.map((id, index) =>
        supabase
          .from("product_images")
          .update({ sort_order: index + 1 })
          .eq("id", id)
          .eq("product_id", productId),
      ),
    );
    const failed = results.find((result) => result.error);
    if (failed?.error) return dbFailure(failed.error);
    publish("catalog");
    return success();
  });
}

export async function deleteProductImage(id: string): Promise<ActionResult<void>> {
  return withAdmin(async ({ supabase }) => {
    const parsed = z.uuid().safeParse(id);
    if (!parsed.success) return failure("Imagen no válida.");

    const { data: image } = await supabase
      .from("product_images")
      .select("url")
      .eq("id", parsed.data)
      .maybeSingle();
    const { error } = await supabase.from("product_images").delete().eq("id", parsed.data);
    if (error) return dbFailure(error);

    if (image) await removeStoredImages(await unreferencedImageUrls([image.url]));
    publish("catalog");
    return success();
  });
}
