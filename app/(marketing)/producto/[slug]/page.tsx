import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs, type Crumb } from "@/components/layout/breadcrumbs";
import { Container } from "@/components/layout/container";
import { ProductDetails } from "@/components/product/product-details";
import { ProductExperience } from "@/components/product/product-experience";
import { RelatedProducts } from "@/components/product/related-products";
import { JsonLd } from "@/components/seo/json-ld";
import {
  getAllProductSlugs,
  getCategories,
  getProductBySlug,
  getRelatedProducts,
  getSiteSettings,
} from "@/lib/data";
import { formatPrice } from "@/lib/format";
import { productJsonLd } from "@/lib/seo";

export const revalidate = 300;

export async function generateStaticParams() {
  const slugs = await getAllProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata(props: PageProps<"/producto/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

  const cheapest = Math.min(...product.variants.map((variant) => variant.priceRetail));
  const description =
    product.shortDescription ??
    `${product.name} disponible en Raymond Unlock, Santo Domingo, Distrito Nacional.`;
  const ogParams = new URLSearchParams({
    title: product.name,
    subtitle: [product.brand?.name, product.category.name].filter(Boolean).join(" · "),
    price: `Desde ${formatPrice(cheapest)}`,
  });

  return {
    title: product.name,
    description,
    alternates: { canonical: `/producto/${product.slug}` },
    openGraph: {
      type: "website",
      title: product.name,
      description,
      url: `/producto/${product.slug}`,
      images: [
        { url: `/api/og?${ogParams.toString()}`, width: 1200, height: 630, alt: product.name },
      ],
    },
    twitter: { card: "summary_large_image", title: product.name, description },
  };
}

export default async function ProductPage(props: PageProps<"/producto/[slug]">) {
  const { slug } = await props.params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [related, settings, categories] = await Promise.all([
    getRelatedProducts(product.id, 4),
    getSiteSettings(),
    getCategories(),
  ]);

  const parent = product.category.parentId
    ? categories.find((category) => category.id === product.category.parentId)
    : undefined;
  const crumbs: Crumb[] = [
    { name: "Inicio", path: "/" },
    { name: "Tienda", path: "/tienda" },
    ...(parent ? [{ name: parent.name, path: `/tienda/${parent.slug}` }] : []),
    { name: product.category.name, path: `/tienda/${product.category.slug}` },
    { name: product.name, path: `/producto/${product.slug}` },
  ];

  return (
    <>
      <JsonLd data={productJsonLd(product)} />
      <Container className="py-8 sm:py-10">
        <Breadcrumbs items={crumbs} />
        <ProductExperience
          product={{
            slug: product.slug,
            name: product.name,
            brandName: product.brand?.name ?? null,
            shortDescription: product.shortDescription,
            condition: product.condition,
            categoryIcon: product.category.icon,
            primaryImageUrl: product.images[0]?.url ?? null,
          }}
          variants={product.variants}
          images={product.images}
          whatsappNumber={settings.whatsappNumber}
        />
        <div className="mt-14 max-w-3xl">
          <ProductDetails product={product} shippingNote={settings.shippingNote} />
        </div>
      </Container>
      <RelatedProducts products={related} />
    </>
  );
}
