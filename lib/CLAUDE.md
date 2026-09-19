# lib/ — lógica de negocio y acceso a datos

## Mapa

- `data/`: **único** punto de entrada a los datos (`index.ts`). Lecturas públicas con un cliente anónimo sin cookies y un _snapshot_ del catálogo cacheado con `unstable_cache` (5 min, etiqueta `catalog`); los filtros de `/tienda` son funciones puras sobre ese snapshot (`catalog-list.ts`, con pruebas). Límite: PostgREST devuelve 1000 filas → si el catálogo se acerca, falla con un mensaje y hay que mover el filtrado a SQL (nunca truncar en silencio).
- `supabase/`: `anon.ts` (lecturas públicas), `server.ts` (sesión del visitante con cookies), `admin.ts` (service_role, `server-only`), `client.ts` (navegador; solo para subir imágenes en el admin), `proxy.ts` (refresco de sesión).
- `auth/`: `getViewer()` (quién es, validado con `getUser`), `status.ts` (estado de la cuenta y quién es elegible a precio mayorista), `admin.ts` (`requireAdmin` para páginas, `assertAdmin` para acciones), `paths.ts` (`safeNextPath` contra redirecciones abiertas), `notify.ts`.
- `cart/`: `pricing.ts` (puro: unidad vs mayorista con cantidad mínima), `display-pricing.ts` (lo que se muestra), `store.ts` (Zustand `ru-cart-v1`), `whatsapp.ts`.
- `viewer/`: store del visitante (estado + mapa de precios mayoristas, solo llega para elegibles) y hooks.
- `pricing/viewer.ts`: `getQuoteViewer()` → tier real y usuario desde la sesión.
- `validation/`: esquemas Zod (`quote`, `repair`, `auth`, `settings`, `admin/*`). `admin/` está en `app/admin/CLAUDE.md`.
- `admin/`: utilidades del panel (acciones, CSV, paginación, slug, imágenes).
- `email/`: plantillas HTML (todo texto de cliente pasa por `escapeHtml`) y `sendEmail` (Resend).
- `motion.ts`, `format.ts`, `seo.ts`, `icons.tsx` (lista cerrada de iconos), `rate-limit.ts`.

## Reglas

- Los módulos que tocan secretos o la base llevan `import "server-only"`.
- **Filas de vistas y `jsonb` se validan con Zod** antes de usarse (`data/mappers.ts`, `validation/settings.ts`): PostgREST declara todas las columnas de una vista como nulables y un jsonb mal formado tumbaría el sitio.
- Un producto sin variantes activas o con la categoría oculta se omite (no rompe la tienda).
- Los códigos `RU-AAAA-NNNN` / `RE-AAAA-NNNN` los genera Postgres (`next_request_code`, solo `service_role`); si no se puede guardar la solicitud no se entrega un código.
- Lo que persiste después de guardar una solicitud no debe poder lanzar: lee lo que necesites _antes_ de `createQuote`/`createRepairRequest`, o el cliente vería error de algo que sí se registró.
- El limitador de intentos (`rate-limit.ts`) es en memoria y por instancia: freno básico, no un límite compartido. En pruebas manuales con muchos inicios de sesión hay que reiniciar el servidor.
- Toda función pura con lógica (precios, filtros, esquemas, CSV) lleva prueba en `*.test.ts` al lado.
