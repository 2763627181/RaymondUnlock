import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd } from "@/lib/seo";

export interface Crumb {
  name: string;
  path: string;
}

export function Breadcrumbs({
  items,
  tone = "light",
}: {
  items: Crumb[];
  /** "dark" cuando va sobre un fondo oscuro (el gris normal daría 3:1 de contraste). */
  tone?: "light" | "dark";
}) {
  const dark = tone === "dark";
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(items)} />
      <nav aria-label="Ruta de navegación" className="mb-4">
        <ol
          className={`flex flex-wrap items-center gap-1.5 text-[13px] ${dark ? "text-white/75" : "text-muted-foreground"}`}
        >
          {items.map((item, index) => {
            const last = index === items.length - 1;
            return (
              <li key={item.path} className="flex items-center gap-1.5">
                {last ? (
                  <span
                    aria-current="page"
                    className={`font-medium ${dark ? "text-white" : "text-foreground"}`}
                  >
                    {item.name}
                  </span>
                ) : (
                  <>
                    <Link
                      href={item.path}
                      className={`hover:underline ${dark ? "hover:text-white" : "hover:text-foreground"}`}
                    >
                      {item.name}
                    </Link>
                    <ChevronRight className="size-3.5" aria-hidden="true" />
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
