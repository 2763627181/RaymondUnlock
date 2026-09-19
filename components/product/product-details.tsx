import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { RichText } from "@/components/product/rich-text";
import type { ProductDetail } from "@/types/catalog";

export function ProductDetails({
  product,
  shippingNote,
}: {
  product: ProductDetail;
  shippingNote: string;
}) {
  const specs = Object.entries(product.specs);

  return (
    <Accordion
      type="multiple"
      defaultValue={["descripcion", "especificaciones"]}
      className="border-border border-t"
    >
      {product.description ? (
        <AccordionItem value="descripcion">
          <AccordionTrigger headingLevel={2} className="py-4 text-base">
            Descripción
          </AccordionTrigger>
          <AccordionContent>
            <RichText text={product.description} />
          </AccordionContent>
        </AccordionItem>
      ) : null}

      {specs.length > 0 ? (
        <AccordionItem value="especificaciones">
          <AccordionTrigger headingLevel={2} className="py-4 text-base">
            Especificaciones
          </AccordionTrigger>
          <AccordionContent>
            <dl className="divide-border divide-y text-[15px]">
              {specs.map(([label, value]) => (
                <div key={label} className="grid grid-cols-[10rem_1fr] gap-4 py-2.5">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </AccordionContent>
        </AccordionItem>
      ) : null}

      {product.warrantyNote ? (
        <AccordionItem value="garantia">
          <AccordionTrigger headingLevel={2} className="py-4 text-base">
            Garantía
          </AccordionTrigger>
          <AccordionContent>
            <p className="text-[15px] leading-relaxed">{product.warrantyNote}</p>
          </AccordionContent>
        </AccordionItem>
      ) : null}

      <AccordionItem value="envio">
        <AccordionTrigger headingLevel={2} className="py-4 text-base">
          Envío
        </AccordionTrigger>
        <AccordionContent>
          <p className="text-[15px] leading-relaxed">{shippingNote}</p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
