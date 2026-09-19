import type { ReactNode } from "react";

export function AuthCard({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="bg-surface border-border w-full max-w-md rounded-2xl border p-6 shadow-sm sm:p-8">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      {description ? (
        <p className="text-muted-foreground mt-2 text-[15px] leading-relaxed">{description}</p>
      ) : null}
      <div className="mt-6">{children}</div>
      {footer ? (
        <div className="text-muted-foreground border-border mt-6 border-t pt-5 text-center text-sm">
          {footer}
        </div>
      ) : null}
    </div>
  );
}
