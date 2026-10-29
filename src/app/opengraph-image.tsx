import { ImageResponse } from "next/og";
import { DATA } from "@/data/resume";

export const alt = DATA.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
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
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Ambient orbs */}
        <div style={{ position: "absolute", top: 80, left: 120, width: 300, height: 300, borderRadius: "50%", background: "rgba(99,102,241,0.15)", filter: "blur(80px)" }} />
        <div style={{ position: "absolute", bottom: 80, right: 120, width: 250, height: 250, borderRadius: "50%", background: "rgba(168,85,247,0.12)", filter: "blur(60px)" }} />

        {/* Card */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
            padding: "48px 64px",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 24,
          }}
        >
          <div style={{ fontSize: 56, fontWeight: 700, color: "#f8fafc", letterSpacing: "-1px" }}>
            {DATA.name}
          </div>
          <div style={{ fontSize: 24, color: "rgba(248,250,252,0.6)", fontWeight: 400 }}>
            Software Engineer · SAP Integration · AI Systems
          </div>
          <div
            style={{
              marginTop: 8,
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 20px",
              background: "rgba(99,102,241,0.2)",
              borderRadius: 999,
              border: "1px solid rgba(99,102,241,0.3)",
            }}
          >
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ade80" }} />
            <span style={{ color: "rgba(248,250,252,0.8)", fontSize: 16 }}>Open to opportunities</span>
          </div>
        </div>

        {/* Domain */}
        <div style={{ position: "absolute", bottom: 32, color: "rgba(248,250,252,0.3)", fontSize: 16 }}>
          {DATA.url.replace("https://", "")}
        </div>
      </div>
    ),
    { ...size }
  );
}
