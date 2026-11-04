import { paymentVerifySchema } from "@/lib/validation";
import { createServiceClient } from "@/lib/supabase/service";
import { verifyPaymentSignature } from "@/lib/payments/signature";
import { RAZORPAY_KEY_SECRET, missingPaymentConfig } from "@/lib/payments/server";

const PAID_STATES = ["paid", "ready", "collected"];

/** Verifies the Razorpay Checkout signature, then marks the order paid (once). */
export async function POST(request: Request) {
  if (missingPaymentConfig().length) return Response.json({ error: "Online payment isn’t set up." }, { status: 503 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  const parsed = paymentVerifySchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Invalid payment details." }, { status: 400 });

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = parsed.data;
  if (!verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature, RAZORPAY_KEY_SECRET)) {
    console.warn("[payments] signature mismatch for", razorpay_order_id);
    return Response.json({ error: "We couldn’t verify this payment. If money was deducted, contact the store with your payment ID." }, { status: 400 });
  }

  const sb = createServiceClient()!;
  const { error: rpcErr } = await sb.rpc("mark_order_paid", {
    p_razorpay_order_id: razorpay_order_id,
    p_payment_id: razorpay_payment_id,
  });
  if (rpcErr) {
    console.error("[payments] mark_order_paid failed:", rpcErr.message);
    return Response.json({ error: "Payment received but we couldn’t update your order. Please contact the store." }, { status: 500 });
  }

  const { data: order } = await sb.from("orders").select("id, status").eq("razorpay_order_id", razorpay_order_id).maybeSingle();
  if (!order || !PAID_STATES.includes(order.status)) {
    return Response.json({ error: "Order not found. Please contact the store with your payment ID." }, { status: 404 });
  }
  return Response.json({ ok: true, orderId: order.id });
}
