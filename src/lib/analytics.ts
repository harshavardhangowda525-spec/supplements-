"use client";

import type { AnalyticsEvent } from "./validation";

/**
 * Privacy-conscious, first-party event tracking:
 * - no cookies, no IP or user-agent storage, no third-party scripts
 * - a random per-tab session id kept in sessionStorage only
 * - honours the browser's Do Not Track / Global Privacy Control signals
 * Events record website activity (clicks, views) — never confirmed sales.
 */
function sessionId(): string | undefined {
  try {
    let id = sessionStorage.getItem("fz-sid");
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem("fz-sid", id);
    }
    return id;
  } catch {
    return undefined;
  }
}

function optedOut(): boolean {
  if (typeof navigator === "undefined") return true;
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
  return nav.doNotTrack === "1" || nav.globalPrivacyControl === true;
}

export function track(
  event: AnalyticsEvent,
  data: { productSlug?: string; meta?: Record<string, string | number | boolean> } = {},
): void {
  if (typeof window === "undefined" || optedOut()) return;
  const body = JSON.stringify({
    event,
    path: window.location.pathname,
    productSlug: data.productSlug,
    sessionId: sessionId(),
    meta: data.meta,
  });
  try {
    const blob = new Blob([body], { type: "application/json" });
    if (navigator.sendBeacon?.("/api/track", blob)) return;
  } catch {
    /* fall through */
  }
  fetch("/api/track", { method: "POST", body, headers: { "content-type": "application/json" }, keepalive: true }).catch(
    () => {},
  );
}
