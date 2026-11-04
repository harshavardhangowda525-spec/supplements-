import { ImageResponse } from "next/og";

export const alt = "Fitzone Supplements — Fuel your strength. Power every rep.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "radial-gradient(circle at 80% 30%, rgba(198,255,0,0.28), #080A09 55%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: "#C6FF00", display: "flex", alignItems: "center", justifyContent: "center", color: "#080A09", fontSize: 40, fontWeight: 900 }}>
            F
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 40, fontWeight: 900, letterSpacing: 2 }}>FITZONE</span>
            <span style={{ fontSize: 16, color: "#C6FF00", letterSpacing: 8 }}>SUPPLEMENTS</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: 110, fontWeight: 900, lineHeight: 1 }}>FUEL YOUR</span>
          <span style={{ fontSize: 110, fontWeight: 900, lineHeight: 1, color: "#C6FF00" }}>STRENGTH.</span>
          <span style={{ fontSize: 30, marginTop: 24, color: "#A6AAA7" }}>Gym supplements & sports nutrition · Nagarabhavi, Bengaluru</span>
        </div>
      </div>
    ),
    size,
  );
}
