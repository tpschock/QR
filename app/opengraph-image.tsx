import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
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
          backgroundColor: "#122236",
        }}
      >
        <div
          style={{
            width: 160,
            height: 160,
            borderRadius: "50%",
            backgroundColor: "#264A70",
            display: "flex",
            marginBottom: 40,
          }}
        />
        <div
          style={{
            fontSize: 96,
            fontWeight: 700,
            color: "#ffffff",
            letterSpacing: 4,
          }}
        >
          FOCUS
        </div>
        <div
          style={{
            fontSize: 32,
            fontWeight: 600,
            color: "#9AAFC4",
            letterSpacing: 10,
            marginTop: 12,
          }}
        >
          COMMERCIAL REAL ESTATE
        </div>
      </div>
    ),
    { ...size }
  );
}
