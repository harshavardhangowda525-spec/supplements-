/**
 * Route-level tests for the Razorpay flow with an in-memory Supabase fake and a
 * mocked Razorpay Orders API. (The mark_order_paid SQL itself is exercised
 * against Postgres separately — this fake mirrors its behaviour.)
 */
import { createHmac } from "node:crypto";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

type Row = Record<string, unknown>;
const V1 = "11111111-1111-4111-8111-111111111111";
const VDEMO = "22222222-2222-4222-8222-222222222222";

const db: { product_variants: Row[]; orders: Row[] } = { product_variants: [], orders: [] };

function reset() {
  db.product_variants = [
    { id: V1, label: "1 kg · Chocolate", price: 2499, stock: 5, product: { id: "p1", name: "Whey 1kg", is_active: true, is_demo: false } },
    { id: VDEMO, label: "Sample", price: 100, stock: 9, product: { id: "p2", name: "Demo Whey", is_active: true, is_demo: true } },
  ];
  db.orders = [];
}

class Query {
  private filters: ((r: Row) => boolean)[] = [];
  private op: "select" | "insert" | "update" = "select";
  private payload: Row = {};
  private mode: "many" | "single" | "maybe" = "many";
  constructor(private table: keyof typeof db) {}
  select() {
    return this;
  }
  insert(row: Row) {
    this.op = "insert";
    this.payload = row;
    return this;
  }
  update(patch: Row) {
    this.op = "update";
    this.payload = patch;
    return this;
  }
  eq(col: string, val: unknown) {
    this.filters.push((r) => r[col] === val);
    return this;
  }
  in(col: string, vals: unknown[]) {
    this.filters.push((r) => vals.includes(r[col]));
    return this;
  }
  single() {
    this.mode = "single";
    return this;
  }
  maybeSingle() {
    this.mode = "maybe";
    return this;
  }
  private run() {
    const rows = db[this.table];
    let out: Row[];
    if (this.op === "insert") {
      const row = { id: crypto.randomUUID(), order_number: `FZ-TEST-${rows.length + 1}`, ...this.payload };
      rows.push(row);
      out = [row];
    } else {
      out = rows.filter((r) => this.filters.every((f) => f(r)));
      if (this.op === "update") out.forEach((r) => Object.assign(r, this.payload));
    }
    const data = this.mode === "many" ? out : (out[0] ?? null);
    return { data, error: null };
  }
  // Makes the builder awaitable, like supabase-js query builders.
  then(ok?: (v: { data: unknown; error: null }) => unknown, fail?: (e: unknown) => unknown) {
    return Promise.resolve(this.run()).then(ok, fail);
  }
}

const fakeClient = {
  from: (t: keyof typeof db) => new Query(t),
  rpc: async (name: string, args: { p_razorpay_order_id: string; p_payment_id: string }) => {
    if (name !== "mark_order_paid") throw new Error("unexpected rpc");
    const order = db.orders.find((o) => o.razorpay_order_id === args.p_razorpay_order_id && ["pending", "failed"].includes(o.status as string));
    if (!order) return { data: false, error: null };
    Object.assign(order, { status: "paid", razorpay_payment_id: args.p_payment_id, paid_at: new Date().toISOString() });
    for (const item of order.items as { variant_id: string; quantity: number }[]) {
      const v = db.product_variants.find((x) => x.id === item.variant_id)!;
      v.stock = Math.max((v.stock as number) - item.quantity, 0);
    }
    return { data: true, error: null };
  },
};

vi.mock("@/lib/supabase/service", () => ({
  isServiceConfigured: () => true,
  createServiceClient: () => fakeClient,
}));

const SECRET = "rzp_secret_test";
const WEBHOOK_SECRET = "whsec_test";
let orderRoute: typeof import("./order/route");
let verifyRoute: typeof import("./verify/route");
let webhookRoute: typeof import("./webhook/route");
let razorpayCalls: { auth: string | null; body: Row }[] = [];

beforeAll(async () => {
  process.env.NEXT_PUBLIC_PAYMENTS_ENABLED = "true";
  process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID = "rzp_test_abc";
  process.env.RAZORPAY_KEY_SECRET = SECRET;
  process.env.RAZORPAY_WEBHOOK_SECRET = WEBHOOK_SECRET;
  orderRoute = await import("./order/route");
  verifyRoute = await import("./verify/route");
  webhookRoute = await import("./webhook/route");
});

beforeEach(() => {
  reset();
  razorpayCalls = [];
  vi.spyOn(globalThis, "fetch").mockImplementation(async (url, init) => {
    expect(String(url)).toBe("https://api.razorpay.com/v1/orders");
    const body = JSON.parse(String(init?.body)) as Row;
    razorpayCalls.push({ auth: new Headers(init?.headers).get("authorization"), body });
    return Response.json({ id: "order_RZP123", amount: body.amount, currency: "INR", status: "created" });
  });
});
afterEach(() => vi.restoreAllMocks());

const post = (body: unknown, headers: Record<string, string> = {}) =>
  new Request("http://localhost/api", { method: "POST", body: typeof body === "string" ? body : JSON.stringify(body), headers: { "content-type": "application/json", ...headers } });

const checkout = (items: { variantId: string; quantity: number }[]) =>
  orderRoute.POST(post({ name: "Asha Rao", phone: "+91 98765 43210", email: "", items }));

describe("POST /api/payments/razorpay/order", () => {
  it("prices from the database and creates a Razorpay order in paise", async () => {
    const res = await checkout([{ variantId: V1, quantity: 2 }]);
    expect(res.status).toBe(200);
    const json = (await res.json()) as Row;
    expect(json).toMatchObject({ razorpayOrderId: "order_RZP123", amount: 499800, currency: "INR", keyId: "rzp_test_abc" });
    expect(json).not.toHaveProperty("secret");
    expect(razorpayCalls[0].auth).toBe(`Basic ${Buffer.from(`rzp_test_abc:${SECRET}`).toString("base64")}`);
    expect(razorpayCalls[0].body).toMatchObject({ amount: 499800, currency: "INR" });
    expect(db.orders[0]).toMatchObject({ status: "pending", amount: 4998, razorpay_order_id: "order_RZP123", customer_phone: "+919876543210" });
  });

  it("refuses demo products and over-stock quantities without calling Razorpay", async () => {
    expect((await checkout([{ variantId: VDEMO, quantity: 1 }])).status).toBe(409);
    expect((await checkout([{ variantId: V1, quantity: 6 }])).status).toBe(409);
    expect(razorpayCalls).toHaveLength(0);
    expect(db.orders).toHaveLength(0);
  });

  it("marks the order failed if Razorpay is down", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("{}", { status: 500 }));
    const res = await checkout([{ variantId: V1, quantity: 1 }]);
    expect(res.status).toBe(502);
    expect(db.orders[0].status).toBe("failed");
  });
});

describe("POST /api/payments/razorpay/verify", () => {
  const sign = (o: string, p: string) => createHmac("sha256", SECRET).update(`${o}|${p}`).digest("hex");

  it("marks the order paid once and reduces stock", async () => {
    await checkout([{ variantId: V1, quantity: 2 }]);
    const payload = { razorpay_order_id: "order_RZP123", razorpay_payment_id: "pay_ABC", razorpay_signature: sign("order_RZP123", "pay_ABC") };
    const res = await verifyRoute.POST(post(payload));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, orderId: db.orders[0].id });
    expect(db.orders[0]).toMatchObject({ status: "paid", razorpay_payment_id: "pay_ABC" });
    expect(db.product_variants[0].stock).toBe(3);
    // Retrying is harmless.
    expect((await verifyRoute.POST(post(payload))).status).toBe(200);
    expect(db.product_variants[0].stock).toBe(3);
  });

  it("rejects a forged signature", async () => {
    await checkout([{ variantId: V1, quantity: 1 }]);
    const res = await verifyRoute.POST(
      post({ razorpay_order_id: "order_RZP123", razorpay_payment_id: "pay_ABC", razorpay_signature: sign("order_RZP123", "pay_OTHER") }),
    );
    expect(res.status).toBe(400);
    expect(db.orders[0].status).toBe("pending");
  });
});

describe("POST /api/payments/razorpay/webhook", () => {
  const hook = (body: object, secret = WEBHOOK_SECRET) => {
    const raw = JSON.stringify(body);
    return webhookRoute.POST(post(raw, { "x-razorpay-signature": createHmac("sha256", secret).update(raw).digest("hex") }));
  };

  it("confirms payment from a signed payment.captured event", async () => {
    await checkout([{ variantId: V1, quantity: 1 }]);
    const res = await hook({ event: "payment.captured", payload: { payment: { entity: { id: "pay_WH1", order_id: "order_RZP123" } } } });
    expect(res.status).toBe(200);
    expect(db.orders[0]).toMatchObject({ status: "paid", razorpay_payment_id: "pay_WH1" });
  });

  it("ignores events with a bad signature", async () => {
    await checkout([{ variantId: V1, quantity: 1 }]);
    const res = await hook({ event: "payment.captured", payload: { payment: { entity: { id: "pay_X", order_id: "order_RZP123" } } } }, "wrong");
    expect(res.status).toBe(400);
    expect(db.orders[0].status).toBe("pending");
  });

  it("records payment.failed for pending orders", async () => {
    await checkout([{ variantId: V1, quantity: 1 }]);
    await hook({ event: "payment.failed", payload: { payment: { entity: { id: "pay_F", order_id: "order_RZP123" } } } });
    expect(db.orders[0].status).toBe("failed");
  });
});
