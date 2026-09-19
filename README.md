# Raymond Unlock

Sitio web de Raymond Unlock — celulares, tablets, audio, smartwatches, accesorios y servicios técnicos en Santo Domingo, República Dominicana. Catálogo público con precio de mayorista protegido en servidor, cotización por WhatsApp/correo y (próximamente) panel de administración.

## Estado del proyecto

| Fase | Contenido                                               | Estado                           |
| ---- | ------------------------------------------------------- | -------------------------------- |
| 0    | Scaffold, tooling, estructura                           | Hecha                            |
| 1    | Design system, motion, Header/MegaMenu/Footer/MobileBar | Hecha                            |
| 2    | Supabase: migraciones, RLS, vistas, seed                | **Pendiente (es lo siguiente)**  |
| 3    | Home                                                    | Hecha (con capa de datos mock)   |
| 4    | Catálogo con filtros en URL                             | Hecha (con capa de datos mock)   |
| 5    | Detalle de producto                                     | Hecha (con capa de datos mock)   |
| 6    | Carrito y cotización                                    | Hecha salvo persistencia en BD   |
| 7    | Servicios y solicitudes de reparación                   | Hecha salvo persistencia en BD   |
| 8    | Auth + portal mayorista                                 | Pendiente (depende de la Fase 2) |
| 9    | Panel admin                                             | Pendiente (depende de la Fase 2) |
| 10   | Pasada final                                            | Parcial (ver "Rendimiento")      |

Se construyeron las fases 3–7 antes de la base de datos: todas leen a través de `lib/data/index.ts`, que hoy apunta a una implementación mock en `lib/data/mock/`. En la Fase 2 se cambia solo esa implementación por Supabase; las páginas no se tocan.

## Stack

- **Next.js 16** (App Router, React Server Components), **React 19**, **TypeScript 5.9** estricto
- **Tailwind CSS v4** (tokens en `app/globals.css`), **shadcn/ui** sobre Radix
- **Motion** (`motion/react`, con `LazyMotion` asíncrono) para todas las animaciones
- **Zustand** (`persist`) para el carrito, **Zod + React Hook Form** para formularios
- **Supabase** (Fase 2), **Resend** para correo, **Vitest** para la lógica de precios/carrito
- **pnpm**; deploy objetivo **Vercel**

## Requisitos e instalación

- Node.js `>= 20.9.0` (ver `.nvmrc`), pnpm `11.3.0`

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

## Variables de entorno

Ver `.env.example`. Ninguna variable sin prefijo `NEXT_PUBLIC_` puede usarse en un archivo `"use client"`.

| Variable                                                     | Uso                                                 |
| ------------------------------------------------------------ | --------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`                                       | metadata, JSON-LD, sitemap, OG (sin slash final)    |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | cliente Supabase (Fase 2)                           |
| `SUPABASE_SERVICE_ROLE_KEY`                                  | solo servidor (Fase 2)                              |
| `RESEND_API_KEY`                                             | envío de correos de cotización y reparación         |
| `RESEND_FROM_EMAIL`                                          | remitente; ver nota abajo                           |
| `ORDER_NOTIFICATION_EMAIL`                                   | correo del negocio que recibe cada solicitud        |
| `NEXT_PUBLIC_WHATSAPP_NUMBER`                                | WhatsApp del negocio, formato internacional sin `+` |
| `NEXT_PUBLIC_BUSINESS_EMAIL` / `NEXT_PUBLIC_INSTAGRAM_URL`   | footer y contacto                                   |

**Correo con Resend:** con el remitente de prueba (`onboarding@resend.dev`) Resend solo entrega al correo dueño de la cuenta. Para escribirle a clientes hay que verificar un dominio en Resend y usar un remitente de ese dominio en `RESEND_FROM_EMAIL`. Sin `RESEND_API_KEY` el flujo de cotización funciona por WhatsApp y el canal correo informa el fallo al cliente en vez de fingir éxito.

## Scripts

| Script                              | Qué hace                                                    |
| ----------------------------------- | ----------------------------------------------------------- |
| `pnpm dev` / `pnpm build`           | Desarrollo / build de producción (Turbopack)                |
| `pnpm lint` / `pnpm lint:fix`       | ESLint (flat config)                                        |
| `pnpm format` / `pnpm format:check` | Prettier                                                    |
| `pnpm typecheck`                    | `tsc --noEmit`                                              |
| `pnpm test` / `pnpm test:watch`     | Vitest (41 pruebas: precios, WhatsApp, variantes, teléfono) |
| `pnpm analyze`                      | Build con `@next/bundle-analyzer`                           |

Un hook de pre-commit (husky + lint-staged) corre ESLint y Prettier sobre los archivos en stage.

## Datos y contenido de ejemplo (reemplazar antes de publicar)

Todo esto es ficticio o provisional y vive en `lib/data/mock/` (en la Fase 2 pasa al seed de Supabase y se edita desde `/admin`):

- **Precios, stock, tiempos y precios "desde" de servicios**: inventados para poder probar el sitio.
- **Precio mayorista**: derivado (10 % menos que la unidad, redondeado); solo existe en módulos `server-only`.
- **Testimonios**: 3 textos de ejemplo con nombres genéricos. **No publicar tal cual**: reemplazar por opiniones reales.
- **Textos de garantías, "por qué nosotros" y proceso de reparación**: propuestas a confirmar con el cliente.
- **Imágenes**: los productos usan una ilustración de respaldo teñida con el color de la variante; el hero usa 3 ilustraciones de ejemplo (`public/seed/`). Las fotos reales se suben desde `/admin` (Fase 9). Un producto de ejemplo (iPhone 15 Pro) trae 2 imágenes para probar la galería.

## Pendiente del cliente

- **Logo** con fondo transparente o SVG (solo existe el PNG con fondo blanco). Mientras tanto: wordmark tipográfico en `components/layout/logo.tsx` y monograma "RU" provisional en `app/icon.tsx`, `app/apple-icon.tsx` y `app/manifest.ts`.
- **URL de la página de Facebook** (el brief solo da el nombre; la URL no se puede derivar). Instagram y Threads sí están enlazados.
- **Horarios de atención**, sucursales adicionales y **métodos de pago**: no están en el brief, no se inventaron.
- **Newsletter**: el modelo de datos del brief no tiene tabla de suscriptores, así que no se construyó el formulario. Decidir si se agrega.
- **"Más vendidos"** usa `is_featured` porque el esquema no registra ventas (las cotizaciones no son ventas confirmadas).

## Decisiones técnicas (y por qué)

**Versiones**

- **ESLint fijado en 9.39.5**: `eslint-plugin-react` (vía `eslint-config-next`) usa `context.getFilename()`, que ESLint 10 eliminó; con la 10 el lint falla en ejecución.
- **TypeScript en 5.9.3, no 7.x**: `typescript-eslint` aún soporta solo `<6.1.0`.
- **Sin `sonner`, `vaul` ni `embla-carousel-react`**: Toast, bottom-sheet y carruseles se hicieron con Radix + Motion + `scroll-snap`.

**Next 16**

- **Sin Cache Components**: el brief pide el modelo clásico (`revalidate`, `generateStaticParams`), que sigue soportado.
- **`middleware.ts` será `proxy.ts`** (Fase 8/9): Next 16 renombró el archivo y la función.
- **Producto, servicios, home, contacto y nosotros** son estáticos con ISR de 5 min. **`/tienda` y `/tienda/[category]` son dinámicas**: leen `searchParams` (filtros en la URL, requisito del brief). En la Fase 2 la consulta se cachea con `unstable_cache`/tags para compensar.
- **Transición tarjeta → detalle con `<ViewTransition>`** de React, no con `layoutId` de Motion: entre rutas del App Router `layoutId` no es fiable, y `ViewTransition` es la vía soportada (se desactiva con `prefers-reduced-motion`).
- **`loading.tsx` solo en el listado principal**: en `[category]` producía un soft 404 (200 en lugar de 404 al hacer streaming antes de `notFound()`).

**Precios y seguridad**

- El precio que viaja en el carrito es solo para mostrar. El Server Action `submitQuote` valida con Zod, vuelve a leer los precios desde la capa de datos según el tier real del visitante (`lib/pricing/viewer.ts`) y rechaza variantes inexistentes o agotadas. Verificado: un precio manipulado a RD$ 1 en `localStorage` se recalcula a su valor real.
- El precio mayorista aplica solo a mayoristas aprobados **y** cuando la cantidad alcanza `min_wholesale_qty`; por debajo se cobra precio de unidad (`lib/cart/pricing.ts`, con pruebas).
- Formularios públicos con campo trampa (`additionalInfo`) contra bots y todo texto del cliente escapado en los correos.
- El código de cotización/reparación es correlativo (`RU-2026-0001`, `RE-2026-0001`); por eso `/carrito/enviado` **no** muestra datos a partir del código (sería enumerable): los detalles viven solo en `sessionStorage` de esa pestaña.
- **Persistencia y códigos**: hoy el contador es en memoria (`lib/data/mock/requests.ts`). En la Fase 2 pasa a una secuencia de Postgres y se insertan `quotes`/`quote_items`/`repair_requests`.

**Accesibilidad**

- `--muted-foreground` es `#5b6270` (no `#6b7280` del brief: daba 4.47:1 sobre `surface-2`) y el texto verde usa `--color-success-700`. El rojo `#E11B22` da 4.8:1 sobre blanco, suficiente para texto de 14 px en peso 600.
- Animaciones: todo pasa por `lib/motion.ts` y respeta `prefers-reduced-motion`.

## Rendimiento (medido, build de producción, móvil)

Lighthouse (throttling simulado, esta máquina de desarrollo):

| Página    | Perf  | A11y | Best Practices | SEO |
| --------- | ----- | ---- | -------------- | --- |
| Home      | 83–86 | 100  | 100            | 100 |
| Tienda    | 89    | 100  | 100            | 100 |
| Producto  | 92    | 100  | 100            | 100 |
| Servicios | 91    | 100  | 100            | 100 |

`/carrito` marca SEO 63 porque es `noindex` a propósito. **Experiencia real** (Chrome con 4G lenta y CPU 4× más lenta): LCP de 1.1 a 1.5 s en todas las páginas, CLS 0. El objetivo del brief (Perf ≥ 92) se cumple en producto y queda cerca en las demás; la home es la más pesada por la cantidad de componentes interactivos. Las cifras deben repetirse sobre el deploy real en Vercel (CDN y compresión Brotli), donde suelen mejorar.

## Despliegue (Vercel)

Pendiente de documentar en la Fase 10 con los pasos concretos (variables de entorno, dominio, remitente de Resend).
