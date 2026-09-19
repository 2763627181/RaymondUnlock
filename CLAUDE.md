@AGENTS.md

# Raymond Unlock

Tienda de celulares, electrónicos y servicios técnicos en Santo Domingo (RD). Catálogo público con precio al por mayor protegido, cotización por WhatsApp/correo, portal de mayoristas y panel de administración. Todo el texto visible va en español dominicano (es-DO); moneda DOP (`RD$`).

Cada carpeta principal tiene su propio `CLAUDE.md` con las reglas de ese módulo: `app/`, `app/admin/`, `components/`, `lib/`, `supabase/`. Léelo antes de tocar esa zona.

## Comandos

- `pnpm dev` / `pnpm build` / `pnpm start` — Next 16 con Turbopack. Sin base de datos configurada las páginas fallan al arrancar (ver `.env.example`).
- `pnpm typecheck && pnpm lint && pnpm test && pnpm format:check` — se corren antes de cada commit; husky + lint-staged ya pasan ESLint y Prettier sobre lo que está en stage.
- `pnpm exec next typegen` — regenerar `PageProps`/`LayoutProps` tras crear o mover rutas (si `tsc` se queja de `PageProps<"/...">`, es esto). Si quedan tipos viejos: `rm -rf .next/dev/types` primero.
- Migraciones: `npx supabase db push --db-url "$SUPABASE_DB_URL"`. Tipos de la base: `types/database.ts` (ver `supabase/CLAUDE.md`).

## Stack y versiones que importan

Next 16.3 (App Router, `proxy.ts` en vez de `middleware.ts`), React 19, TypeScript 5.9 estricto, Tailwind 4, shadcn/ui sobre Radix, Motion (`motion/react`) para TODA animación, Zustand, Zod 4, React Hook Form, Supabase, Resend, Vitest. **No agregar librerías fuera de esta lista sin preguntar.**

- ESLint está fijado en 9.39.5 y TypeScript en 5.9.3 a propósito (ver README, "Decisiones técnicas"): no subirlos a la última mayor sin comprobar `eslint-config-next` y `typescript-eslint`.
- Next 16 cambió APIs respecto a lo que se conoce: `params`/`searchParams`/`cookies()` son asíncronos, `revalidateTag` pide un segundo argumento, hay `updateTag`. Lee `node_modules/next/dist/docs/` antes de usar una API dudosa (lo exige AGENTS.md).

## Reglas que no se rompen

1. **El precio al por mayor no sale del servidor.** `product_variants` está cerrada a `anon` y `authenticated`; el público lee las vistas `v_catalog_*`. Solo `getViewerSnapshot` (mayorista aprobado o admin) y `getPricingRows` lo leen, con `service_role`. Nunca lo pongas en HTML estático, RSC de páginas públicas ni en un tipo público (`CatalogVariant` no lo tiene a propósito).
2. **Los precios del carrito son solo para mostrar.** `submitQuote` valida con Zod y vuelve a leer todo en el servidor según el tier real de la sesión.
3. **Secretos**: `SUPABASE_SERVICE_ROLE_KEY` y `RESEND_API_KEY` jamás en un archivo `"use client"` ni con prefijo `NEXT_PUBLIC_`. `.env.local` nunca se commitea.
4. **Todo input pasa por Zod en el servidor**, aunque el formulario ya lo haya validado.
5. **Sin `any`, `@ts-ignore` ni `!`.** Para datos externos (jsonb, filas de vistas) se valida con Zod en vez de castear.
6. Un componente por archivo, idealmente ≤ 200 líneas. Comentarios solo para el "por qué". Nada de código muerto ni archivos de ejemplo.
7. Cambios por commits pequeños con Conventional Commits, en español y sin acentos en el asunto (`feat: …`, `fix: …`, `docs: …`).

## Verificar de verdad

Lint, tipos y build no prueban que algo funcione. Para cambios de interfaz o de flujo: levantar el servidor, usarlo en un navegador real y revisar 375 px y 1440 px, consola sin errores y que no haya scroll horizontal. Las pruebas de seguridad de base de datos se hacen con peticiones reales como visitante, cliente y admin (ver `supabase/CLAUDE.md`).
