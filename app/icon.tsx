import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

/** Monograma provisional hasta que el cliente entregue el logo sin fondo (ver README). */
export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0B0B0C",
        borderRadius: 112,
        color: "#FFFFFF",
        fontSize: 240,
        fontWeight: 700,
        letterSpacing: -8,
      }}
    >
      R<span style={{ color: "#E11B22" }}>U</span>
    </div>,
    size,
  );
}
