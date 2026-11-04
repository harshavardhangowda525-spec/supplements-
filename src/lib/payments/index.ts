/**
 * Online payments — Razorpay, store pickup only.
 *
 * Browser side: the checkout button appears when NEXT_PUBLIC_PAYMENTS_ENABLED
 * is "true" and NEXT_PUBLIC_RAZORPAY_KEY_ID is set.
 * Server side (see ./server.ts): orders are only created when the Razorpay
 * secret and the Supabase service-role key are configured too.
 */
export const RAZORPAY_KEY_ID = (process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "").trim();

export function onlinePaymentsEnabled(): boolean {
  return process.env.NEXT_PUBLIC_PAYMENTS_ENABLED === "true" && RAZORPAY_KEY_ID.length > 0;
}

export function isTestMode(): boolean {
  return RAZORPAY_KEY_ID.startsWith("rzp_test_");
}

export const RAZORPAY_CHECKOUT_SRC = "https://checkout.razorpay.com/v1/checkout.js";
