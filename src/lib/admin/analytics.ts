import type { Product } from "../types";
import { LOW_STOCK_THRESHOLD } from "../format";

export type EventRow = { event_type: string; product_slug: string | null; session_id: string | null; created_at: string };

export type AnalyticsSummary = {
  totals: {
    pageViews: number;
    sessions: number;
    productViews: number;
    whatsappClicks: number;
    addToCart: number;
    cartCheckouts: number;
    calls: number;
    directions: number;
  };
  daily: { date: string; label: string; views: number }[];
  topViewed: { slug: string; count: number }[];
  topCarted: { slug: string; count: number }[];
};

/** Pure aggregation of raw analytics events (unit-tested). */
export function summarise(events: EventRow[], days = 14, now = new Date()): AnalyticsSummary {
  const count = (t: string) => events.filter((e) => e.event_type === t).length;
  const sessions = new Set(events.map((e) => e.session_id).filter(Boolean)).size;

  const dayKeys: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setUTCDate(d.getUTCDate() - i);
    dayKeys.push(d.toISOString().slice(0, 10));
  }
  const perDay = new Map(dayKeys.map((k) => [k, 0]));
  for (const e of events) {
    if (e.event_type !== "page_view") continue;
    const k = e.created_at.slice(0, 10);
    if (perDay.has(k)) perDay.set(k, (perDay.get(k) ?? 0) + 1);
  }

  const top = (type: string) => {
    const m = new Map<string, number>();
    for (const e of events) if (e.event_type === type && e.product_slug) m.set(e.product_slug, (m.get(e.product_slug) ?? 0) + 1);
    return [...m.entries()].map(([slug, c]) => ({ slug, count: c })).sort((a, b) => b.count - a.count).slice(0, 5);
  };

  return {
    totals: {
      pageViews: count("page_view"),
      sessions,
      productViews: count("product_view"),
      whatsappClicks: count("whatsapp_click"),
      addToCart: count("add_to_cart"),
      cartCheckouts: count("cart_whatsapp_checkout"),
      calls: count("call_click"),
      directions: count("directions_click"),
    },
    daily: dayKeys.map((k) => ({
      date: k,
      label: new Date(`${k}T00:00:00Z`).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "UTC" }),
      views: perDay.get(k) ?? 0,
    })),
    topViewed: top("product_view"),
    topCarted: top("add_to_cart"),
  };
}

export function inventorySummary(products: Product[]) {
  const variants = products.flatMap((p) => p.variants.map((v) => ({ product: p, variant: v })));
  return {
    products: products.length,
    active: products.filter((p) => p.isActive).length,
    variants: variants.length,
    outOfStock: variants.filter((x) => x.variant.stock <= 0),
    lowStock: variants.filter((x) => x.variant.stock > 0 && x.variant.stock <= LOW_STOCK_THRESHOLD),
    units: variants.reduce((s, x) => s + Math.max(0, x.variant.stock), 0),
  };
}

const PAID_STATES = ["paid", "ready", "collected"];

/** Orders confirmed as paid within the last `days` days. */
export function recentPaidOrders<T extends { status: string; paid_at: string | null; created_at: string }>(
  orders: T[],
  days = 30,
  now: Date = new Date(),
): T[] {
  const since = now.getTime() - days * 86_400_000;
  return orders.filter((o) => PAID_STATES.includes(o.status) && new Date(o.paid_at ?? o.created_at).getTime() >= since);
}
