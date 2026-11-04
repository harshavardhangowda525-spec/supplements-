import { describe, expect, it } from "vitest";
import { defaultVariant, discountPercent, formatINR, slugify, stockLabel, stockStatus } from "../format";
import { analyticsSchema, inquirySchema, productInputSchema, reviewSchema } from "../validation";
import { DEMO_CATEGORIES, DEMO_PRODUCTS } from "../demo-data";
import { summarise } from "../admin/analytics";

describe("format helpers", () => {
  it("formats INR", () => {
    expect(formatINR(2499)).toBe("₹2,499");
    expect(formatINR(125000)).toBe("₹1,25,000");
  });
  it("only shows a discount when MRP is higher", () => {
    expect(discountPercent({ price: 800, mrp: 1000 })).toBe(20);
    expect(discountPercent({ price: 1000, mrp: 1000 })).toBeNull();
    expect(discountPercent({ price: 1000, mrp: null })).toBeNull();
  });
  it("labels stock", () => {
    expect(stockStatus(0)).toBe("out_of_stock");
    expect(stockLabel(3)).toBe("Only 3 left");
    expect(stockStatus(20)).toBe("in_stock");
  });
  it("picks the cheapest in-stock default variant", () => {
    const p = DEMO_PRODUCTS.find((x) => x.slug === "demo-whey-isolate")!;
    expect(defaultVariant(p).stock).toBeGreaterThan(0);
  });
  it("slugifies", () => {
    expect(slugify("  Whey Protein 2kg — Chocolate! ")).toBe("whey-protein-2kg-chocolate");
  });
});

describe("demo catalogue honesty", () => {
  it("marks every sample product as demo, with no invented label data", () => {
    for (const p of DEMO_PRODUCTS) {
      expect(p.isDemo).toBe(true);
      expect(p.brand).toMatch(/^Sample Brand/);
      expect(p.ingredients).toBeNull();
      expect(p.nutrition).toBeNull();
      expect(p.usage).toBeNull();
      expect(p.authenticity).toBeNull();
      expect(DEMO_CATEGORIES.some((c) => c.slug === p.categorySlug)).toBe(true);
    }
  });
});

describe("server-side validation", () => {
  it("accepts a valid Indian mobile and normalises it", () => {
    const r = inquirySchema.parse({ name: "Ravi", phone: "+91 98765-43210", message: "Is creatine in stock?" });
    expect(r.phone).toBe("+919876543210");
  });
  it("rejects bad phones, short messages and honeypot", () => {
    expect(inquirySchema.safeParse({ name: "Ravi", phone: "12345", message: "hello there" }).success).toBe(false);
    expect(inquirySchema.safeParse({ name: "Ravi", phone: "9876543210", message: "hi" }).success).toBe(false);
    expect(inquirySchema.safeParse({ name: "Ravi", phone: "9876543210", message: "hello there", website: "spam" }).success).toBe(false);
  });
  it("validates reviews", () => {
    expect(reviewSchema.safeParse({ name: "Asha", rating: "5", comment: "Very helpful staff!" }).success).toBe(true);
    expect(reviewSchema.safeParse({ name: "Asha", rating: "7", comment: "Very helpful staff!" }).success).toBe(false);
  });
  it("whitelists analytics events", () => {
    expect(analyticsSchema.safeParse({ event: "whatsapp_click", path: "/shop" }).success).toBe(true);
    expect(analyticsSchema.safeParse({ event: "purchase" }).success).toBe(false);
    expect(analyticsSchema.safeParse({ event: "page_view", path: "https://evil.example" }).success).toBe(false);
  });
  it("validates admin product input", () => {
    const base = {
      name: "Whey",
      slug: "whey",
      brand: "Brand",
      categoryId: "6f1c1f9e-6c7a-4d2b-9a43-2b7f9b6f0d11",
      variants: [{ label: "1 kg", price: "2499", mrp: "", stock: "4" }],
    };
    const r = productInputSchema.parse(base);
    expect(r.variants[0]).toMatchObject({ price: 2499, mrp: null, stock: 4, flavor: null });
    expect(productInputSchema.safeParse({ ...base, slug: "Bad Slug" }).success).toBe(false);
    expect(productInputSchema.safeParse({ ...base, variants: [] }).success).toBe(false);
  });
});

describe("analytics summary", () => {
  it("aggregates events without mixing in sales", () => {
    const now = new Date("2026-11-04T12:00:00Z");
    const s = summarise(
      [
        { event_type: "page_view", product_slug: null, session_id: "a", created_at: "2026-11-04T10:00:00Z" },
        { event_type: "page_view", product_slug: null, session_id: "b", created_at: "2026-11-03T10:00:00Z" },
        { event_type: "product_view", product_slug: "whey", session_id: "a", created_at: "2026-11-04T10:01:00Z" },
        { event_type: "product_view", product_slug: "whey", session_id: "b", created_at: "2026-11-04T10:01:00Z" },
        { event_type: "whatsapp_click", product_slug: "whey", session_id: "a", created_at: "2026-11-04T10:02:00Z" },
      ],
      7,
      now,
    );
    expect(s.totals.pageViews).toBe(2);
    expect(s.totals.sessions).toBe(2);
    expect(s.totals.whatsappClicks).toBe(1);
    expect(s.daily).toHaveLength(7);
    expect(s.daily.at(-1)).toMatchObject({ date: "2026-11-04", views: 1 });
    expect(s.topViewed[0]).toEqual({ slug: "whey", count: 2 });
  });
});
