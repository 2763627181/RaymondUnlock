import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function SectionHeading({
  title,
  description,
  action,
  tone = "light",
  className,
}: {
  title: string;
  description?: string;
  action?: { label: string; href: string };
  tone?: "light" | "dark";
  className?: string;
}) {
  return (
    <div className={cn("mb-8 flex items-end justify-between gap-4", className)}>
      <div className="max-w-xl">
        <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{title}</h2>
        {description ? (
          <p
            className={cn(
              "mt-2 text-[15px] leading-relaxed",
              tone === "dark" ? "text-white/70" : "text-muted-foreground",
            )}
          >
            {description}
          </p>
        ) : null}
      </div>
      {action ? (
        <Link
          href={action.href}
          className={cn(
            "group hidden shrink-0 items-center gap-1.5 text-sm font-medium sm:flex",
            tone === "dark" ? "text-white hover:text-white/80" : "text-brand-blue hover:underline",
          )}
        >
          {action.label}
          <ArrowRight
            className="size-4 transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </Link>
      ) : null}
    </div>
  );
}
