import { createHmac, timingSafeEqual } from "node:crypto";

function safeEqualHex(expected: string, received: string): boolean {
  if (!/^[0-9a-f]+$/i.test(received) || received.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(received.toLowerCase(), "hex"));
}

export function hmacSha256Hex(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

/**
 * Razorpay Checkout success signature:
 *   HMAC_SHA256(razorpay_order_id + "|" + razorpay_payment_id, key_secret)
 */
export function verifyPaymentSignature(orderId: string, paymentId: string, signature: string, keySecret: string): boolean {
  if (!orderId || !paymentId || !signature || !keySecret) return false;
  return safeEqualHex(hmacSha256Hex(`${orderId}|${paymentId}`, keySecret), signature);
}

/** Razorpay webhook signature: HMAC_SHA256(raw request body, webhook_secret). */
export function verifyWebhookSignature(rawBody: string, signature: string | null, webhookSecret: string): boolean {
  if (!rawBody || !signature || !webhookSecret) return false;
  return safeEqualHex(hmacSha256Hex(rawBody, webhookSecret), signature);
}
