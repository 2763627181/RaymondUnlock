"use client";

/** Último recurso: falla el layout raíz, así que no puede depender de estilos ni de componentes. */
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es-DO">
      <body
        style={{
          margin: 0,
          minHeight: "100svh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
          padding: 24,
        }}
      >
        <h1 style={{ fontSize: 28, margin: 0 }}>Algo salió mal</h1>
        <p style={{ color: "#6b7280", margin: 0 }}>
          No pudimos cargar el sitio. Inténtalo de nuevo en unos segundos.
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            background: "#c2161c",
            color: "#fff",
            border: 0,
            borderRadius: 12,
            padding: "12px 24px",
            fontSize: 16,
            cursor: "pointer",
          }}
        >
          Intentar de nuevo
        </button>
      </body>
    </html>
  );
}
