"use client";

import Link from "next/link";
import { MapPin, MessageCircle, Phone, Store } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

export interface ListingBusiness {
  name: string;
  phoneDisplay: string;
  phoneHref: string;
  whatsappUrl: string;
  address: string;
}

function Row({
  href,
  icon: Icon,
  title,
  detail,
  external = false,
}: {
  href: string;
  icon: typeof Phone;
  title: string;
  detail?: string;
  external?: boolean;
}) {
  const content = (
    <>
      <span className="bg-surface-2 grid size-11 shrink-0 place-items-center rounded-xl">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-medium">{title}</span>
        {detail ? <span className="text-muted-foreground block text-sm">{detail}</span> : null}
      </span>
    </>
  );
  const className =
    "border-border hover:bg-surface-2 flex items-center gap-3 rounded-2xl border p-3 transition-colors";
  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {content}
    </a>
  ) : (
    <Link href={href} className={className}>
      {content}
    </Link>
  );
}

/** "Más": cómo hablar con el negocio y volver a la tienda. */
export function MoreSheet({
  open,
  onOpenChange,
  business,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  business: ListingBusiness;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="mx-auto max-w-3xl gap-0 rounded-t-3xl p-0">
        <div aria-hidden="true" className="bg-border mx-auto mt-2.5 h-1.5 w-14 rounded-full" />
        <div className="border-border border-b px-5 pt-3 pb-4">
          <SheetTitle className="text-xl font-semibold">{business.name}</SheetTitle>
        </div>
        <div className="space-y-3 p-5 pb-8">
          <Row
            href={business.whatsappUrl}
            icon={MessageCircle}
            title="Escríbenos por WhatsApp"
            external
          />
          <Row
            href={business.phoneHref}
            icon={Phone}
            title="Llámanos"
            detail={business.phoneDisplay}
            external
          />
          <Row
            href="/"
            icon={Store}
            title="Ir a la tienda"
            detail="Celulares, tablets y más al detalle"
          />
          <p className="text-muted-foreground flex items-start gap-2 px-1 pt-1 text-sm">
            <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {business.address}
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
