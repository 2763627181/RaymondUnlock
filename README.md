# Raymond Unlock

Sitio web de Raymond Unlock — celulares, tablets, audio, smartwatches, accesorios y servicios técnicos en Santo Domingo, República Dominicana. Catálogo público con precio de mayorista protegido en servidor, cotización por WhatsApp/correo y (próximamente) panel de administración.

## Estado del proyecto

| Fase | Contenido                                               | Estado                          |
| ---- | ------------------------------------------------------- | ------------------------------- |
| 0    | Scaffold, tooling, estructura                           | Hecha                           |
| 1    | Design system, motion, Header/MegaMenu/Footer/MobileBar | Hecha                           |
| 2    | Supabase: migraciones, RLS, vistas, seed                | Hecha                           |
| 3    | Home                                                    | Hecha                           |
| 4    | Catálogo con filtros en URL                             | Hecha                           |
| 5    | Detalle de producto                                     | Hecha                           |
| 6    | Carrito y cotización                                    | Hecha (se guarda en la BD)      |
| 7    | Servicios y solicitudes de reparación                   | Hecha (se guarda en la BD)      |
| 8    | Auth + portal mayorista                                 | **Pendiente (es lo siguiente)** |
| 9    | Panel admin                                             | Pendiente                       |
| 10   | Pasada final                                            | Parcial (ver "Rendimiento")     |

Las fases 3–7 se construyeron primero sobre datos de prueba y en la Fase 2 se conectaron a Supabase cambiando solo `lib/data/`: las páginas no se tocaron. Todas leen a través de `lib/data/index.ts`.

## Stack

- **Next.js 16** (App Router, React Server Components), **React 19**, **TypeScript 5.9** estricto
- **Tailwind CSS v4** (tokens en `app/globals.css`), **shadcn/ui** sobre Radix
- **Motion** (`motion/react`, con `LazyMotion` asíncrono) para todas las animaciones
- **Zustand** (`persist`) para el carrito, **Zod + React Hook Form** para formularios
- **Supabase** (Postgres, RLS, Storage), **Resend** para correo, **Vitest** para precios, catálogo y carrito
- **pnpm**; deploy objetivo **Vercel**

## Requisitos e instalación

- Node.js `>= 20.9.0` (ver `.nvmrc`), pnpm `11.3.0`

```bash
pnpm install
cp .env.example .env.local   # completar las variables (ver abajo)
# crear la base de datos: ver "Base de datos (Supabase)"
pnpm dev
```

El sitio necesita una base de datos con las migraciones y el seed aplicados: sin ella, cualquier página que lea datos falla al arrancar.

## Variables de entorno

Ver `.env.example`. Ninguna variable sin prefijo `NEXT_PUBLIC_` puede usarse en un archivo `"use client"`.

| Variable                                                     | Uso                                                               |
| ------------------------------------------------------------ | ----------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`                                       | metadata, JSON-LD, sitemap, OG (sin slash final)                  |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | lecturas públicas (RLS) y configuración de `next/image`           |
| `SUPABASE_SERVICE_ROLE_KEY`                                  | **solo servidor**: precios mayoristas, guardar solicitudes, admin |
| `SUPABASE_DB_URL`                                            | solo para aplicar migraciones desde tu máquina; la app no la lee  |
| `RESEND_API_KEY`                                             | envío de correos de cotización y reparación                       |
| `RESEND_FROM_EMAIL`                                          | remitente; ver nota abajo                                         |
| `ORDER_NOTIFICATION_EMAIL`                                   | correo del negocio que recibe cada solicitud                      |

Los datos de contacto (WhatsApp, correo, redes, dirección) ya no son variables de entorno: viven en la tabla `site_settings` y se editarán desde `/admin/ajustes` (Fase 9).

**Correo con Resend:** con el remitente de prueba (`onboarding@resend.dev`) Resend solo entrega al correo dueño de la cuenta. Para escribirle a clientes hay que verificar un dominio en Resend y usar un remitente de ese dominio en `RESEND_FROM_EMAIL`. Sin `RESEND_API_KEY` el flujo de cotización funciona por WhatsApp y el canal correo informa el fallo al cliente en vez de fingir éxito.

## Base de datos (Supabase)

El esquema y la seguridad viven en `supabase/migrations/` (`..._schema.sql` y `..._security.sql`); `supabase/seed.sql` carga el catálogo de ejemplo.

Para crear una base nueva:

1. Crear un proyecto en Supabase y copiar a `.env.local` la URL, la llave `anon`, la `service_role` (Project Settings → API) y el connection string del **Session pooler** (Connect). La conexión directa (`db.<ref>.supabase.co`) es solo IPv6 y falla en muchas redes.
2. Aplicar las migraciones: `npx supabase db push --db-url "$SUPABASE_DB_URL"`.
3. Cargar los datos de ejemplo: ejecutar `supabase/seed.sql` en el SQL Editor del dashboard (o con `psql`). Es idempotente (`on conflict do nothing`): no pisa lo que ya se editó.
4. Crear el primer admin: crear el usuario en Authentication → Users y ejecutar `update public.profiles set role = 'admin' where email = 'correo@del.admin';`. Desde la aplicación nadie puede otorgarse ese rol.

Si cambias el esquema, regenera `types/database.ts` con `npx supabase gen types typescript --db-url "$SUPABASE_DB_URL" --schema public` (requiere Docker Desktop). Sin Docker se puede correr `@supabase/postgres-meta` en modo CLI con `PG_META_GENERATE_TYPES=typescript`, que produce el mismo archivo.

**Modelo de seguridad**

- RLS activo en las 13 tablas. Supabase concede todos los permisos por defecto a cualquier objeto nuevo, así que las migraciones revocan todo a `anon` y `authenticated` y otorgan solo lo mínimo (incluidas las vistas y las funciones).
- **Precio mayorista**: `product_variants` está cerrada a `anon` y `authenticated` (ni un admin la lee por la API). El público lee las vistas `v_catalog_*`, que no tienen `price_wholesale` ni `min_wholesale_qty`; el servidor lee la tabla con `service_role` solo para recalcular cotizaciones. Las vistas corren con los permisos de su dueño (`security_invoker = false`) a propósito, para exponer un subconjunto de columnas; el asesor de Supabase las marcará como "Security Definer View" y es lo esperado.
- **Solicitudes** (`quotes`, `quote_items`, `repair_requests`): nadie inserta desde la API pública; las guarda el servidor, después de validar con Zod y recalcular precios, con `service_role`. Solo un admin puede leerlas, editarlas o borrarlas. Los códigos (`RU-2026-0001`) salen de una función atómica que solo puede ejecutar `service_role`.
- **Roles**: el trigger que crea el perfil nunca lee el rol del metadata; quien pide cuenta mayorista queda **sin aprobar** hasta que un admin la apruebe, y `profiles` solo permite editar `full_name`, `phone`, `business_name` y `rnc`.
- **Storage**: el bucket `products` se lee públicamente y solo escribe un admin (imágenes de hasta 5 MB). Las URLs públicas se cachean en el CDN de Supabase: al reemplazar una foto, sube un archivo con nombre nuevo en vez de sobrescribir.

Verificado contra el proyecto real, con peticiones REST como visitante anónimo y con usuarios reales de prueba (creados y borrados en la misma corrida): el anónimo no puede leer `price_wholesale` ni `product_variants`, ni escribir en ninguna tabla, vista o RPC interno; un usuario común no puede subirse el rol, auto-aprobarse como mayorista, editar catálogo ni subir a Storage; un admin sí puede crear y editar catálogo y subir imágenes. Ninguna llave secreta ni dato mayorista aparece en los bundles del navegador ni en el HTML prerenderizado.

**Caché del catálogo**: las lecturas públicas van por un snapshot cacheado 5 minutos (`unstable_cache`, etiqueta `catalog`); un cambio en la base tarda hasta 5 minutos en verse o hasta que el admin invalide la etiqueta. PostgREST devuelve como máximo 1000 filas por consulta: si el catálogo se acerca a ese tamaño el sitio falla con un mensaje explícito (en vez de ocultar productos en silencio) y toca mover el filtrado de `/tienda` a SQL.

## Scripts

| Script                              | Qué hace                                                   |
| ----------------------------------- | ---------------------------------------------------------- |
| `pnpm dev` / `pnpm build`           | Desarrollo / build de producción (Turbopack)               |
| `pnpm lint` / `pnpm lint:fix`       | ESLint (flat config)                                       |
| `pnpm format` / `pnpm format:check` | Prettier                                                   |
| `pnpm typecheck`                    | `tsc --noEmit`                                             |
| `pnpm test` / `pnpm test:watch`     | Vitest (58 pruebas: precios, catálogo, WhatsApp, teléfono) |
| `pnpm analyze`                      | Build con `@next/bundle-analyzer`                          |

Un hook de pre-commit (husky + lint-staged) corre ESLint y Prettier sobre los archivos en stage.

## Datos y contenido de ejemplo (reemplazar antes de publicar)

Todo esto es ficticio o provisional y vive en `supabase/seed.sql` (se edita desde `/admin` cuando esté la Fase 9, o directamente en la base):

- **Precios, stock, tiempos y precios "desde" de servicios**: inventados para poder probar el sitio.
- **Precio mayorista**: derivado (10 % menos que la unidad, redondeado); solo lo lee el servidor con `service_role`.
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
- **Producto, servicios, home, contacto y nosotros** son estáticos con ISR de 5 min (se prerenderizan desde la base en el build). **`/tienda` y `/tienda/[category]` son dinámicas**: leen `searchParams` (filtros en la URL, requisito del brief); para compensar, filtran en memoria sobre un snapshot del catálogo cacheado con `unstable_cache` (ver "Caché del catálogo").
- **Un producto sin variantes activas (borrador) o con la categoría oculta no se muestra**, en vez de tumbar toda la tienda.
- **Transición tarjeta → detalle con `<ViewTransition>`** de React, no con `layoutId` de Motion: entre rutas del App Router `layoutId` no es fiable, y `ViewTransition` es la vía soportada (se desactiva con `prefers-reduced-motion`).
- **`loading.tsx` solo en el listado principal**: en `[category]` producía un soft 404 (200 en lugar de 404 al hacer streaming antes de `notFound()`).

**Precios y seguridad**

- El precio que viaja en el carrito es solo para mostrar. El Server Action `submitQuote` valida con Zod, vuelve a leer los precios desde la capa de datos según el tier real del visitante (`lib/pricing/viewer.ts`) y rechaza variantes inexistentes o agotadas. Verificado: un precio manipulado a RD$ 1 en `localStorage` se recalcula a su valor real.
- El precio mayorista aplica solo a mayoristas aprobados **y** cuando la cantidad alcanza `min_wholesale_qty`; por debajo se cobra precio de unidad (`lib/cart/pricing.ts`, con pruebas).
- Formularios públicos con campo trampa (`additionalInfo`) contra bots y todo texto del cliente escapado en los correos.
- El código de cotización/reparación es correlativo (`RU-2026-0001`, `RE-2026-0001`); por eso `/carrito/enviado` **no** muestra datos a partir del código (sería enumerable): los detalles viven solo en `sessionStorage` de esa pestaña.
- **Persistencia y códigos**: cada cotización y reparación se guarda en `quotes`/`quote_items`/`repair_requests` con un código correlativo generado por Postgres (atómico, reinicia cada año). Si la base falla, el cliente ve un error claro y no se envía nada: nunca se le da un código que no existe. PostgREST no abre transacciones entre tablas, así que si fallan las líneas se borra la cabecera para no dejar una cotización vacía.
- **Ids de variante**: son UUID. Un carrito guardado en el navegador antes de conectar la base (con ids viejos) se detecta como "no disponible" y el cliente lo quita solo.

**Accesibilidad**

- `--muted-foreground` es `#5b6270` (no `#6b7280` del brief: daba 4.47:1 sobre `surface-2`) y el texto verde usa `--color-success-700`. El rojo `#E11B22` da 4.8:1 sobre blanco, suficiente para texto de 14 px en peso 600.
- Animaciones: todo pasa por `lib/motion.ts` y respeta `prefers-reduced-motion`.

## Rendimiento (medido, build de producción, móvil)

Lighthouse (throttling simulado, esta máquina de desarrollo):

| Página    | Perf | A11y | Best Practices | SEO |
| --------- | ---- | ---- | -------------- | --- |
| Home      | 87   | 100  | 100            | 100 |
| Tienda    | 88   | 100  | 100            | 100 |
| Producto  | 91   | 100  | 100            | 100 |
| Servicios | 91   | 100  | 100            | 100 |

`/carrito` marca SEO 63 porque es `noindex` a propósito. **Experiencia real** (Chrome con 4G lenta y CPU 4× más lenta, medida de nuevo con la base de datos conectada): LCP de 1.1 a 1.3 s en todas las páginas, CLS 0. El objetivo del brief (Perf ≥ 92) **no se alcanza todavía en ninguna página** (quedan entre 87 y 91 en la medición simulada); la home es la más pesada por la cantidad de componentes interactivos. Las cifras deben repetirse sobre el deploy real en Vercel (CDN y compresión Brotli), donde suelen mejorar.

## Despliegue (Vercel)

Pendiente de documentar en la Fase 10 con los pasos concretos (variables de entorno, dominio, remitente de Resend).
