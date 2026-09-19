# Raymond Unlock

Sitio web de Raymond Unlock — celulares, tablets, audio, smartwatches, accesorios y servicios técnicos en Santo Domingo, República Dominicana. Catálogo público con precio de mayorista protegido en servidor, cotización por WhatsApp/correo, portal de mayoristas y panel de administración completo.

## Estado del proyecto

| Fase | Contenido                                               | Estado                      |
| ---- | ------------------------------------------------------- | --------------------------- |
| 0    | Scaffold, tooling, estructura                           | Hecha                       |
| 1    | Design system, motion, Header/MegaMenu/Footer/MobileBar | Hecha                       |
| 2    | Supabase: migraciones, RLS, vistas, seed                | Hecha                       |
| 3    | Home                                                    | Hecha                       |
| 4    | Catálogo con filtros en URL                             | Hecha                       |
| 5    | Detalle de producto                                     | Hecha                       |
| 6    | Carrito y cotización                                    | Hecha (se guarda en la BD)  |
| 7    | Servicios y solicitudes de reparación                   | Hecha (se guarda en la BD)  |
| 8    | Auth + portal mayorista                                 | Hecha                       |
| 9    | Panel admin                                             | Hecha                       |
| 10   | Pasada final                                            | Parcial (ver "Rendimiento") |

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

Los datos de contacto (WhatsApp, correo, redes, dirección, horarios) no son variables de entorno: viven en la tabla `site_settings` y se editan desde `/admin/ajustes`.

**Correo con Resend:** sirve para las cotizaciones, las reparaciones, los avisos de mayoristas **y los correos de cuenta** (confirmación y recuperación de contraseña; ver "Cuentas y mayoristas"). Con el remitente de prueba (`onboarding@resend.dev`) Resend solo entrega al correo dueño de la cuenta. Para escribirle a clientes hay que verificar un dominio en Resend y usar un remitente de ese dominio en `RESEND_FROM_EMAIL`. Sin `RESEND_API_KEY` el flujo de cotización funciona por WhatsApp y el canal correo informa el fallo al cliente en vez de fingir éxito.

## Base de datos (Supabase)

El esquema y la seguridad viven en `supabase/migrations/` (`..._schema.sql`, `..._security.sql` y `..._wholesale_accounts.sql`); `supabase/seed.sql` carga el catálogo de ejemplo.

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

Verificado contra el proyecto real (peticiones REST y recorridos en un navegador, con usuarios de prueba creados y borrados en la misma corrida):

- Un visitante anónimo no puede leer `price_wholesale` ni `product_variants`, ni escribir en ninguna tabla, vista o RPC interno.
- Un usuario común no puede subirse el rol, auto-aprobarse como mayorista, editar catálogo ni subir a Storage (y meter `role: admin` en el metadata al registrarse no sirve).
- Un admin sí crea y edita catálogo, sube imágenes y aprueba mayoristas; una cuenta sin rol admin (anónima, cliente o rechazada) que repite la petición real de una Server Action del panel no logra escribir nada.
- Ninguna llave secreta ni valor de precio al por mayor aparece en los bundles del navegador ni en el HTML prerenderizado de las páginas públicas (solo existe el _nombre_ `priceWholesale` en el código del carrito, sin datos).

**Caché del catálogo**: las lecturas públicas van por un snapshot cacheado 5 minutos (`unstable_cache`, etiqueta `catalog`). Los cambios hechos desde `/admin` lo invalidan al instante; un cambio hecho directamente en la base tarda hasta 5 minutos en verse. PostgREST devuelve como máximo 1000 filas por consulta: si el catálogo se acerca a ese tamaño el sitio falla con un mensaje explícito (en vez de ocultar productos en silencio) y toca mover el filtrado de `/tienda` a SQL.

## Cuentas y mayoristas

- **Registro y acceso** (`/registro`, `/login`, `/recuperar`, `/cuenta`): una cuenta personal o de negocio. Quien pide cuenta al por mayor (en `/registro` o en el formulario de `/mayorista`) nace **sin aprobar** y ve precios por unidad con el aviso "Solicitud en revisión". Un cliente que ya tiene cuenta puede pedir el acceso desde `/cuenta`.
- **Los correos de confirmación y recuperación los envía la aplicación con Resend**, no Supabase: el SMTP integrado de Supabase solo entrega a correos del equipo del proyecto y con un límite muy bajo. El enlace lleva un `token_hash` que `/auth/confirm` verifica en el servidor (sirve una sola vez y vence en 1 hora). Sin `RESEND_API_KEY` el registro crea la cuenta pero el correo no sale: en desarrollo el enlace se imprime en la consola del servidor; en producción el registro avisa del fallo y el usuario puede pedir un enlace nuevo desde "Iniciar sesión". **Para que funcione en producción hace falta la clave de Resend y un dominio verificado.**
- La respuesta a "registrar" y "recuperar contraseña" es la misma exista o no el correo (no se revela quién tiene cuenta), hay campo trampa y un límite de intentos por IP. El límite es **en memoria y por instancia**: es un freno básico; para algo más fuerte hay que añadir un límite compartido (WAF de Vercel, Upstash).
- Cuando el correo de un mayorista se verifica, el negocio recibe un aviso con un botón a `/admin/mayoristas`. Al aprobar o rechazar, la persona recibe un correo con la decisión.
- **Ver precios al por mayor**: solo un mayorista aprobado (o un admin, para revisar el sitio) recibe el mapa de precios, mediante un Server Action que valida la sesión en el servidor. Las páginas públicas siguen siendo estáticas: sin cookie de sesión no se hace ninguna petición extra; con ella, el navegador pide su estado. El encabezado muestra el interruptor "Ver precios: Unidad / Por mayor" y el carrito muestra el precio al llegar a la cantidad mínima. Al enviar la cotización el servidor decide el tier por la sesión y guarda el tipo de precio **realmente aplicado** (un mayorista que no alcanza el mínimo paga precio por unidad).

## Panel de administración (`/admin`)

Acceso: solo cuentas con `role = 'admin'` (ver "Base de datos", paso 4). Cualquier otra persona recibe 404.

| Sección                                | Qué permite                                                                                                                                                      |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Panel                                  | Cotizaciones nuevas, reparaciones pendientes, productos activos, variantes con poco stock, solicitudes mayoristas y últimas 10 cotizaciones                      |
| Productos                              | Búsqueda, filtros y paginación en servidor; crear/editar con variantes en línea (los dos precios, mínimo mayorista, stock); duplicar; publicar u ocultar en lote |
| Imágenes                               | Arrastrar y soltar, compresión en el navegador (WebP, máx. 1600 px), texto alternativo obligatorio, asignar a una variante, reordenar                            |
| Categorías, marcas, servicios, banners | CRUD con reordenamiento arrastrando (o con flechas, para teclado)                                                                                                |
| Cotizaciones / reparaciones            | Búsqueda, filtros, cambio de estado, detalle con botón de WhatsApp del cliente y **exportación CSV** de cotizaciones                                             |
| Mayoristas                             | Solicitudes pendientes, aprobadas y rechazadas; aprobar, rechazar o revocar con correo de aviso                                                                  |
| Ajustes                                | Datos del negocio, horarios, garantías, "por qué nosotros", proceso de reparación, testimonios y promos del menú                                                 |

**Seguridad del panel (en capas)**: el `proxy` exige sesión; el layout y **cada página** verifican el rol; **cada Server Action** lo vuelve a verificar y, además, el RLS de la base sigue siendo la última barrera. `product_variants` (con el precio al por mayor) solo se escribe con `service_role` desde el servidor, después de verificar el rol. Se comprobó repitiendo la petición real de una acción del panel como visitante anónimo, cliente con sesión y cuenta rechazada: ninguna escribe.

**Reglas de datos**: nunca se borra un producto ni una variante con cotizaciones asociadas (se desactivan); una categoría, marca o servicio en uso no se puede borrar; las imágenes solo pueden ser rutas del sitio o de nuestro bucket (`next/image` falla con otros hosts y tumbaría la página); al borrar una imagen se elimina de Storage solo si nadie más la usa. Los precios se editan con comas de miles ("74,900.50") y el precio al por mayor no puede superar el de unidad.

**Cambios inmediatos**: cada guardado invalida la caché (`updateTag`) y las páginas estáticas, así que la tienda muestra el cambio al instante en vez de esperar los 5 minutos de ISR.

## Scripts

| Script                              | Qué hace                                                |
| ----------------------------------- | ------------------------------------------------------- |
| `pnpm dev` / `pnpm build`           | Desarrollo / build de producción (Turbopack)            |
| `pnpm lint` / `pnpm lint:fix`       | ESLint (flat config)                                    |
| `pnpm format` / `pnpm format:check` | Prettier                                                |
| `pnpm typecheck`                    | `tsc --noEmit`                                          |
| `pnpm test` / `pnpm test:watch`     | Vitest (110 pruebas: precios, catálogo, cuentas, panel) |
| `pnpm analyze`                      | Build con `@next/bundle-analyzer`                       |

Un hook de pre-commit (husky + lint-staged) corre ESLint y Prettier sobre los archivos en stage.

## Datos y contenido de ejemplo (reemplazar antes de publicar)

Todo esto es ficticio o provisional y vive en `supabase/seed.sql`; se reemplaza desde `/admin`:

- **Precios, stock, tiempos y precios "desde" de servicios**: inventados para poder probar el sitio.
- **Precio mayorista**: derivado (10 % menos que la unidad, redondeado); solo lo lee el servidor con `service_role`.
- **Testimonios**: 3 textos de ejemplo con nombres genéricos. **No publicar tal cual**: reemplazar por opiniones reales.
- **Textos de garantías, "por qué nosotros" y proceso de reparación**: propuestas a confirmar con el cliente.
- **Imágenes**: los productos usan una ilustración de respaldo teñida con el color de la variante; el hero usa 3 ilustraciones de ejemplo (`public/seed/`). Las fotos reales se suben desde `/admin/productos`. Un producto de ejemplo (iPhone 15 Pro) trae 2 imágenes para probar la galería.

## Pendiente del cliente

- **Logo** con fondo transparente o SVG (solo existe el PNG con fondo blanco). Mientras tanto: wordmark tipográfico en `components/layout/logo.tsx` y monograma "RU" provisional en `app/icon.tsx`, `app/apple-icon.tsx` y `app/manifest.ts`.
- **URL de la página de Facebook** (el brief solo da el nombre; la URL no se puede derivar). Instagram y Threads sí están enlazados.
- **Horarios de atención** (se cargan en `/admin/ajustes` → Horarios; mientras estén vacíos no se muestran), sucursales adicionales y **métodos de pago**: no están en el brief, no se inventaron.
- **Newsletter**: el modelo de datos del brief no tiene tabla de suscriptores, así que no se construyó el formulario. Decidir si se agrega.
- **"Más vendidos"** usa `is_featured` porque el esquema no registra ventas (las cotizaciones no son ventas confirmadas).

## Decisiones técnicas (y por qué)

**Versiones**

- **ESLint fijado en 9.39.5**: `eslint-plugin-react` (vía `eslint-config-next`) usa `context.getFilename()`, que ESLint 10 eliminó; con la 10 el lint falla en ejecución.
- **TypeScript en 5.9.3, no 7.x**: `typescript-eslint` aún soporta solo `<6.1.0`.
- **Sin `sonner`, `vaul` ni `embla-carousel-react`**: Toast, bottom-sheet y carruseles se hicieron con Radix + Motion + `scroll-snap`.

**Next 16**

- **Sin Cache Components**: el brief pide el modelo clásico (`revalidate`, `generateStaticParams`), que sigue soportado.
- **`proxy.ts` en vez de `middleware.ts`**: Next 16 renombró el archivo y la función. Solo refresca la sesión y protege `/admin` y `/cuenta`; la autorización real vive en cada página y cada acción.
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

1. **Base de datos de producción**: crea un proyecto de Supabase (o usa el actual) y sigue "Base de datos (Supabase)": migraciones, seed **solo si quieres el catálogo de ejemplo** y primer admin. Si usas el proyecto de desarrollo, **rota antes la contraseña de la base y la llave `service_role`** (circularon por chat).
2. **Vercel**: importa el repositorio (framework Next.js, pnpm). Node ≥ 20.9.
3. **Variables de entorno** (Production y Preview): `NEXT_PUBLIC_SITE_URL` (dominio final, sin slash), `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (marcarla como sensible), `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `ORDER_NOTIFICATION_EMAIL`. `SUPABASE_DB_URL` no hace falta en Vercel.
4. **Resend**: verifica el dominio y usa un remitente de ese dominio en `RESEND_FROM_EMAIL`. Sin esto no salen las cotizaciones por correo ni los correos de cuenta.
5. **Primer despliegue**: el build lee la base para prerenderizar los productos y servicios, así que la base debe estar lista _antes_. Comprueba `/`, `/tienda`, un producto, `/registro` y `/login`.
6. **Después de publicar**: entra a `/admin` con el admin, carga las fotos reales, los precios y stock reales, los testimonios reales y los horarios (ver "Datos y contenido de ejemplo"), y repite las mediciones de Lighthouse sobre el dominio real.
7. **Imágenes**: `next.config.ts` permite el host de Supabase Storage a partir de `NEXT_PUBLIC_SUPABASE_URL`; si cambias de proyecto de Supabase, vuelve a desplegar.
8. **Límite de intentos**: el de inicio de sesión/registro es en memoria por instancia; para producción con tráfico real conviene un límite compartido (WAF de Vercel o Upstash).
