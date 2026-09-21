"use server";

import { z } from "zod";
import { failure, success, validationFailure, type ActionResult } from "@/lib/actions/result";
import { dbFailure, publish, removeStoredImages, withAdmin } from "@/lib/admin/action-helpers";
import { unreferencedImageUrls } from "@/lib/admin/image-references";
import { createAdminClient } from "@/lib/supabase/admin";
import { productSchema, type ProductValues } from "@/lib/validation/admin/product";

const SKU_TAKEN = "Un SKU ya está en uso por otro producto.";
const SLUG_TAKEN = "Ya existe un producto con ese slug.";

function variantRow(productId: string, variant: ProductValues["variants"][number], index: number) {
  return {
    product_id: productId,
    sku: variant.sku ?? null,
    capacity: variant.capacity ?? null,
    color: variant.color ?? null,
    color_hex: variant.colorHex ?? null,
    battery_health: variant.batteryHealth ?? null,
    unlock_type: variant.unlockType ?? null,
    price_retail: variant.priceRetail,
    compare_at_price: variant.compareAtPrice ?? null,
    stock: variant.stock,
    is_active: variant.isActive,
    sort_order: index + 1,
  };
}

/**
 * Guarda el producto y sincroniza sus variantes. product_variants está cerrada a
 * la API (contiene el precio al por mayor), por eso las variantes se escriben con
 * service_role, siempre después de `withAdmin`.
 */
export async function saveProduct(input: unknown): Promise<ActionResult<{ id: string }>> {
  return withAdmin(async ({ supabase }) => {
    const parsed = productSchema.safeParse(input);
    if (!parsed.success) return validationFailure(parsed.error);
    const value = parsed.data;
    const admin = createAdminClient();

    const row = {
      name: value.name,
      slug: value.slug,
      category_id: value.categoryId,
      brand_id: value.brandId,
      condition: value.condition,
      short_description: value.shortDescription ?? null,
      description: value.description ?? null,
      warranty_note: value.warrantyNote ?? null,
      specs: Object.fromEntries(value.specs.map((spec) => [spec.key, spec.value])),
      is_active: value.isActive,
      is_featured: value.isFeatured,
    };

    let productId = value.id;
    const isNew = productId === undefined;

    if (productId) {
      const { error } = await supabase.from("products").update(row).eq("id", productId);
      if (error)
        return dbFailure(error, {
          unique: SLUG_TAKEN,
          foreignKey: "La categoría o la marca ya no existe.",
        });
    } else {
      const { data: last } = await supabase
        .from("products")
        .select("sort_order")
        .order("sort_order", { ascending: false })
        .limit(1);
      const { data, error } = await supabase
        .from("products")
        .insert({ ...row, sort_order: (last?.[0]?.sort_order ?? 0) + 1 })
        .select("id")
        .single();
      if (error)
        return dbFailure(error, {
          unique: SLUG_TAKEN,
          foreignKey: "La categoría o la marca ya no existe.",
        });
      productId = data.id;
    }

    const variantsResult = await syncVariants(admin, productId, value.variants);
    if (!variantsResult.ok) {
      // Un producto nuevo no puede quedar a medias, sin variantes.
      if (isNew) await supabase.from("products").delete().eq("id", productId);
      return variantsResult;
    }

    publish("catalog");
    return success({ id: productId });
  });
}

async function syncVariants(
  admin: ReturnType<typeof createAdminClient>,
  productId: string,
  variants: ProductValues["variants"],
): Promise<ActionResult<void>> {
  const { data: existing, error: existingError } = await admin
    .from("product_variants")
    .select("id")
    .eq("product_id", productId);
  if (existingError) return dbFailure(existingError);

  const existingIds = new Set(existing.map((variant) => variant.id));
  // Una variante enviada con id ajeno no puede tocar variantes de otro producto.
  if (variants.some((variant) => variant.id && !existingIds.has(variant.id))) {
    return failure("Una de las variantes no pertenece a este producto. Recarga la página.");
  }

  const keptIds = new Set(variants.flatMap((variant) => (variant.id ? [variant.id] : [])));
  const removedIds = [...existingIds].filter((id) => !keptIds.has(id));

  if (removedIds.length > 0) {
    const { data: used } = await admin
      .from("quote_items")
      .select("variant_id")
      .in("variant_id", removedIds);
    const usedIds = new Set(
      (used ?? []).flatMap((item) => (item.variant_id ? [item.variant_id] : [])),
    );
    const toDelete = removedIds.filter((id) => !usedIds.has(id));
    const toDeactivate = removedIds.filter((id) => usedIds.has(id));

    // Con cotizaciones asociadas nunca se borra: se desactiva y el historial queda intacto.
    if (toDelete.length > 0) {
      const { error } = await admin.from("product_variants").delete().in("id", toDelete);
      if (error) return dbFailure(error);
    }
    if (toDeactivate.length > 0) {
      const { error } = await admin
        .from("product_variants")
        .update({ is_active: false })
        .in("id", toDeactivate);
      if (error) return dbFailure(error);
    }
  }

  const fresh = variants.flatMap((variant, index) =>
    variant.id ? [] : [variantRow(productId, variant, index)],
  );
  if (fresh.length > 0) {
    const { error } = await admin.from("product_variants").insert(fresh);
    if (error) return dbFailure(error, { unique: SKU_TAKEN });
  }

  for (const [index, variant] of variants.entries()) {
    if (!variant.id) continue;
    const { error } = await admin
      .from("product_variants")
      .update(variantRow(productId, variant, index))
      .eq("id", variant.id);
    if (error) return dbFailure(error, { unique: SKU_TAKEN });
  }
  return success();
}

const idSchema = z.uuid();

async function uniqueCopySlug(
  supabase: Parameters<Parameters<typeof withAdmin>[0]>[0]["supabase"],
  slug: string,
): Promise<string> {
  for (let attempt = 1; attempt <= 30; attempt += 1) {
    const candidate = attempt === 1 ? `${slug}-copia` : `${slug}-copia-${attempt}`;
    const { count } = await supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("slug", candidate);
    if ((count ?? 0) === 0) return candidate;
  }
  return `${slug}-copia-${Date.now()}`;
}

/** Copia el producto (variantes e imágenes) desactivado, listo para editar. */
export async function duplicateProduct(id: string): Promise<ActionResult<{ id: string }>> {
  return withAdmin(async ({ supabase }) => {
    const parsedId = idSchema.safeParse(id);
    if (!parsedId.success) return failure("Producto no válido.");
    const admin = createAdminClient();

    const [{ data: product }, { data: variants }, { data: images }] = await Promise.all([
      supabase.from("products").select("*").eq("id", parsedId.data).maybeSingle(),
      admin
        .from("product_variants")
        .select("*")
        .eq("product_id", parsedId.data)
        .order("sort_order"),
      supabase
        .from("product_images")
        .select("*")
        .eq("product_id", parsedId.data)
        .order("sort_order"),
    ]);
    if (!product || !variants) return failure("No encontramos el producto.");

    const { data: last } = await supabase
      .from("products")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1);
    const { data: copy, error } = await supabase
      .from("products")
      .insert({
        name: `Copia de ${product.name}`.slice(0, 120),
        slug: await uniqueCopySlug(supabase, product.slug),
        category_id: product.category_id,
        brand_id: product.brand_id,
        condition: product.condition,
        short_description: product.short_description,
        description: product.description,
        warranty_note: product.warranty_note,
        specs: product.specs,
        is_active: false,
        is_featured: false,
        sort_order: (last?.[0]?.sort_order ?? 0) + 1,
      })
      .select("id")
      .single();
    if (error) return dbFailure(error, { unique: SLUG_TAKEN });

    // El SKU es único en toda la tienda: las copias salen sin SKU y la base les asigna uno nuevo.
    const { data: newVariants, error: variantsError } = await admin
      .from("product_variants")
      .insert(
        variants.map((variant) => ({
          product_id: copy.id,
          sku: null,
          capacity: variant.capacity,
          color: variant.color,
          color_hex: variant.color_hex,
          battery_health: variant.battery_health,
          unlock_type: variant.unlock_type,
          price_retail: variant.price_retail,
          compare_at_price: variant.compare_at_price,
          stock: variant.stock,
          is_active: variant.is_active,
          sort_order: variant.sort_order,
        })),
      )
      .select("id, sort_order");
    if (variantsError) {
      await supabase.from("products").delete().eq("id", copy.id);
      return dbFailure(variantsError);
    }

    const newVariantByOld = new Map(
      variants.flatMap((variant) => {
        const match = newVariants.find((item) => item.sort_order === variant.sort_order);
        return match ? [[variant.id, match.id] as const] : [];
      }),
    );
    if (images && images.length > 0) {
      await supabase.from("product_images").insert(
        images.map((image) => ({
          product_id: copy.id,
          variant_id: image.variant_id ? (newVariantByOld.get(image.variant_id) ?? null) : null,
          url: image.url,
          alt: image.alt,
          sort_order: image.sort_order,
        })),
      );
    }

    publish("catalog");
    return success({ id: copy.id });
  });
}

const bulkSchema = z.object({ ids: z.array(z.uuid()).min(1).max(200), active: z.boolean() });

export async function setProductsActive(
  ids: string[],
  active: boolean,
): Promise<ActionResult<void>> {
  return withAdmin(async ({ supabase }) => {
    const parsed = bulkSchema.safeParse({ ids, active });
    if (!parsed.success) return validationFailure(parsed.error);
    const { error } = await supabase
      .from("products")
      .update({ is_active: parsed.data.active })
      .in("id", parsed.data.ids);
    if (error) return dbFailure(error);
    publish("catalog");
    return success();
  });
}

/** Nunca se borra un producto con cotizaciones asociadas: se desactiva. */
export async function deleteProduct(id: string): Promise<ActionResult<void>> {
  return withAdmin(async ({ supabase }) => {
    const parsedId = idSchema.safeParse(id);
    if (!parsedId.success) return failure("Producto no válido.");
    const admin = createAdminClient();

    const { data: variants } = await admin
      .from("product_variants")
      .select("id")
      .eq("product_id", parsedId.data);
    const variantIds = (variants ?? []).map((variant) => variant.id);
    if (variantIds.length > 0) {
      const { count } = await admin
        .from("quote_items")
        .select("id", { count: "exact", head: true })
        .in("variant_id", variantIds);
      if ((count ?? 0) > 0) {
        return failure(
          "Tiene cotizaciones asociadas, así que no se puede eliminar. Desactívalo para ocultarlo de la tienda.",
        );
      }
    }

    const { data: images } = await supabase
      .from("product_images")
      .select("url")
      .eq("product_id", parsedId.data);
    const { error } = await supabase.from("products").delete().eq("id", parsedId.data);
    if (error) return dbFailure(error);

    await removeStoredImages(await unreferencedImageUrls((images ?? []).map((image) => image.url)));
    publish("catalog");
    return success();
  });
}
