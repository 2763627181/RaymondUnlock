"use client";

import { ChevronRight, MessageCircle } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { formatWhatsappNumber } from "@/lib/wholesale/format";
import type { WholesaleContact } from "@/lib/wholesale/types";

/** "Enviar pedido a": el vendedor al que le llega el pedido por WhatsApp. */
export function ContactSheet({
  open,
  onOpenChange,
  contacts,
  disabled,
  onPick,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contacts: WholesaleContact[];
  disabled: boolean;
  onPick: (contact: WholesaleContact) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="mx-auto max-h-[80dvh] max-w-3xl gap-0 rounded-t-3xl p-0"
      >
        <div aria-hidden="true" className="bg-border mx-auto mt-2.5 h-1.5 w-14 rounded-full" />
        <div className="border-border border-b px-5 pt-3 pb-4">
          <SheetTitle className="text-xl font-semibold">Enviar pedido a</SheetTitle>
        </div>
        <ul className="space-y-3 overflow-y-auto p-5">
          {contacts.map((contact) => (
            <li key={contact.id}>
              <button
                type="button"
                disabled={disabled}
                onClick={() => onPick(contact)}
                className="border-border hover:bg-surface-2 focus-visible:ring-ring flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-colors outline-none focus-visible:ring-2 disabled:opacity-60"
              >
                <span className="bg-success-700 grid size-14 shrink-0 place-items-center rounded-full text-white">
                  <MessageCircle className="size-6" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-base">
                    <span className="font-bold">{contact.label}</span>
                    {contact.personName ? (
                      <span className="text-muted-foreground"> — {contact.personName}</span>
                    ) : null}
                  </span>
                  <span className="text-muted-foreground mt-0.5 block text-sm">
                    {formatWhatsappNumber(contact.whatsapp)}
                  </span>
                </span>
                <ChevronRight className="text-muted-foreground size-5" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      </SheetContent>
    </Sheet>
  );
}
