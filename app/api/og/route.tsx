import { ImageResponse } from "next/og";
import { z } from "zod";

const paramsSchema = z.object({
  title: z.string().trim().min(1).max(80),
  subtitle: z.string().trim().max(120).optional(),
  price: z.string().trim().max(30).optional(),
});

const FALLBACK = { title: "Raymond Unlock", subtitle: "Celulares y Más", price: undefined };

export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = paramsSchema.safeParse({
    title: searchParams.get("title") ?? undefined,
    subtitle: searchParams.get("subtitle") ?? undefined,
    price: searchParams.get("price") ?? undefined,
  });
  const { title, subtitle, price } = parsed.success ? parsed.data : FALLBACK;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        background: "#0B0B0C",
        color: "#FFFFFF",
      }}
    >
      <div style={{ display: "flex", fontSize: 40, fontWeight: 700 }}>
        <span>Raymond</span>
        <span style={{ color: "#E11B22" }}>Unlock</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ fontSize: 84, fontWeight: 700, lineHeight: 1.05 }}>{title}</div>
        {subtitle ? <div style={{ fontSize: 36, color: "#9CA3AF" }}>{subtitle}</div> : null}
        {price ? (
          <div style={{ fontSize: 48, fontWeight: 700, color: "#FFFFFF" }}>{price}</div>
        ) : null}
      </div>
      <div style={{ fontSize: 28, color: "#9CA3AF" }}>Santo Domingo, República Dominicana</div>
    </div>,
    { width: 1200, height: 630 },
  );
}
