/**
 * Las imágenes se pintan con next/image, que lanza un error (y tumba la página
 * entera) si la URL es de un host no permitido en next.config. Por eso solo se
 * aceptan rutas del propio sitio (/seed/…) o URLs de nuestro bucket público.
 */
export function isAllowedImageUrl(url: string): boolean {
  if (/^\/(?!\/)[^\s]*$/.test(url)) return true;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return false;
  try {
    const parsed = new URL(url);
    return (
      parsed.protocol === "https:" &&
      parsed.origin === new URL(supabaseUrl).origin &&
      parsed.pathname.startsWith("/storage/v1/object/public/products/")
    );
  } catch {
    return false;
  }
}
