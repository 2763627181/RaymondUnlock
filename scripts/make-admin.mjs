// Uso: pnpm admin:make correo@del.admin
//
// Da el rol de administrador a una cuenta que YA existe (registrada en /registro
// o creada en Authentication → Users). Desde la aplicación nadie puede otorgarse
// ese rol, por eso el primer admin se crea aquí, con la service role del .env.local.
import { createClient } from "@supabase/supabase-js";

// Devuelve el código de salida en vez de llamar a process.exit(): en Windows,
// salir con conexiones de red abiertas hace que Node aborte con un "Assertion failed".
async function main() {
  const email = process.argv[2]?.trim().toLowerCase();
  if (!email?.includes("@")) {
    console.error("Uso: pnpm admin:make correo@del.admin");
    return 1;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local.");
    return 1;
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase
    .from("profiles")
    .update({ role: "admin" })
    .eq("email", email)
    .select("email, role");

  if (error) {
    console.error(`No se pudo actualizar: ${error.message}`);
    return 1;
  }
  if (!data?.length) {
    console.error(
      `No hay ninguna cuenta con el correo ${email}. Regístrala primero en /registro (o créala en Supabase → Authentication → Users) y vuelve a correr el comando.`,
    );
    return 1;
  }

  console.log(`Listo: ${data[0].email} ahora es administrador. Ya puede entrar a /admin.`);
  return 0;
}

process.exitCode = await main();
