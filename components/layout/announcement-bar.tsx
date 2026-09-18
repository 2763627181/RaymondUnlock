import { Phone } from "lucide-react";
import { Container } from "@/components/layout/container";

export function AnnouncementBar({
  phoneDisplay,
  whatsappNumber,
}: {
  phoneDisplay: string;
  whatsappNumber: string;
}) {
  return (
    <div className="bg-ink text-surface hidden text-xs sm:block">
      <Container className="flex h-9 items-center justify-between">
        <p>Envíos a todo el país · Soporte por WhatsApp</p>
        <a
          href={`tel:+${whatsappNumber}`}
          className="hover:text-brand-red flex items-center gap-1.5 transition-colors"
        >
          <Phone className="size-3.5" aria-hidden="true" />
          {phoneDisplay}
        </a>
      </Container>
    </div>
  );
}
