import "server-only";
import { isServiceConfigured } from "../supabase/service";
import { RAZORPAY_KEY_ID, onlinePaymentsEnabled } from "./index";

export const RAZORPAY_KEY_SECRET = (process.env.RAZORPAY_KEY_SECRET ?? "").trim();
export const RAZORPAY_WEBHOOK_SECRET = (process.env.RAZORPAY_WEBHOOK_SECRET ?? "").trim();
const RAZORPAY_API = (process.env.RAZORPAY_API_BASE ?? "https://api.razorpay.com").replace(/\/$/, "");

/** Lists any missing server configuration (names only — never values). */
export function missingPaymentConfig(): string[] {
  const missing: string[] = [];
  if (!onlinePaymentsEnabled()) missing.push("NEXT_PUBLIC_PAYMENTS_ENABLED / NEXT_PUBLIC_RAZORPAY_KEY_ID");
  if (!RAZORPAY_KEY_SECRET) missing.push("RAZORPAY_KEY_SECRET");
  if (!isServiceConfigured()) missing.push("NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
  return missing;
}

export type RazorpayOrder = { id: string; amount: number; currency: string; status: string };

/** Creates a Razorpay order. Amount is in paise. */
export async function createRazorpayOrder(input: {
  amountPaise: number;
  receipt: string;
  notes?: Record<string, string>;
}): Promise<RazorpayOrder> {
  const res = await fetch(`${RAZORPAY_API}/v1/orders`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Basic ${Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString("base64")}`,
    },
    body: JSON.stringify({
      amount: input.amountPaise,
      currency: "INR",
      receipt: input.receipt.slice(0, 40),
      notes: input.notes ?? {},
    }),
    cache: "no-store",
  });
  if (!res.ok) {
    let detail = "";
    try {
      const body = (await res.json()) as { error?: { description?: string } };
      detail = body.error?.description ?? "";
    } catch {
      /* ignore */
    }
    throw new Error(`Razorpay order creation failed (${res.status})${detail ? `: ${detail}` : ""}`);
  }
  return (await res.json()) as RazorpayOrder;
}
