# app/admin/ — panel de administración

## Autorización (defensa en capas)

1. `proxy.ts`: sin sesión → `/login?next=…`.
2. `layout.tsx`: `requireAdmin()` (sin sesión → login; con sesión pero sin rol admin → 404, algo que no debería pasar porque el login rechaza esas cuentas). `not-found.tsx` da el 404 dentro del panel para ids que no existen.
3. **Cada página** vuelve a llamar `await requireAdmin("/ruta")`: los layouts se renderizan en paralelo con la página y no se re-ejecutan al navegar dentro del panel, así que el layout solo no alcanza. Es gratis: `getViewer()` está memoizado por petición.
4. **Cada Server Action** entra por `withAdmin()` (`lib/admin/action-helpers.ts`), que verifica el rol otra vez y convierte excepciones en mensajes. Se comprobó repitiendo la petición de una acción real como anónimo y como usuario sin rol admin: ninguna escribe.
5. La base: el RLS sigue siendo la última barrera. Se usa el cliente con la **sesión del admin** (`ctx.supabase`) siempre que el RLS lo permite; `service_role` (`createAdminClient()`) solo para lo que está cerrado a la API: `product_variants` (precio mayorista) y borrar de Storage. El historial (`product_history`) lo lee la sesión del admin.

## Patrón de una acción

```ts
"use server";
export async function saveX(input: unknown): Promise<ActionResult<{ id: string }>> {
  return withAdmin(async ({ supabase }) => {
    const parsed = xSchema.safeParse(input);
    if (!parsed.success) return validationFailure(parsed.error);
    // escribir con supabase (RLS) o con createAdminClient() si es product_variants
    // errores de Postgres → dbFailure(error, { unique: "mensaje", foreignKey: "mensaje" })
    publish("catalog"); // expira caché + páginas estáticas: la tienda lo ve al instante
    return success({ id });
  });
}
```

- `publish("catalog" | "settings" | "services" | "banners")` usa `updateTag` + `revalidatePath("/", "layout")`. Sin esto la tienda tarda hasta 5 min en cambiar.
- Los esquemas viven en `lib/validation/admin/*` y `lib/validation/settings.ts` y se comparten con el formulario. **Sus transformaciones deben ser idempotentes** (aceptar su propia salida): el formulario manda al servidor los valores ya parseados y el servidor los valida de nuevo (`brandId: null`, `colorHex: undefined`, `deviceTypes: [...]`). Hay pruebas para eso en `admin-schemas.test.ts`; agrega una si añades un esquema con `.transform`.
- Nunca se borra un producto (ni una variante) con cotizaciones asociadas: se desactiva. Categorías, marcas y servicios en uso tampoco se borran (mensaje claro).
- Las imágenes solo pueden venir de `/…` local o de nuestro bucket público (`isAllowedImageUrl`): `next/image` lanza error con hosts no permitidos y tumbaría la página pública.
- Storage: las URLs públicas se cachean en el CDN → subir siempre con nombre nuevo; borrar solo lo que ningún producto/banner referencia (`unreferencedImageUrls`).

## Formularios y UX

- React Hook Form + `zodResolver` con el mismo esquema del servidor; `FormProvider` cuando el formulario se reparte entre sub-componentes (`ProductForm`).
- `useFieldArray` con variantes usa `keyName: "fieldKey"` (el `id` es el de la base de datos).
- Tras guardar bien, `reset(valoresGuardados)`: si no, `isDirty` mide contra los valores con que se abrió el formulario.
- Estados optimistas con `useOptimistic` (cambio de estado, publicar/ocultar); si la acción falla vuelve solo.
- Listas reordenables: `SortableList` (Motion `Reorder`) con asa y flechas (teclado). Confirmación antes de borrar: `ConfirmButton`.
- Cuando un aviso (toast) está visible, `Escape` cierra primero el aviso y luego el diálogo (capas de Radix).
