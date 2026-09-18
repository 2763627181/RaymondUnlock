import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { Container } from "@/components/layout/container";
import { InstagramIcon, ThreadsIcon } from "@/components/icons/social-icons";
import type { Category } from "@/types/catalog";
import type { SiteSettings } from "@/types/site";

const infoLinks = [
  { name: "Nosotros", href: "/nosotros" },
  { name: "Servicios técnicos", href: "/servicios" },
  { name: "Al por mayor", href: "/mayorista" },
  { name: "Contacto", href: "/contacto" },
];

const socialLinkClass =
  "flex size-9 items-center justify-center rounded-md bg-white/10 hover:bg-white/20";

export function Footer({
  settings,
  categories,
}: {
  settings: SiteSettings;
  categories: Category[];
}) {
  return (
    <footer className="bg-ink text-surface">
      <Container className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <h2 className="mb-4 text-sm font-semibold tracking-wide uppercase">Categorías</h2>
          <ul className="space-y-2.5 text-sm text-white/70">
            {categories.map((category) => (
              <li key={category.slug}>
                <Link href={`/tienda/${category.slug}`} className="hover:text-white">
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="mb-4 text-sm font-semibold tracking-wide uppercase">Información</h2>
          <ul className="space-y-2.5 text-sm text-white/70">
            {infoLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-white">
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="mb-4 text-sm font-semibold tracking-wide uppercase">Contacto</h2>
          <ul className="space-y-3 text-sm text-white/70">
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span>{settings.address}</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="size-4 shrink-0" aria-hidden="true" />
              <a href={`tel:+${settings.whatsappNumber}`} className="hover:text-white">
                {settings.phoneDisplay}
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="size-4 shrink-0" aria-hidden="true" />
              <a href={`mailto:${settings.email}`} className="hover:text-white">
                {settings.email}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="mb-4 text-sm font-semibold tracking-wide uppercase">Síguenos</h2>
          <div className="flex gap-3">
            <a
              href={settings.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram de Raymond Unlock"
              className={socialLinkClass}
            >
              <InstagramIcon className="size-4" />
            </a>
            <a
              href={settings.threadsUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Threads de Raymond Unlock"
              className={socialLinkClass}
            >
              <ThreadsIcon className="size-4" />
            </a>
          </div>
        </div>
      </Container>

      <div className="border-t border-white/10">
        <Container className="flex flex-col items-center justify-between gap-2 py-5 text-xs text-white/60 sm:flex-row">
          <p>© {new Date().getFullYear()} Raymond Unlock. Todos los derechos reservados.</p>
          <p>Santo Domingo, Distrito Nacional, República Dominicana</p>
        </Container>
      </div>
    </footer>
  );
}
