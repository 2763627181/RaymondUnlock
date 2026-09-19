import { z } from "zod";

export interface ActionFailure {
  ok: false;
  message: string;
  fieldErrors?: Record<string, string[] | undefined>;
}

/** Forma común de las Server Actions del panel y de la cuenta: nunca lanzan hacia el cliente. */
export type ActionResult<T = void> = { ok: true; data: T } | ActionFailure;

export function failure(message: string): ActionFailure {
  return { ok: false, message };
}

export function validationFailure(error: z.ZodError): ActionFailure {
  const { fieldErrors, formErrors } = z.flattenError(error);
  return {
    ok: false,
    message: formErrors[0] ?? "Revisa los datos del formulario.",
    fieldErrors,
  };
}

export function success(): ActionResult<void>;
export function success<T>(data: T): ActionResult<T>;
export function success<T>(data?: T): ActionResult<T | undefined> {
  return { ok: true, data };
}
