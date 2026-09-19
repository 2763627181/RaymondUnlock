import { compressImage } from "@/lib/admin/compress-image";
import { createBrowserSupabase } from "@/lib/supabase/client";

const BUCKET = "products";

export type UploadResult = { ok: true; url: string } | { ok: false; message: string };

/**
 * Comprime y sube una imagen al bucket público con la sesión del admin (el RLS
 * de Storage permite escribir solo a un admin). Cada archivo lleva un nombre
 * nuevo: las URLs públicas se cachean en el CDN, así que nunca se sobrescribe.
 */
export async function uploadImage(file: File, folder: string): Promise<UploadResult> {
  try {
    const blob = await compressImage(file);
    const extension = blob.type === "image/webp" ? "webp" : "jpg";
    const path = `${folder}/${crypto.randomUUID()}.${extension}`;
    const storage = createBrowserSupabase().storage.from(BUCKET);

    const { error } = await storage.upload(path, blob, {
      contentType: blob.type,
      cacheControl: "31536000",
      upsert: false,
    });
    if (error) {
      return {
        ok: false,
        message: "No pudimos subir la imagen. Revisa tu sesión e inténtalo de nuevo.",
      };
    }
    return { ok: true, url: storage.getPublicUrl(path).data.publicUrl };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "No pudimos subir la imagen.",
    };
  }
}
