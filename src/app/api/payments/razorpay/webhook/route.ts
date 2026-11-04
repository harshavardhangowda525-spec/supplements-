import { createServiceClient } from "@/lib/supabase/service";
import { verifyWebhookSignature } from "@/lib/payments/signature";
import { RAZORPAY_WEBHOOK_SECRET } from "@/lib/payments/server";

type WebhookPayload = {
  event?: string;
  payload?: { payment?: { entity?: { id?: string; order_id?: string } } };
};

/**
 * Razorpay webhook (backup confirmation if the customer closes the browser
 * before the success callback runs). Configure in Razorpay Dashboard →
 * Webhooks with events payment.captured, order.paid, payment.failed.
 */
export async function POST(request: Request) {
  if (!RAZORPAY_WEBHOOK_SECRET) return new Response("Webhook not configured", { status: 503 });

  const raw = await request.text();
  if (raw.length > 100_000) return new Response("Payload too large", { status: 413 });
  if (!verifyWebhookSignature(raw, request.headers.get("x-razorpay-signature"), RAZORPAY_WEBHOOK_SECRET)) {
    return new Response("Invalid signature", { status: 400 });
  }

  let event: WebhookPayload;
  try {
    event = JSON.parse(raw) as WebhookPayload;
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const sb = createServiceClient();
  if (!sb) return new Response("Not configured", { status: 503 });
  const payment = event.payload?.payment?.entity;
  const orderId = payment?.order_id;
  const paymentId = payment?.id;
  if (!orderId || !paymentId) return Response.json({ ok: true, ignored: true });

  if (event.event === "payment.captured" || event.event === "order.paid") {
    const { error } = await sb.rpc("mark_order_paid", { p_razorpay_order_id: orderId, p_payment_id: paymentId });
    if (error) {
      console.error("[payments:webhook] mark_order_paid failed:", error.message);
      return new Response("Retry later", { status: 500 }); // Razorpay retries
    }
  } else if (event.event === "payment.failed") {
    await sb.from("orders").update({ status: "failed" }).eq("razorpay_order_id", orderId).eq("status", "pending");
  }
  return Response.json({ ok: true });
}
