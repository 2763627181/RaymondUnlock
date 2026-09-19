import type { ActionResult } from "@/lib/actions/result";
import { toast } from "@/lib/toast-store";

/**
 * Ejecuta una Server Action del panel y avisa del resultado con un toast: éxito
 * (si se da un título) o el mensaje de error que devolvió el servidor. También
 * cubre que la petición misma falle (sin red, sesión vencida).
 */
export async function runAction<T>(
  action: Promise<ActionResult<T>>,
  successTitle?: string,
): Promise<ActionResult<T>> {
  try {
    const result = await action;
    if (!result.ok) {
      toast({
        title: "No se pudo completar",
        description: result.message,
        variant: "destructive",
      });
    } else if (successTitle) {
      toast({ title: successTitle, variant: "success" });
    }
    return result;
  } catch {
    const message = "No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.";
    toast({ title: "No se pudo completar", description: message, variant: "destructive" });
    return { ok: false, message };
  }
}
