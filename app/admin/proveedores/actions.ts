"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { failure, success, validationFailure, type ActionResult } from "@/lib/actions/result";
import { dbFailure, publish, removeStoredImages, withAdmin } from "@/lib/admin/action-helpers";
import { unreferencedImageUrls } from "@/lib/admin/image-references";
import { REQUEST_STATUSES } from "@/lib/admin/status";
import { reorderSchema } from "@/lib/validation/admin/taxonomy";
import { wholesaleContactSchema, wholesaleProductSchema } from "@/lib/validation/admin/wholesale";

const idSchema = z.uuid();

export async function saveWholesaleProduct(input: unknown): Promise<ActionResult<{ id: string }>> {
  return withAdmin(async ({ supabase }) => {
    const parsed = wholesaleProductSchema.safeParse(input);
    if (!parsed.success) return validationFailure(parsed.error);
    const value = parsed.data;
    const row = {
      name: value.name,
      product_type: value.type,
      category: value.category,
      condition: value.condition,
      price: value.price,
      image_url: value.imageUrl ?? null,
      is_active: value.isActive,
    };

    if (value.id) {
      const { data: previous } = await supabase
        .from("wholesale_products")
        .select("image_url")
        .eq("id", value.id)
        .maybeSingle();
      const { error } = await supabase.from("wholesale_products").update(row).eq("id", value.id);
      if (error) return dbFailure(error);
      // Si se cambió o quitó la foto, la anterior ya no la usa nadie.
      if (previous?.image_url && previous.image_url !== row.image_url) {
        await removeStoredImages(await unreferencedImageUrls([previous.image_url]));
      }
      publish("wholesale");
      return success({ id: value.id });
    }

    const { data: last } = await supabase
      .from("wholesale_products")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1);
    const { data, error } = await supabase
      .from("wholesale_products")
      .insert({ ...row, sort_order: (last?.[0]?.sort_order ?? 0) + 1 })
      .select("id")
      .single();
    if (error) return dbFailure(error);
    publish("wholesale");
    return success({ id: data.id });
  });
}

export async function deleteWholesaleProduct(id: string): Promise<ActionResult<void>> {
  return withAdmin(async ({ supabase }) => {
    const parsedId = idSchema.safeParse(id);
    if (!parsedId.success) return failure("Producto no válido.");

    const { data: product } = await supabase
      .from("wholesale_products")
      .select("image_url")
      .eq("id", parsedId.data)
      .maybeSingle();
    // Los pedidos ya enviados guardan el nombre y el precio: no se pierden.
    const { error } = await supabase.from("wholesale_products").delete().eq("id", parsedId.data);
    if (error) return dbFailure(error);
    if (product?.image_url) {
      await removeStoredImages(await unreferencedImageUrls([product.image_url]));
    }
    publish("wholesale");
    return success();
  });
}

export async function saveWholesaleContact(input: unknown): Promise<ActionResult<{ id: string }>> {
  return withAdmin(async ({ supabase }) => {
    const parsed = wholesaleContactSchema.safeParse(input);
    if (!parsed.success) return validationFailure(parsed.error);
    const value = parsed.data;
    const row = {
      label: value.label,
      person_name: value.personName ?? null,
      whatsapp: value.whatsapp,
      is_active: value.isActive,
    };

    if (value.id) {
      const { error } = await supabase.from("wholesale_contacts").update(row).eq("id", value.id);
      if (error) return dbFailure(error);
      publish("wholesale");
      return success({ id: value.id });
    }

    const { data: last } = await supabase
      .from("wholesale_contacts")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1);
    const { data, error } = await supabase
      .from("wholesale_contacts")
      .insert({ ...row, sort_order: (last?.[0]?.sort_order ?? 0) + 1 })
      .select("id")
      .single();
    if (error) return dbFailure(error);
    publish("wholesale");
    return success({ id: data.id });
  });
}

export async function deleteWholesaleContact(id: string): Promise<ActionResult<void>> {
  return withAdmin(async ({ supabase }) => {
    const parsedId = idSchema.safeParse(id);
    if (!parsedId.success) return failure("Contacto no válido.");
    const { error } = await supabase.from("wholesale_contacts").delete().eq("id", parsedId.data);
    if (error) return dbFailure(error);
    publish("wholesale");
    return success();
  });
}

export async function reorderWholesaleContacts(ids: string[]): Promise<ActionResult<void>> {
  return withAdmin(async ({ supabase }) => {
    const parsed = reorderSchema.safeParse({ ids });
    if (!parsed.success) return validationFailure(parsed.error);
    const results = await Promise.all(
      parsed.data.ids.map((id, index) =>
        supabase
          .from("wholesale_contacts")
          .update({ sort_order: index + 1 })
          .eq("id", id),
      ),
    );
    const failed = results.find((result) => result.error);
    if (failed?.error) return dbFailure(failed.error);
    publish("wholesale");
    return success();
  });
}

const statusSchema = z.object({ id: idSchema, status: z.enum(REQUEST_STATUSES) });

export async function setWholesaleOrderStatus(
  id: string,
  status: string,
): Promise<ActionResult<void>> {
  return withAdmin(async ({ supabase }) => {
    const parsed = statusSchema.safeParse({ id, status });
    if (!parsed.success) return failure("Estado no válido.");
    const { error } = await supabase
      .from("wholesale_orders")
      .update({ status: parsed.data.status })
      .eq("id", parsed.data.id);
    if (error) return dbFailure(error);
    revalidatePath("/admin", "layout");
    return success();
  });
}
