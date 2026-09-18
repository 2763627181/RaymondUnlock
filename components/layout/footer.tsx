import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { Container } from "@/components/layout/container";
import { InstagramIcon, ThreadsIcon } from "@/components/icons/social-icons";
import { navCategories } from "@/lib/nav-data";

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "18099063114";
const BUSINESS_EMAIL = process.env.NEXT_PUBLIC_BUSINESS_EMAIL ?? "Raymondunlock01@gmail.com";
const INSTAGRAM_URL =
  process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? "https://www.instagram.com/raymondunlock_/";
// Threads: se arma a partir del @handle dado en el brief (raymondunlock_).
const THREADS_URL = "https://www.threads.net/@raymondunlock_";
const ADDRESS = "Calle México #6, casi esq. Isabel Aguiar, Santo Domingo, RD, 11005";

const infoLinks = [
  { name: "Nosotros", href: "/nosotros" },
  { name: "Servicios técnicos", href: "/servicios" },
  { name: "Al por mayor", href: "/mayorista" },
  { name: "Contacto", href: "/contacto" },
];

export function Footer() {
  return (
    <footer className="bg-ink text-surface">
      <Container className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <h2 className="mb-4 text-sm font-semibold tracking-wide uppercase">Categorías</h2>
          <ul className="space-y-2.5 text-sm text-white/70">
            {navCategories.map((category) => (
              <li key={category.slug}>
                <Link href={category.href} className="hover:text-white">
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
              <span>{ADDRESS}</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="size-4 shrink-0" aria-hidden="true" />
              <a href={`tel:+${WHATSAPP_NUMBER}`} className="hover:text-white">
                809-906-3114
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="size-4 shrink-0" aria-hidden="true" />
              <a href={`mailto:${BUSINESS_EMAIL}`} className="hover:text-white">
                {BUSINESS_EMAIL}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="mb-4 text-sm font-semibold tracking-wide uppercase">Síguenos</h2>
          <div className="flex gap-3">
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram de Raymond Unlock"
              className="flex size-9 items-center justify-center rounded-md bg-white/10 hover:bg-white/20"
            >
              <InstagramIcon className="size-4" />
            </a>
            <a
              href={THREADS_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Threads de Raymond Unlock"
              className="flex size-9 items-center justify-center rounded-md bg-white/10 hover:bg-white/20"
            >
              <ThreadsIcon className="size-4" />
            </a>
            {/* Facebook: el brief solo da el nombre de la página ("Raymond Unlock"),
                no la URL. Pendiente del cliente — ver README. */}
          </div>
        </div>
      </Container>

      <div className="border-t border-white/10">
        <Container className="flex flex-col items-center justify-between gap-2 py-5 text-xs text-white/50 sm:flex-row">
          <p>© {new Date().getFullYear()} Raymond Unlock. Todos los derechos reservados.</p>
          <p>Santo Domingo, República Dominicana</p>
        </Container>
      </div>
    </footer>
  );
}
