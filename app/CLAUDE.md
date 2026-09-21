# app/ — rutas y layouts

## Estructura

- `layout.tsx` (raíz): `<html>`, `<body>`, `MotionProvider`, `Toaster` y el enlace "Saltar al contenido". Nada de cabecera aquí.
- `(marketing)/`: la tienda pública con `Header`, `Footer`, barra móvil, WhatsApp flotante y el drawer del carrito.
- `(auth)/`: solo `login` (para el administrador), con un layout mínimo, y `actions.ts` con `login` y `logout`. No hay registro, cuenta de cliente ni recuperación de contraseña.
- `proveedores/`: el listado al por mayor. Está fuera de `(marketing)` a propósito: es una "app" a pantalla completa con su propio encabezado y menú inferior, sin `Header` ni `Footer`. `page.tsx` (ISR 5 min) lee `getWholesaleListing`; `actions.ts` trae `submitWholesaleOrder`, que recibe solo ids y cantidades.
- `admin/`: el panel (tiene su propio `CLAUDE.md`).
- `api/og/route.tsx`, `sitemap.ts`, `robots.ts`, `manifest.ts`, `icon.tsx`, `apple-icon.tsx`.

## Reglas

- **Páginas públicas estáticas con ISR (`revalidate = 300`)**: no leen `cookies()` ni `headers()` (la vuelven dinámica). La tienda no depende de la sesión de nadie. Las únicas dinámicas por diseño son `/tienda`, `/tienda/[category]` (leen `searchParams`), `/login`, `/admin` y `/carrito/enviado`.
- **Datos**: siempre a través de `@/lib/data`. Una página no importa Supabase.
- **`proxy.ts`** (raíz del repo) solo refresca la sesión, protege `/admin` y lleva `/login` con sesión al panel. La autorización real es `requireAdmin()` en cada página/layout y `withAdmin()` en cada acción; el proxy no basta.
- **Server Actions** van junto a su ruta (`actions.ts` con `"use server"`), validan con Zod, nunca lanzan hacia el cliente (devuelven `{ ok: false, message }`) y no reciben precios del navegador.
- Un Server Component **no puede pasar funciones ni esquemas Zod** como props a un Client Component (rompe en runtime); pásale datos planos y deja la configuración en el lado cliente.
- Rutas con parámetros: `PageProps<"/ruta/[id]">`; tras crear o mover rutas, `pnpm exec next typegen`.
- `loading.tsx` encima de una página que puede llamar a `notFound()` produce un soft 404 (200); por eso `tienda/(lista)` lo lleva y `tienda/[category]` no.
- Formularios públicos llevan campo trampa (`additionalInfo`) y los correos escapan todo texto del cliente (`lib/email/html.ts`).
