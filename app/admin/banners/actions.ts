"use server";

import { failure, success, validationFailure, type ActionResult } from "@/lib/actions/result";
import { dbFailure, publish, removeStoredImages, withAdmin } from "@/lib/admin/action-helpers";
import { unreferencedImageUrls } from "@/lib/admin/image-references";
import { bannerSchema } from "@/lib/validation/admin/content";
import { reorderSchema } from "@/lib/validation/admin/taxonomy";

export async function saveBanner(input: unknown): Promise<ActionResult<{ id: string }>> {
  return withAdmin(async ({ supabase }) => {
    const parsed = bannerSchema.safeParse(input);
    if (!parsed.success) return validationFailure(parsed.error);
    const value = parsed.data;
    const row = {
      title: value.title,
      subtitle: value.subtitle ?? null,
      image_url: value.imageUrl,
      cta_label: value.ctaLabel ?? null,
      cta_href: value.ctaHref ?? null,
      theme: value.theme,
      is_active: value.isActive,
    };

    if (value.id) {
      const { data: previous } = await supabase
        .from("banners")
        .select("image_url")
        .eq("id", value.id)
        .maybeSingle();
      const { error } = await supabase.from("banners").update(row).eq("id", value.id);
      if (error) return dbFailure(error);
      // Si se cambió la imagen, la anterior ya no la usa nadie.
      if (previous && previous.image_url !== value.imageUrl) {
        await removeStoredImages(await unreferencedImageUrls([previous.image_url]));
      }
      publish("banners", "catalog");
      return success({ id: value.id });
    }

    const { data: last } = await supabase
      .from("banners")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1);
    const { data, error } = await supabase
      .from("banners")
      .insert({ ...row, sort_order: (last?.[0]?.sort_order ?? 0) + 1 })
      .select("id")
      .single();
    if (error) return dbFailure(error);
    publish("banners", "catalog");
    return success({ id: data.id });
  });
}

export async function deleteBanner(id: string): Promise<ActionResult<void>> {
  return withAdmin(async ({ supabase }) => {
    const parsed = bannerSchema.shape.id.safeParse(id);
    if (!parsed.success || !parsed.data) return failure("Banner no válido.");

    const { data: banner } = await supabase
      .from("banners")
      .select("image_url")
      .eq("id", parsed.data)
      .maybeSingle();
    const { error } = await supabase.from("banners").delete().eq("id", parsed.data);
    if (error) return dbFailure(error);
    if (banner) await removeStoredImages(await unreferencedImageUrls([banner.image_url]));
    publish("banners");
    return success();
  });
}

export async function reorderBanners(ids: string[]): Promise<ActionResult<void>> {
  return withAdmin(async ({ supabase }) => {
    const parsed = reorderSchema.safeParse({ ids });
    if (!parsed.success) return validationFailure(parsed.error);
    const results = await Promise.all(
      parsed.data.ids.map((id, index) =>
        supabase
          .from("banners")
          .update({ sort_order: index + 1 })
          .eq("id", id),
      ),
    );
    const failed = results.find((result) => result.error);
    if (failed?.error) return dbFailure(failed.error);
    publish("banners");
    return success();
  });
}
