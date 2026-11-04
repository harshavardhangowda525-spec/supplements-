import { describe, expect, it } from "vitest";
import { cartInquiryMessage, productInquiryMessage, waLink, WHATSAPP_BASE } from "../whatsapp";
import type { CartItem } from "../types";

describe("WhatsApp links", () => {
  it("uses the business number", () => {
    expect(WHATSAPP_BASE).toBe("https://wa.me/919686860337");
    expect(waLink()).toBe("https://wa.me/919686860337");
  });

  it("builds the exact product inquiry message", () => {
    expect(productInquiryMessage("Demo Whey", "1 kg · Chocolate")).toBe(
      "Hello Fitzone Supplements! I'm interested in Demo Whey - 1 kg · Chocolate. Could you please confirm availability and price?",
    );
  });

  it("URL-encodes prefilled text so it round-trips", () => {
    const msg = "Hello & welcome! 50% off? #1 · ₹2,499\nNew line";
    const url = waLink(msg);
    expect(url).not.toContain(" ");
    expect(url).not.toContain("&welcome");
    const text = new URL(url).searchParams.get("text");
    expect(text).toBe(msg);
  });

  it("phrases a cart as an inquiry, never a confirmed order", () => {
    const items: CartItem[] = [
      { productId: "p1", slug: "a", name: "Whey", brand: "B", image: "/x.jpg", variantId: "v1", variantLabel: "1 kg", price: 2000, quantity: 2, maxQuantity: 5, isDemo: true },
      { productId: "p2", slug: "b", name: "Creatine", brand: "B", image: "/x.jpg", variantId: "v2", variantLabel: "250 g", price: 999, quantity: 1, maxQuantity: 5, isDemo: false },
    ];
    const msg = cartInquiryMessage(items, "Asha");
    expect(msg).toContain("This is Asha.");
    expect(msg).toContain("1. Whey - 1 kg × 2");
    expect(msg).toContain("2. Creatine - 250 g × 1");
    expect(msg).toContain("₹4,999");
    expect(msg).toContain("sample prices");
    expect(msg).toContain("confirm availability and the final price");
    expect(msg.toLowerCase()).not.toContain("order confirmed");
  });
});
