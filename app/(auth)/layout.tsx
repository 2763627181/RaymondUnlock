import Link from "next/link";
import { Container } from "@/components/layout/container";
import { Logo } from "@/components/layout/logo";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="bg-surface-2 flex min-h-dvh flex-col">
      <header className="bg-surface border-border border-b py-5">
        <Container>
          <Logo />
        </Container>
      </header>
      <main
        id="contenido"
        className="flex flex-1 items-start justify-center px-4 pb-16 sm:items-center"
      >
        {children}
      </main>
      <footer className="text-muted-foreground py-6 text-center text-sm">
        <Link href="/" className="hover:text-foreground underline-offset-4 hover:underline">
          ← Volver a la tienda
        </Link>
      </footer>
    </div>
  );
}
