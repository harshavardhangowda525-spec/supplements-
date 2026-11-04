import { SITE } from "./site";
import { formatINR } from "./format";
import type { CartItem } from "./types";

export const WHATSAPP_BASE = `https://wa.me/${SITE.whatsappNumber}`;

/** Build a wa.me link with a properly URL-encoded prefilled message. */
export function waLink(message?: string): string {
  if (!message) return WHATSAPP_BASE;
  return `${WHATSAPP_BASE}?text=${encodeURIComponent(message)}`;
}

export function productInquiryMessage(productName: string, variantLabel?: string | null): string {
  const item = variantLabel ? `${productName} - ${variantLabel}` : productName;
  return `Hello Fitzone Supplements! I'm interested in ${item}. Could you please confirm availability and price?`;
}

export function availabilityMessage(productName: string, variantLabel?: string | null): string {
  const item = variantLabel ? `${productName} (${variantLabel})` : productName;
  return `Hello Fitzone Supplements! Could you please check if ${item} is currently in stock at the store?`;
}

export function storeAssistanceMessage(): string {
  return "Hello Fitzone Supplements! I'd like some help choosing the right supplement for my goals.";
}

export function orderInquiryFollowUpMessage(): string {
  return "Hello Fitzone Supplements! I'm following up on an order inquiry I sent from your website.";
}

/**
 * Cart → WhatsApp inquiry. Wording is deliberately an *inquiry*: the order is
 * not confirmed until the store replies and accepts it.
 */
export function cartInquiryMessage(items: CartItem[], customerName?: string): string {
  const lines = items.map(
    (i, idx) => `${idx + 1}. ${i.name} - ${i.variantLabel} × ${i.quantity} (${formatINR(i.price * i.quantity)})`,
  );
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const hasDemo = items.some((i) => i.isDemo);
  return [
    `Hello Fitzone Supplements!${customerName ? ` This is ${customerName}.` : ""} I'd like to place an order inquiry for:`,
    "",
    ...lines,
    "",
    `Website estimate: ${formatINR(total)}${hasDemo ? " (sample prices shown on website)" : ""}`,
    "",
    "Could you please confirm availability and the final price?",
  ].join("\n");
}
