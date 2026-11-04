import { describe, expect, it } from "vitest";
import { addItem, cartCount, cartSubtotal, lineKey, MAX_PER_LINE, removeItem, setQuantity } from "../cart-math";
import type { CartItem } from "../types";

const item = (over: Partial<CartItem> = {}): CartItem => ({
  productId: "p1",
  slug: "whey",
  name: "Whey",
  brand: "B",
  image: "/x.jpg",
  variantId: "v1",
  variantLabel: "1 kg",
  price: 1000,
  quantity: 1,
  maxQuantity: 10,
  isDemo: true,
  ...over,
});

describe("cart math", () => {
  it("adds new lines and merges the same variant", () => {
    let cart = addItem([], item());
    cart = addItem(cart, item({ quantity: 2 }));
    expect(cart).toHaveLength(1);
    expect(cart[0].quantity).toBe(3);
    cart = addItem(cart, item({ variantId: "v2" }));
    expect(cart).toHaveLength(2);
    expect(cartCount(cart)).toBe(4);
  });

  it("never exceeds stock or the per-line cap", () => {
    let cart = addItem([], item({ quantity: 8, maxQuantity: 9 }));
    cart = addItem(cart, item({ quantity: 5, maxQuantity: 9 }));
    expect(cart[0].quantity).toBe(9);
    const big = addItem([], item({ quantity: 50, maxQuantity: 500 }));
    expect(big[0].quantity).toBe(MAX_PER_LINE);
  });

  it("ignores out-of-stock additions", () => {
    expect(addItem([], item({ maxQuantity: 0 }))).toEqual([]);
  });

  it("updates quantity and removes lines at zero", () => {
    const cart = addItem([], item({ quantity: 2 }));
    const key = lineKey(cart[0]);
    expect(setQuantity(cart, key, 5)[0].quantity).toBe(5);
    expect(setQuantity(cart, key, 0)).toEqual([]);
    expect(removeItem(cart, key)).toEqual([]);
  });

  it("computes subtotal", () => {
    const cart = [item({ quantity: 2, price: 1500 }), item({ variantId: "v2", price: 499, quantity: 3 })];
    expect(cartSubtotal(cart)).toBe(4497);
  });
});
