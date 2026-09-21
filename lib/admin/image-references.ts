import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * De una lista de URLs, las que ya no usa ningún producto, banner ni producto del listado mayorista. Solo esas
 * pueden borrarse de Storage: un producto duplicado comparte los archivos del
 * original, y borrarlos rompería sus imágenes.
 */
export async function unreferencedImageUrls(urls: string[]): Promise<string[]> {
  if (urls.length === 0) return [];
  const admin = createAdminClient();
  const [images, banners, wholesale] = await Promise.all([
    admin.from("product_images").select("url").in("url", urls),
    admin.from("banners").select("image_url").in("image_url", urls),
    admin.from("wholesale_products").select("image_url").in("image_url", urls),
  ]);
  const inUse = new Set([
    ...(images.data ?? []).map((row) => row.url),
    ...(banners.data ?? []).map((row) => row.image_url),
    ...(wholesale.data ?? []).map((row) => row.image_url),
  ]);
  return urls.filter((url) => !inUse.has(url));
}
