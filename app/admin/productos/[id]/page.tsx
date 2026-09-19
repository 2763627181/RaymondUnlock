import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { z } from "zod";
import { PageHeader } from "@/components/admin/page-header";
import { ProductForm } from "@/components/admin/product-form";
import { ProductImagesPanel } from "@/components/admin/product-images-panel";
import { ActiveBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { productToInput } from "@/lib/admin/product-form-defaults";
import { requireAdmin } from "@/lib/auth/admin";
import { variantLabel } from "@/lib/catalog/cards";
import { createAdminClient } from "@/lib/supabase/admin";
import { createSessionClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Editar producto" };

export default async function EditProductPage(props: PageProps<"/admin/productos/[id]">) {
  const { id } = await props.params;
  const { nuevo } = await props.searchParams;
  await requireAdmin(`/admin/productos/${id}`);
  if (!z.uuid().safeParse(id).success) notFound();

  const supabase = await createSessionClient();
  const [product, variants, images, categories, brands] = await Promise.all([
    supabase.from("products").select("*").eq("id", id).maybeSingle(),
    // product_variants está cerrada a la API: se lee con service_role, ya verificado el rol.
    createAdminClient()
      .from("product_variants")
      .select("*")
      .eq("product_id", id)
      .order("sort_order"),
    supabase.from("product_images").select("*").eq("product_id", id).order("sort_order"),
    supabase.from("categories").select("id, name, parent_id").order("sort_order"),
    supabase.from("brands").select("id, name").order("sort_order"),
  ]);
  if (!product.data) notFound();
  const variantRows = variants.data ?? [];

  return (
    <>
      <Link
        href="/admin/productos"
        className="text-muted-foreground hover:text-foreground mb-3 inline-flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="size-4" aria-hidden="true" /> Productos
      </Link>
      <PageHeader
        title={product.data.name}
        description={`/producto/${product.data.slug}`}
        actions={
          <>
            <ActiveBadge active={product.data.is_active} />
            {product.data.is_active ? (
              <Button asChild variant="outline" className="h-9">
                <Link href={`/producto/${product.data.slug}`} target="_blank" rel="noopener">
                  Ver en la tienda <ExternalLink aria-hidden="true" />
                </Link>
              </Button>
            ) : null}
          </>
        }
      />

      {nuevo ? (
        <p
          role="status"
          className="border-success-700/30 bg-success-700/5 mb-6 rounded-xl border p-4 text-sm"
        >
          Producto creado. Ahora puedes subir sus imágenes más abajo.
        </p>
      ) : null}

      <ProductForm
        defaults={productToInput(product.data, variantRows)}
        categories={(categories.data ?? []).map((category) => ({
          id: category.id,
          name: category.name,
          parentId: category.parent_id,
        }))}
        brands={brands.data ?? []}
      />

      <div className="border-border mt-12 border-t pt-8">
        <ProductImagesPanel
          productId={product.data.id}
          images={images.data ?? []}
          variants={variantRows.map((variant) => ({
            id: variant.id,
            label:
              variantLabel({ capacity: variant.capacity, color: variant.color }) ??
              variant.sku ??
              "Variante",
          }))}
        />
      </div>
    </>
  );
}
