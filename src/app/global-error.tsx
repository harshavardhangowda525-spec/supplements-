"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset?: () => void }) {
  return (
    <html lang="en-IN">
      <body style={{ background: "#080A09", color: "#fff", fontFamily: "system-ui, sans-serif", display: "grid", placeItems: "center", minHeight: "100vh", margin: 0 }}>
        <div style={{ textAlign: "center", padding: 24 }}>
          <h1 style={{ fontSize: 32, marginBottom: 12 }}>Something went wrong</h1>
          <p style={{ color: "#A6AAA7", marginBottom: 24 }}>Please refresh the page or call Fitzone Supplements on +91 96868 60337.</p>
          <button
            type="button"
            onClick={() => (reset ? reset() : window.location.reload())}
            style={{ background: "#C6FF00", color: "#080A09", border: 0, borderRadius: 999, padding: "12px 24px", fontWeight: 700, cursor: "pointer" }}
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
