import { describe, expect, it } from "vitest";
import { verifyPaymentSignature, verifyWebhookSignature } from "../payments/signature";
import { priceOrder, type VariantRecord } from "../payments/pricing";
import { recentPaidOrders } from "../admin/analytics";
import { checkoutSchema, paymentVerifySchema } from "../validation";

// Reference values computed independently with Python's hmac module.
const SIG = "dd10dc6900b1b1b153e98a89d70d180893bd1e5b8810eb3e95e68f040adb9731";
const WEBHOOK_BODY = '{"event":"payment.captured"}';
const WEBHOOK_SIG = "d5184f12f35b3c03fdf78605e884ce20427acd4e9dd264a024c79c0921af4d07";

describe("Razorpay signatures", () => {
  it("accepts a valid checkout signature", () => {
    expect(verifyPaymentSignature("order_IluGWxBm9U8zJ8", "pay_IH4NVgf4Dreq1l", SIG, "test_secret_123")).toBe(true);
    expect(verifyPaymentSignature("order_IluGWxBm9U8zJ8", "pay_IH4NVgf4Dreq1l", SIG.toUpperCase(), "test_secret_123")).toBe(true);
  });
  it("rejects tampered data, wrong secret and malformed signatures", () => {
    expect(verifyPaymentSignature("order_OTHER", "pay_IH4NVgf4Dreq1l", SIG, "test_secret_123")).toBe(false);
    expect(verifyPaymentSignature("order_IluGWxBm9U8zJ8", "pay_IH4NVgf4Dreq1l", SIG, "wrong")).toBe(false);
    expect(verifyPaymentSignature("order_IluGWxBm9U8zJ8", "pay_IH4NVgf4Dreq1l", SIG.slice(0, 60), "test_secret_123")).toBe(false);
    expect(verifyPaymentSignature("order_IluGWxBm9U8zJ8", "pay_IH4NVgf4Dreq1l", "z".repeat(64), "test_secret_123")).toBe(false);
    expect(verifyPaymentSignature("order_IluGWxBm9U8zJ8", "pay_IH4NVgf4Dreq1l", SIG, "")).toBe(false);
  });
  it("verifies webhook bodies", () => {
    expect(verifyWebhookSignature(WEBHOOK_BODY, WEBHOOK_SIG, "whsec_abc")).toBe(true);
    expect(verifyWebhookSignature(WEBHOOK_BODY + " ", WEBHOOK_SIG, "whsec_abc")).toBe(false);
    expect(verifyWebhookSignature(WEBHOOK_BODY, null, "whsec_abc")).toBe(false);
  });
});

const product = (over: Partial<NonNullable<VariantRecord["product"]>> = {}) => ({
  id: "p1",
  name: "Whey 1kg",
  is_active: true,
  is_demo: false,
  ...over,
});
const V1 = "11111111-1111-4111-8111-111111111111";
const V2 = "22222222-2222-4222-8222-222222222222";
const variants: VariantRecord[] = [
  { id: V1, label: "1 kg · Choc", price: 2499, stock: 5, product: product() },
  { id: V2, label: "250 g", price: 999, stock: 0, product: product({ id: "p2", name: "Creatine" }) },
];

describe("server-side order pricing", () => {
  it("uses database prices and merges duplicate lines", () => {
    const r = priceOrder(
      [
        { variantId: V1, quantity: 1 },
        { variantId: V1, quantity: 2 },
      ],
      variants,
    );
    expect(r).toEqual({
      ok: true,
      amount: 7497,
      items: [{ product_id: "p1", variant_id: V1, name: "Whey 1kg", variant_label: "1 kg · Choc", unit_price: 2499, quantity: 3 }],
    });
  });
  it("rejects stock problems, demo, hidden and unknown products", () => {
    expect(priceOrder([{ variantId: V1, quantity: 6 }], variants)).toMatchObject({ ok: false, error: expect.stringContaining("Only 5 left") });
    expect(priceOrder([{ variantId: V2, quantity: 1 }], variants)).toMatchObject({ ok: false, error: expect.stringContaining("out of stock") });
    expect(priceOrder([{ variantId: V1, quantity: 1 }], [{ ...variants[0], product: product({ is_demo: true }) }])).toMatchObject({ ok: false });
    expect(priceOrder([{ variantId: V1, quantity: 1 }], [{ ...variants[0], product: product({ is_active: false }) }])).toMatchObject({ ok: false });
    expect(priceOrder([{ variantId: "33333333-3333-4333-8333-333333333333", quantity: 1 }], variants)).toMatchObject({ ok: false });
    expect(priceOrder([], variants)).toMatchObject({ ok: false });
  });
});

describe("checkout validation", () => {
  it("requires uuid variants and valid contact details", () => {
    const ok = checkoutSchema.safeParse({ name: "Asha", phone: "98765 43210", email: "", items: [{ variantId: V1, quantity: 2 }] });
    expect(ok.success && ok.data.email).toBe(null);
    expect(checkoutSchema.safeParse({ name: "Asha", phone: "98765 43210", items: [{ variantId: "demo-1-v1", quantity: 1 }] }).success).toBe(false);
    expect(checkoutSchema.safeParse({ name: "Asha", phone: "123", items: [{ variantId: V1, quantity: 1 }] }).success).toBe(false);
    expect(checkoutSchema.safeParse({ name: "Asha", phone: "9876543210", items: [{ variantId: V1, quantity: 21 }] }).success).toBe(false);
  });
  it("only accepts Razorpay-shaped verification payloads", () => {
    expect(paymentVerifySchema.safeParse({ razorpay_order_id: "order_A1", razorpay_payment_id: "pay_B2", razorpay_signature: SIG }).success).toBe(true);
    expect(paymentVerifySchema.safeParse({ razorpay_order_id: "x", razorpay_payment_id: "pay_B2", razorpay_signature: SIG }).success).toBe(false);
  });
});

describe("recentPaidOrders", () => {
  it("counts only paid states within the window", () => {
    const now = new Date("2026-11-30T00:00:00Z");
    const rows = [
      { status: "paid", paid_at: "2026-11-29T00:00:00Z", created_at: "2026-11-29T00:00:00Z" },
      { status: "collected", paid_at: "2026-11-10T00:00:00Z", created_at: "2026-11-10T00:00:00Z" },
      { status: "pending", paid_at: null, created_at: "2026-11-29T00:00:00Z" },
      { status: "cancelled", paid_at: "2026-11-29T00:00:00Z", created_at: "2026-11-29T00:00:00Z" },
      { status: "paid", paid_at: "2026-09-01T00:00:00Z", created_at: "2026-09-01T00:00:00Z" },
    ];
    expect(recentPaidOrders(rows, 30, now)).toHaveLength(2);
  });
});
