# components/ — interfaz

## Organización

`ui/` (shadcn sobre Radix, ya adaptado), `layout/` (header, menú, footer, barra móvil), `product/` y `catalog/` (tarjetas, ficha, filtros), `cart/`, `wholesale/` (el listado público al por mayor: fila, categoría, filtros, hojas de pedido y de vendedores), `home/`, `services/`, `auth/` (solo el login), `forms/` (campos reutilizables), `admin/`, `motion/` (Reveal, Stagger, provider), `icons/`, `seo/`.

## Reglas

- **Todas las animaciones con `motion/react`** y variantes centralizadas en `lib/motion.ts`; respetan `prefers-reduced-motion`. En componentes normales se usa `m.*` (el `LazyMotion` del layout carga las funciones aparte); `Reorder` del panel usa `motion` completo y solo vive en `/admin`.
- Un componente por archivo, ≤ ~200 líneas. Extrae en vez de crecer.
- Pesado y no imprescindible al cargar → `next/dynamic` (drawer del carrito, búsqueda, panel del menú móvil, filtros, zoom, toaster, editor del admin). No dejes overlays en el bundle inicial.
- **Primer pintado**: los elementos visibles al cargar no empiezan en `opacity: 0` (`<StaggerItem immediate>` en las primeras tarjetas); lo contrario retrasa el LCP.
- **Accesibilidad**: contraste AA (`--muted-foreground` es `#5b6270` a propósito, texto verde `text-success-700`), foco visible, `aria-label` en botones de icono, un solo `h1` por página y niveles de encabezado sin saltos, mensajes de error con `role="alert"` enlazados por `aria-describedby`. `text-muted` es un color de _fondo_ de shadcn: para texto usa `text-muted-foreground`.
- **Campos de formulario**: `TextField`, `PasswordField`, `SelectField`, `TextareaField`, `SwitchField` (en `forms/`); no repitas Label+Input+Error a mano.
- El precio de un producto se pinta con `formatPrice` (RD$ 74,900); documentos (WhatsApp, correo) usan `formatMoney`.
- Los componentes públicos reciben siempre precio por unidad: el precio al por mayor no existe en la tienda (salvo `wholesale/`, que muestra el listado mayorista propio, público a propósito).
- **Hidratación**: fechas y números que se dibujan en el servidor y en el navegador no pueden depender del texto que produce `Intl` (`dateStyle`, `timeStyle`): Node y Chromium traen versiones distintas de ICU y dan cadenas distintas (", " contra " a las ", espacio normal contra `\u00a0`), y React responde con el error #418. Usa `lib/wholesale/format.ts` (`formatListingDate`, `formatCount`) o `formatToParts` quedándote solo con los números.
- Los datos del equipo (estado, batería, liberación, código) salen de `lib/catalog/unit-facts.ts`: la misma lista alimenta la ficha (`UnitDetails`) y el mensaje de WhatsApp, para que nunca digan cosas distintas.
- Los iconos de marca (Instagram, Threads) son SVG propios: `lucide-react` ya no los trae.
- Nunca pases funciones ni esquemas Zod desde un Server Component a uno de aquí; pasa datos planos.
