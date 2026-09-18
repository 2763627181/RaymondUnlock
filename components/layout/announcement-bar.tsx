import { Phone } from "lucide-react";
import { Container } from "@/components/layout/container";

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "18099063114";
const DISPLAY_PHONE = "809-906-3114";

export function AnnouncementBar() {
  return (
    <div className="bg-ink text-surface hidden text-xs sm:block">
      <Container className="flex h-9 items-center justify-between">
        <p>Envíos a todo el país · Soporte por WhatsApp</p>
        <a
          href={`tel:+${WHATSAPP_NUMBER}`}
          className="hover:text-brand-red flex items-center gap-1.5 transition-colors"
        >
          <Phone className="size-3.5" aria-hidden="true" />
          {DISPLAY_PHONE}
        </a>
      </Container>
    </div>
  );
}
