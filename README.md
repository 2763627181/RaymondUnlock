# Raymond Unlock

Sitio web de Raymond Unlock — celulares, tablets, audio, smartwatches, accesorios y servicios técnicos en Santo Domingo, República Dominicana. Catálogo público con precio de mayorista protegido en servidor, cotización por WhatsApp/correo, y panel de administración completo.

## Stack

- **Next.js 16** (App Router, React Server Components)
- **React 19**
- **TypeScript 5.9** en modo `strict`
- **Tailwind CSS v4** (tokens en `app/globals.css` vía `@theme`)
- **shadcn/ui** sobre Radix (`components.json`, preset Nova)
- **Framer Motion** (paquete `motion`) para animaciones
- **Zustand** (con `persist`) para el carrito
- **Zod + React Hook Form** para formularios
- **Supabase** (Postgres + Auth + Storage + RLS)
- **Resend** para correos transaccionales
- **Vitest** para lógica de precios/carrito
- **pnpm** como package manager
- Deploy objetivo: **Vercel**

## Requisitos

- Node.js `>= 20.9.0` (ver `.nvmrc`)
- pnpm `11.3.0` (`corepack enable` lo resuelve automáticamente vía `packageManager` en `package.json`)

## Instalación

```bash
pnpm install
cp .env.example .env.local
# completar las variables en .env.local (ver tabla abajo)
pnpm dev
```

## Variables de entorno

Ver `.env.example`. Ninguna variable sin prefijo `NEXT_PUBLIC_` puede usarse en un archivo `"use client"` — en particular `SUPABASE_SERVICE_ROLE_KEY` y `RESEND_API_KEY` solo se leen desde Server Components, Server Actions o Route Handlers.

| Variable                                                     | Dónde se usa                          | Notas                         |
| ------------------------------------------------------------ | ------------------------------------- | ----------------------------- |
| `NEXT_PUBLIC_SITE_URL`                                       | metadata, JSON-LD, sitemap            | Sin slash final               |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | cliente Supabase (browser)            | Se agregan en la Fase 2       |
| `SUPABASE_SERVICE_ROLE_KEY`                                  | cliente Supabase (servidor, admin)    | Nunca en el cliente           |
| `RESEND_API_KEY` / `ORDER_NOTIFICATION_EMAIL`                | envío de cotizaciones/reparaciones    | Fase 6                        |
| `NEXT_PUBLIC_WHATSAPP_NUMBER`                                | botón flotante, mensaje de cotización | Formato internacional sin `+` |
| `NEXT_PUBLIC_BUSINESS_EMAIL` / `NEXT_PUBLIC_INSTAGRAM_URL`   | footer, contacto                      |                               |

## Scripts

| Script                              | Qué hace                                     |
| ----------------------------------- | -------------------------------------------- |
| `pnpm dev`                          | Servidor de desarrollo (Turbopack)           |
| `pnpm build`                        | Build de producción                          |
| `pnpm start`                        | Sirve el build de producción                 |
| `pnpm lint` / `pnpm lint:fix`       | ESLint (flat config)                         |
| `pnpm format` / `pnpm format:check` | Prettier (con `prettier-plugin-tailwindcss`) |
| `pnpm typecheck`                    | `tsc --noEmit`                               |
| `pnpm test` / `pnpm test:watch`     | Vitest                                       |
| `pnpm analyze`                      | Build con `@next/bundle-analyzer` habilitado |

Un hook de pre-commit (husky + lint-staged) corre ESLint y Prettier sobre los archivos en stage.

## Datos pendientes del cliente

Estos datos no se inventaron — quedan como placeholder hasta que el dueño del negocio los confirme, y se cargan desde `site_settings` (Fase 2) para no quedar hardcodeados:

- **Logo transparente**: solo existe el PNG con fondo blanco. Falta la versión con fondo transparente (o el SVG original) para usarlo sobre fondos oscuros (hero, footer). Mientras tanto se usa un contenedor blanco redondeado detrás del logo en esas zonas.
- Horarios de atención, sucursales adicionales (si las hay) y métodos de pago aceptados — no estaban en el brief.

## Decisiones técnicas de la Fase 0 (y por qué)

- **ESLint fijado en `9.39.5`, no en la última `10.x`.** `eslint-plugin-react` (dependencia de `eslint-config-next`) todavía llama a una API (`context.getFilename()`) que ESLint 10 eliminó; con ESLint 10 el lint falla en tiempo de ejecución. Se revisará este pin cuando el ecosistema de `eslint-config-next` publique soporte para ESLint 10.
- **TypeScript fijado en `5.9.3`, no en `7.x`.** TypeScript 7 (el compilador nativo) ya es estable en npm, pero `typescript-eslint` todavía no lo soporta (`peerDependency: <6.1.0`). Se reevalúa cuando typescript-eslint publique soporte.
- **Sin Cache Components (`cacheComponents`) de Next 16.** Next 16 introdujo un modelo de caché nuevo basado en `"use cache"` + Suspense obligatorio. Este proyecto usa el modelo clásico (`export const revalidate`, `revalidatePath`, `generateStaticParams`) tal como lo pide el brief; es la opción por defecto (no hay que activar ninguna bandera) y sigue totalmente soportada en Next 16.
- **`middleware.ts` se implementará como `proxy.ts`** en la Fase 8/9 (protección de `/admin`). Next 16 renombró el archivo y la función exportada (`middleware` → `proxy`); es un cambio de nombre, el comportamiento de protección de rutas es el mismo.
- **Sin `sonner`, `vaul` ni `embla-carousel-react`.** Toast, bottom-sheet de filtros y carruseles se construyen con primitivos Radix (ya incluidos vía shadcn/ui) + Framer Motion + `scroll-snap` nativo, para no sumar dependencias fuera de la lista aprobada.
- **Fuente Geist vía `next/font/google`** (no el paquete `geist` separado): así lo resuelve el preset "Nova" de shadcn de forma nativa, sin dependencia extra.

## Estructura

Ver el árbol completo de rutas y carpetas planeado en la especificación del proyecto. Cada fase agrega solo los archivos que le corresponden — no hay páginas ni componentes placeholder de fases futuras.

## Supabase (Fase 2 en adelante)

Las migraciones viven en `supabase/migrations/` y el seed de datos ficticios en `supabase/seed.sql`. Los precios y el stock del seed son inventados — se reemplazan desde el panel `/admin` una vez el negocio tiene su propio catálogo cargado.

## Despliegue (Vercel)

Pendiente de documentar en la Fase 10 con los pasos concretos (variables de entorno en el dashboard de Vercel, dominio, ISR/caché).
