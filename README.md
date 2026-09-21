# Raymond Unlock

Sitio web de Raymond Unlock — celulares, tablets, audio, smartwatches, accesorios y servicios técnicos en Santo Domingo, República Dominicana. Catálogo público, cotización por WhatsApp/correo (con el equipo exacto: estado, batería, liberación y código), un listado de precios al por mayor con pedido por WhatsApp (`/proveedores`) y panel de administración completo. Los clientes no crean cuenta ni inician sesión: solo existe la cuenta del administrador.

## Estado del proyecto

| Fase | Contenido                                               | Estado                     |
| ---- | ------------------------------------------------------- | -------------------------- |
| 0    | Scaffold, tooling, estructura                           | Hecha                      |
| 1    | Design system, motion, Header/MegaMenu/Footer/MobileBar | Hecha                      |
| 2    | Supabase: migraciones, RLS, vistas, seed                | Hecha                      |
| 3    | Home                                                    | Hecha                      |
| 4    | Catálogo con filtros en URL                             | Hecha                      |
| 5    | Detalle de producto                                     | Hecha                      |
| 6    | Carrito y cotización                                    | Hecha (se guarda en la BD) |
| 7    | Servicios y solicitudes de reparación                   | Hecha (se guarda en la BD) |
| 8    | Auth (después reducida a solo el administrador)         | Hecha                      |
| 9    | Panel admin                                             | Hecha                      |
| 10   | Pasada final                                            | Hecha (ver "Rendimiento")  |

Las fases 3–7 se construyeron primero sobre datos de prueba y en la Fase 2 se conectaron a Supabase cambiando solo `lib/data/`: las páginas no se tocaron. Todas leen a través de `lib/data/index.ts`.

## Stack

- **Next.js 16** (App Router, React Server Components), **React 19**, **TypeScript 5.9** estricto
- **Tailwind CSS v4** (tokens en `app/globals.css`), **shadcn/ui** sobre Radix
- **Motion** (`motion/react`, con `LazyMotion` asíncrono) para todas las animaciones
- **Zustand** (`persist`) para el carrito, **Zod + React Hook Form** para formularios
- **exceljs** y **@react-pdf/renderer** (solo servidor) para las exportaciones a Excel y PDF
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

| Variable                                                     | Uso                                                                 |
| ------------------------------------------------------------ | ------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`                                       | metadata, JSON-LD, sitemap, OG (sin slash final)                    |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | lecturas públicas (RLS) y configuración de `next/image`             |
| `SUPABASE_SERVICE_ROLE_KEY`                                  | **solo servidor**: variantes (precio mayorista), solicitudes, admin |
| `SUPABASE_DB_URL`                                            | solo para aplicar migraciones desde tu máquina; la app no la lee    |
| `RESEND_API_KEY`                                             | envío de correos de cotización y reparación                         |
| `RESEND_FROM_EMAIL`                                          | remitente; ver nota abajo                                           |
| `ORDER_NOTIFICATION_EMAIL`                                   | correo del negocio que recibe cada solicitud                        |

Los datos de contacto (WhatsApp, correo, redes, dirección, horarios) no son variables de entorno: viven en la tabla `site_settings` y se editan desde `/admin/ajustes`.

**Correo con Resend:** sirve para las cotizaciones y las reparaciones. Con el remitente de prueba (`onboarding@resend.dev`) Resend solo entrega al correo dueño de la cuenta. Para escribirle a clientes hay que verificar un dominio en Resend y usar un remitente de ese dominio en `RESEND_FROM_EMAIL`. Sin `RESEND_API_KEY` el flujo de cotización funciona por WhatsApp y el canal correo informa el fallo al cliente en vez de fingir éxito.

## Base de datos (Supabase)

El esquema y la seguridad viven en `supabase/migrations/` (`..._schema.sql`, `..._security.sql`, `..._wholesale_accounts.sql`, `..._unit_details_and_history.sql`, `..._quote_closed_at.sql` y `..._wholesale_listing.sql`); `supabase/seed.sql` carga el catálogo de ejemplo.

Para crear una base nueva:

1. Crear un proyecto en Supabase y copiar a `.env.local` la URL, la llave `anon`, la `service_role` (Project Settings → API) y el connection string del **Session pooler** (Connect). La conexión directa (`db.<ref>.supabase.co`) es solo IPv6 y falla en muchas redes.
2. Aplicar las migraciones: `npx supabase db push --db-url "$SUPABASE_DB_URL"`.
3. Cargar los datos de ejemplo: ejecutar `supabase/seed.sql` en el SQL Editor del dashboard (o con `psql`). Es idempotente (`on conflict do nothing`): no pisa lo que ya se editó.
4. **Cerrar el registro público**: en Supabase → Authentication → Sign In / Providers, desactiva **"Allow new users to sign up"**. Sin eso, cualquiera con la llave pública podría crear cuentas llamando a la API de Auth directamente (no podrían hacer nada, el login del sitio las rechaza y el RLS no les da acceso, pero llenarían la tabla de usuarios).
5. Crear el primer admin: crea la cuenta en Authentication → Users (**Add user**, con contraseña y "Auto Confirm User" activado) y corre `pnpm admin:make correo@del.admin`. Es lo mismo que `update public.profiles set role = 'admin' where email = 'correo@del.admin';` en el SQL Editor. Desde la aplicación nadie puede otorgarse ese rol. Para cambiar la contraseña del admin usa el panel de Supabase (Authentication → Users).

Si cambias el esquema, regenera `types/database.ts` con `npx supabase gen types typescript --db-url "$SUPABASE_DB_URL" --schema public` (requiere Docker Desktop). Sin Docker se puede correr `@supabase/postgres-meta` en modo CLI con `PG_META_GENERATE_TYPES=typescript`, que produce el mismo archivo.

**Modelo de seguridad**

- RLS activo en las 14 tablas. Supabase concede todos los permisos por defecto a cualquier objeto nuevo, así que las migraciones revocan todo a `anon` y `authenticated` y otorgan solo lo mínimo (incluidas las vistas y las funciones).
- **Precio mayorista**: `product_variants` está cerrada a `anon` y `authenticated` (ni un admin la lee por la API). El público lee las vistas `v_catalog_*`, que no tienen `price_wholesale` ni `min_wholesale_qty`; el servidor lee la tabla con `service_role` para recalcular cotizaciones y para el panel. Las vistas corren con los permisos de su dueño (`security_invoker = false`) a propósito, para exponer un subconjunto de columnas; el asesor de Supabase las marcará como "Security Definer View" y es lo esperado.
- **Solicitudes** (`quotes`, `quote_items`, `repair_requests`): nadie inserta desde la API pública; las guarda el servidor, después de validar con Zod y recalcular precios, con `service_role`. Solo un admin puede leerlas, editarlas o borrarlas. Los códigos (`RU-2026-0001`) salen de una función atómica que solo puede ejecutar `service_role`.
- **Roles**: el trigger que crea el perfil nunca lee el rol del metadata, así que nadie se otorga `admin` al registrarse; `profiles` solo permite editar `full_name`, `phone`, `business_name` y `rnc`. El login del sitio, además, cierra la sesión de cualquier cuenta que no sea admin.
- **Historial de cambios**: `product_history` la llenan triggers (`security definer`) al crear, modificar o borrar productos, variantes e imágenes, con el valor de antes y de después. Solo un admin la lee (RLS) y nadie la escribe por la API. No lleva llave foránea: el historial de un producto borrado se conserva.
- **Código de cada variante**: si el SKU se deja vacío, un trigger asigna `RU-00001`, `RU-00002`… Es el código del mensaje de WhatsApp y con el que el admin busca el producto.
- **Storage**: el bucket `products` se lee públicamente y solo escribe un admin (imágenes de hasta 5 MB). Las URLs públicas se cachean en el CDN de Supabase: al reemplazar una foto, sube un archivo con nombre nuevo en vez de sobrescribir.

Verificado contra el proyecto real (peticiones REST y recorridos en un navegador, con usuarios de prueba creados y borrados en la misma corrida):

- Un visitante anónimo no puede leer `price_wholesale` ni `product_variants`, ni escribir en ninguna tabla, vista o RPC interno.
- Un usuario común no puede subirse el rol, editar catálogo, leer el historial ni subir a Storage (y meter `role: admin` en el metadata al registrarse no sirve).
- Un admin sí crea y edita catálogo, sube imágenes y lee el historial; una cuenta sin rol admin (anónima o cliente) que repite la petición real de una Server Action del panel no logra escribir nada.
- Ninguna llave secreta ni valor de precio al por mayor aparece en los bundles del navegador ni en el HTML prerenderizado de las páginas públicas (el precio al por mayor **de las variantes** solo existe en la base y en el panel; el listado de `/proveedores` es aparte y sus precios son públicos a propósito).

**Caché del catálogo**: las lecturas públicas van por un snapshot cacheado 5 minutos (`unstable_cache`, etiqueta `catalog`). Los cambios hechos desde `/admin` lo invalidan al instante; un cambio hecho directamente en la base tarda hasta 5 minutos en verse. PostgREST devuelve como máximo 1000 filas por consulta: si el catálogo se acerca a ese tamaño el sitio falla con un mensaje explícito (en vez de ocultar productos en silencio) y toca mover el filtrado de `/tienda` a SQL.

## Acceso y mayoristas

- **Solo el administrador inicia sesión.** No hay registro, cuenta de cliente, recuperación de contraseña ni portal mayorista. Los clientes navegan, arman su cotización y la piden por WhatsApp o correo. `/login` existe solo para el panel: si las credenciales son válidas pero la cuenta no tiene rol `admin`, se cierra la sesión y se responde "Correo o contraseña incorrectos" (igual que con una clave errónea). Hay un límite de 10 intentos por IP cada 15 minutos, **en memoria y por instancia**: es un freno básico; para algo más fuerte hay que añadir un límite compartido (WAF de Vercel, Upstash).
- **Al por mayor**: `/mayorista` explica el servicio y lleva al listado de `/proveedores` (ver abajo) o a WhatsApp. El precio al por mayor y la cantidad mínima **de las variantes** siguen en la base (lo que ya estaba guardado se conserva) pero **ya no se editan en el panel y nadie los ve en la tienda**: las cotizaciones se cobran siempre por unidad.
- **Mensaje de WhatsApp predeterminado**: al pedir un producto (o al enviar la cotización) el mensaje trae el equipo exacto que se eligió: nombre, estado (nuevo, usado…), capacidad, color, **batería**, **liberación** (_factory_ o _por artista_) y **código**. Ver `lib/whatsapp.ts` y `lib/cart/whatsapp.ts` (con pruebas).
- **Liberación**: _Factory_ es un equipo liberado de fábrica; _Por artista_ es el liberado por un técnico. Se elige por variante en el panel. Si un producto tiene varias variantes que se distinguen solo por batería o liberación, la ficha muestra esos selectores.

## Listado al por mayor (`/proveedores`)

Página pública con la lista de precios al por mayor del negocio, pensada para que otros negocios armen su pedido desde el teléfono y lo manden por WhatsApp. Se usa como una app: encabezado con la fecha de actualización, buscador, filtros por tipo, categoría y condición (salen de los datos), categorías que se despliegan, botón "+" por producto, barra "Ver pedido", hoja "Tu pedido" (cantidades, total y "Vaciar") y menú inferior con Listado, Buscar, Pedido y Más.

- **Los precios son públicos** (decisión del dueño, 2026-09-21): cualquiera con el enlace ve la lista. Es un dato aparte del catálogo: vive en sus propias tablas (`wholesale_products`, `wholesale_contacts`, `wholesale_orders`, `wholesale_order_items`) y no toca `product_variants` ni el precio por mayor de las variantes.
- **El pedido**: el navegador solo manda ids y cantidades; el servidor vuelve a leer nombre y precio (`submitWholesaleOrder`), guarda el pedido con un código `PM-AAAA-NNNN` y sus renglones tal como se vendieron, y devuelve el enlace de WhatsApp con el mensaje armado. Si un producto ya no está en la lista se rechaza el pedido y se quita del carrito del cliente. Con varios vendedores el cliente elige a quién escribirle; con uno sale directo; sin ninguno va al WhatsApp del negocio (Ajustes). Límite de 15 pedidos por IP por hora (en memoria, por instancia).
- **Panel** (`/admin/proveedores`): pestañas Productos, Contactos de venta y Pedidos. El tablero y el menú lateral avisan de los pedidos nuevos. Lo que se guarda se ve al instante en la página.
- **Cómo se carga la lista**: por ahora a mano, desde el panel. Importarla desde Excel o CSV queda pendiente de decidir.
- El enlace de WhatsApp del pedido termina con "enviado desde <dominio>", tomado de `NEXT_PUBLIC_SITE_URL`: hay que ponerlo al dominio real antes de publicar.

## Panel de administración (`/admin`)

Acceso: solo cuentas con `role = 'admin'` (ver "Base de datos", paso 4). Sin sesión, `/admin` manda a `/login` y, tras entrar, a la página que se pidió.

| Sección                                | Qué permite                                                                                                                                                                |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Panel                                  | Cotizaciones nuevas, reparaciones pendientes, productos activos, variantes con poco stock y últimas 10 cotizaciones                                                        |
| Buscar producto                        | Por **código (SKU)**, ID del producto o de una variante, enlace o nombre. Un código o ID exacto abre directo la ficha. También está en la barra superior                   |
| Productos                              | Búsqueda, filtros y paginación en servidor; crear/editar con variantes en línea (batería, liberación, precios, stock); duplicar; publicar u ocultar en lote                |
| Ficha del producto                     | Todo lo del producto y de cada variante: ID, fechas de creación y última modificación, batería, liberación, precios y stock, más el **historial de cambios**               |
| Imágenes                               | Arrastrar y soltar, compresión en el navegador (WebP, máx. 1600 px), texto alternativo obligatorio, asignar a una variante, reordenar                                      |
| Categorías, marcas, servicios, banners | CRUD con reordenamiento arrastrando (o con flechas, para teclado)                                                                                                          |
| Cotizaciones / reparaciones            | Búsqueda, filtros, cambio de estado, detalle con botón de WhatsApp del cliente y **exportación a Excel y PDF** con los mismos filtros del listado                          |
| Listado mayorista                      | Productos del listado de `/proveedores` (con foto opcional, visible u oculto), contactos de venta (WhatsApp de cada vendedor, con orden) y pedidos recibidos con su estado |
| Ventas                                 | Informe del mes: total vendido (con comparación con el mes anterior), ventas, ticket promedio, unidades y productos vendidos; **Excel y PDF**                              |
| Ajustes                                | Datos del negocio, horarios, garantías, "por qué nosotros", proceso de reparación, testimonios y promos del menú                                                           |

**Informes y exportaciones**: cada informe se arma una sola vez (`lib/reports/*-report.ts`, datos ya listos para mostrar) y se dibuja igual en pantalla, en Excel (`excel.ts`, con la marca, tarjetas de indicadores, encabezados fijos, filtros, estados con color, formato de pesos y totales, listo para imprimir) y en PDF (`pdf-document.tsx`, A4 horizontal con encabezado repetido en cada página y numeración). Las descargas son rutas del panel (`/admin/cotizaciones/export`, `/admin/reparaciones/export`, `/admin/ventas/export`, con `?formato=xlsx|pdf`) que exigen rol admin, respetan los filtros del listado y traen como máximo 5000 filas. Una **venta** es una cotización en estado _Cerrada_ y cuenta en el mes en que se cerró (`quotes.closed_at`, que guarda un trigger); si se reabre o se cancela, deja de contar. El importe es el de la cotización.

**Seguridad del panel (en capas)**: el `proxy` exige sesión; el layout y **cada página** verifican el rol; **cada Server Action** lo vuelve a verificar y, además, el RLS de la base sigue siendo la última barrera. `product_variants` (con el precio al por mayor) solo se escribe con `service_role` desde el servidor, después de verificar el rol. Se comprobó repitiendo la petición real de una acción del panel como visitante anónimo y como usuario sin rol admin: ninguna escribe.

**Reglas de datos**: nunca se borra un producto ni una variante con cotizaciones asociadas (se desactivan); una categoría, marca o servicio en uso no se puede borrar; las imágenes solo pueden ser rutas del sitio o de nuestro bucket (`next/image` falla con otros hosts y tumbaría la página); al borrar una imagen se elimina de Storage solo si nadie más la usa. Los precios se editan con comas de miles ("74,900.50") y el precio al por mayor no puede superar el de unidad.

**Cambios inmediatos**: cada guardado invalida la caché (`updateTag`) y las páginas estáticas, así que la tienda muestra el cambio al instante en vez de esperar los 5 minutos de ISR.

## Scripts

| Script                              | Qué hace                                                                                  |
| ----------------------------------- | ----------------------------------------------------------------------------------------- |
| `pnpm dev` / `pnpm build`           | Desarrollo / build de producción (Turbopack)                                              |
| `pnpm lint` / `pnpm lint:fix`       | ESLint (flat config)                                                                      |
| `pnpm format` / `pnpm format:check` | Prettier                                                                                  |
| `pnpm typecheck`                    | `tsc --noEmit`                                                                            |
| `pnpm test` / `pnpm test:watch`     | Vitest (164 pruebas: precios, catálogo, mensajes de WhatsApp, historial, panel, informes) |
| `pnpm analyze`                      | Build con `@next/bundle-analyzer`                                                         |

Un hook de pre-commit (husky + lint-staged) corre ESLint y Prettier sobre los archivos en stage.

## Datos y contenido de ejemplo (reemplazar antes de publicar)

Todo esto es ficticio o provisional y vive en `supabase/seed.sql`; se reemplaza desde `/admin`:

- **Precios, stock, tiempos y precios "desde" de servicios**: inventados para poder probar el sitio.
- **Precio mayorista**: derivado (10 % menos que la unidad, redondeado); vive solo en la base, ya no se edita en el panel y nadie lo ve en la tienda.
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
- **`proxy.ts` en vez de `middleware.ts`**: Next 16 renombró el archivo y la función. Solo refresca la sesión y protege `/admin` (y lleva `/login` con sesión al panel); la autorización real vive en cada página y cada acción.
- **Producto, servicios, home, contacto y nosotros** son estáticos con ISR de 5 min (se prerenderizan desde la base en el build). **`/tienda` y `/tienda/[category]` son dinámicas**: leen `searchParams` (filtros en la URL, requisito del brief); para compensar, filtran en memoria sobre un snapshot del catálogo cacheado con `unstable_cache` (ver "Caché del catálogo").
- **Un producto sin variantes activas (borrador) o con la categoría oculta no se muestra**, en vez de tumbar toda la tienda.
- **Transición tarjeta → detalle con `<ViewTransition>`** de React, no con `layoutId` de Motion: entre rutas del App Router `layoutId` no es fiable, y `ViewTransition` es la vía soportada (se desactiva con `prefers-reduced-motion`).
- **`loading.tsx` solo en el listado principal**: en `[category]` producía un soft 404 (200 en lugar de 404 al hacer streaming antes de `notFound()`).

**Precios y seguridad**

- El precio que viaja en el carrito es solo para mostrar. El Server Action `submitQuote` valida con Zod, vuelve a leer los precios (y los datos del equipo: estado, batería, liberación, código) desde la capa de datos y rechaza variantes inexistentes o agotadas. Verificado: un precio manipulado a RD$ 1 en `localStorage` se recalcula a su valor real.
- Toda cotización se cobra por unidad (`lib/cart/pricing.ts`, con pruebas). Lo al por mayor se cotiza por WhatsApp.
- Formularios públicos con campo trampa (`additionalInfo`) contra bots y todo texto del cliente escapado en los correos.
- El código de cotización/reparación es correlativo (`RU-2026-0001`, `RE-2026-0001`); por eso `/carrito/enviado` **no** muestra datos a partir del código (sería enumerable): los detalles viven solo en `sessionStorage` de esa pestaña.
- **Persistencia y códigos**: cada cotización y reparación se guarda en `quotes`/`quote_items`/`repair_requests` con un código correlativo generado por Postgres (atómico, reinicia cada año). Si la base falla, el cliente ve un error claro y no se envía nada: nunca se le da un código que no existe. PostgREST no abre transacciones entre tablas, así que si fallan las líneas se borra la cabecera para no dejar una cotización vacía.
- **Ids de variante**: son UUID. Un carrito guardado en el navegador antes de conectar la base (con ids viejos) se detecta como "no disponible" y el cliente lo quita solo.

**Accesibilidad**

- `--muted-foreground` es `#5b6270` (no `#6b7280` del brief: daba 4.47:1 sobre `surface-2`) y el texto verde usa `--color-success-700`. El rojo `#E11B22` da 4.8:1 sobre blanco, suficiente para texto de 14 px en peso 600.
- Animaciones: todo pasa por `lib/motion.ts` y respeta `prefers-reduced-motion`.

## Rendimiento (medido, build de producción, móvil)

Lighthouse móvil con throttling simulado, en esta máquina de desarrollo. Una sola corrida varía ±5 puntos (y la primera, en frío, sale más baja), así que se reporta la **mediana de 3 corridas** y, entre paréntesis, el rango:

| Página                                        | Perf       | A11y | Best Practices | SEO |
| --------------------------------------------- | ---------- | ---- | -------------- | --- |
| Home                                          | 92 (88–97) | 100  | 100            | 100 |
| Tienda                                        | 90 (88–90) | 100  | 100            | 100 |
| Producto                                      | 92 (86–94) | 100  | 100            | 100 |
| Servicios                                     | 92 (87–93) | 100  | 100            | 100 |
| Mayorista                                     | 92 (83–93) | 100  | 100            | 100 |
| Listado al por mayor (60 productos de prueba) | 90 (89–91) | 100  | 100            | 100 |
| Login                                         | 95 (87–96) | 100  | 100            | 63  |

`/login` y `/carrito` marcan SEO 63 porque son `noindex` a propósito. **El objetivo del brief (Perf ≥ 92) se cumple en la mediana de todas las páginas menos `/tienda` (90)**, que es dinámica y trae los filtros; en frío (primera visita sin caché) las páginas quedan entre 83 y 88. La experiencia real, medida con Chrome a 4G lenta y CPU 4× más lenta, fue de 1.1 a 1.3 s de LCP con CLS 0. Estas cifras deben repetirse sobre el deploy real en Vercel (CDN y Brotli), donde suelen mejorar.

**Qué se hizo para llegar ahí**: los formularios que traen React Hook Form + Zod (cotización, reparación, login) se cargan aparte (`*-lazy.tsx`): como `<Link>` precarga el JS de las rutas enlazadas, la home descargaba ~90 KB de Zod que no usa. Además el parser de filtros de `/tienda` ya no usa Zod (lo importan componentes del navegador; sus reglas están cubiertas por `search-params.test.ts`). Resultado: la home pasó de 392 a 277 KB de JavaScript y de 270 a ~100 ms de bloqueo (TBT).

## Despliegue (Vercel)

1. **Base de datos de producción**: crea un proyecto de Supabase (o usa el actual) y sigue "Base de datos (Supabase)": migraciones, seed **solo si quieres el catálogo de ejemplo** y primer admin. Si usas el proyecto de desarrollo, **rota antes la contraseña de la base y la llave `service_role`** (circularon por chat). No olvides **desactivar el registro público** en Supabase (paso 4).
2. **Vercel**: importa el repositorio (framework Next.js, pnpm). Node ≥ 20.9.
3. **Variables de entorno** (Production y Preview): `NEXT_PUBLIC_SITE_URL` (dominio final, sin slash), `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (marcarla como sensible), `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `ORDER_NOTIFICATION_EMAIL`. `SUPABASE_DB_URL` no hace falta en Vercel.
4. **Resend**: verifica el dominio y usa un remitente de ese dominio en `RESEND_FROM_EMAIL`. Sin esto no salen las cotizaciones por correo.
5. **Primer despliegue**: el build lee la base para prerenderizar los productos y servicios, así que la base debe estar lista _antes_. Comprueba `/`, `/tienda`, un producto y `/login`.
6. **Después de publicar**: entra a `/admin` con el admin, carga las fotos reales, los precios y stock reales, los testimonios reales y los horarios (ver "Datos y contenido de ejemplo"), y repite las mediciones de Lighthouse sobre el dominio real.
7. **Imágenes**: `next.config.ts` permite el host de Supabase Storage a partir de `NEXT_PUBLIC_SUPABASE_URL`; si cambias de proyecto de Supabase, vuelve a desplegar.
8. **Límite de intentos**: el de inicio de sesión es en memoria por instancia; para producción con tráfico real conviene un límite compartido (WAF de Vercel o Upstash).
