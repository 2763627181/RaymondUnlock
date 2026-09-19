import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { z } from "zod";
import { QuoteSent } from "@/components/cart/quote-sent";
import { Container } from "@/components/layout/container";
import { getSiteSettings } from "@/lib/data";

export const metadata: Metadata = {
  title: "Cotización enviada",
  robots: { index: false, follow: false },
};

const codeSchema = z.string().regex(/^RU-\d{4}-\d{4,}$/);

export default async function QuoteSentPage(props: PageProps<"/carrito/enviado">) {
  const { code } = await props.searchParams;
  const parsed = codeSchema.safeParse(Array.isArray(code) ? code[0] : code);
  if (!parsed.success) notFound();

  const settings = await getSiteSettings();

  return (
    <Container className="py-16 sm:py-24">
      <QuoteSent code={parsed.data} whatsappNumber={settings.whatsappNumber} />
    </Container>
  );
}
