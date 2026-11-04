/**
 * Payment provider abstraction — prepared for a future Razorpay integration.
 *
 * Online payments are intentionally DISABLED. Enable only after:
 *   1. the business approves online payments,
 *   2. the catalogue contains verified prices & stock,
 *   3. Razorpay credentials are configured (key id public, key secret server-only),
 *   4. a server route creates orders and verifies payment signatures.
 *
 * See README → "Enabling Razorpay later".
 */
export type PaymentProvider = {
  name: string;
  /** Server-side order creation endpoint (to be implemented). */
  createOrderEndpoint: string;
};

export function getPaymentProvider(): PaymentProvider | null {
  const enabled = process.env.NEXT_PUBLIC_PAYMENTS_ENABLED === "true";
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  if (!enabled || !keyId) return null;
  return { name: "Razorpay", createOrderEndpoint: "/api/payments/razorpay/order" };
}
