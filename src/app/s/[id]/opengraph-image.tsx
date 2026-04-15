import { ImageResponse } from "next/og";
import { getReceipt } from "@/lib/kv";

export const runtime = "edge";
export const alt = "paymebackpls receipt";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const receipt = await getReceipt(id);

  const payerName = receipt?.payerName || "Someone";
  const description = receipt?.description || "A bill to split";
  const itemCount = receipt?.items.length || 0;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#F7F6F3",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              fontSize: "56px",
              fontWeight: 400,
              color: "#111111",
              letterSpacing: "-0.02em",
            }}
          >
            pay{payerName}backpls
          </div>
          <div
            style={{
              fontSize: "28px",
              color: "#6B6B6B",
              marginTop: "8px",
            }}
          >
            {description}
          </div>
          <div
            style={{
              fontSize: "22px",
              color: "#787878",
              marginTop: "4px",
            }}
          >
            {itemCount} item{itemCount !== 1 ? "s" : ""} to split · tap to claim yours
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
