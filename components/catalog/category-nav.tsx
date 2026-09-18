import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Category } from "@/types/catalog";

export function CategoryNav({
  categories,
  activeSlug,
}: {
  categories: Category[];
  activeSlug: string | null;
}) {
  const topLevel = categories.filter((category) => category.parentId === null);
  const linkClass = (active: boolean) =>
    cn(
      "block rounded-md px-2 py-1.5 text-sm transition-colors",
      active ? "bg-surface-2 font-semibold" : "text-ink-700 hover:bg-surface-2",
    );

  return (
    <nav aria-label="Categorías" className="border-border border-b pb-5">
      <p className="mb-3 text-sm font-semibold">Categoría</p>
      <ul className="-mx-2 space-y-0.5">
        <li>
          <Link
            href="/tienda"
            aria-current={activeSlug === null ? "page" : undefined}
            className={linkClass(activeSlug === null)}
          >
            Todas
          </Link>
        </li>
        {topLevel.map((category) => {
          const children = categories.filter((child) => child.parentId === category.id);
          const open =
            activeSlug === category.slug || children.some((child) => child.slug === activeSlug);
          return (
            <li key={category.id}>
              <Link
                href={`/tienda/${category.slug}`}
                aria-current={activeSlug === category.slug ? "page" : undefined}
                className={linkClass(activeSlug === category.slug)}
              >
                {category.name}
              </Link>
              {open && children.length > 0 ? (
                <ul className="mt-0.5 ml-3 space-y-0.5">
                  {children.map((child) => (
                    <li key={child.id}>
                      <Link
                        href={`/tienda/${child.slug}`}
                        aria-current={activeSlug === child.slug ? "page" : undefined}
                        className={linkClass(activeSlug === child.slug)}
                      >
                        {child.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
