import type { CartItem } from "./types";

export const MAX_PER_LINE = 20;

export function lineKey(item: Pick<CartItem, "productId" | "variantId">): string {
  return `${item.productId}::${item.variantId}`;
}

function clampQty(qty: number, max: number): number {
  const cap = Math.max(0, Math.min(max, MAX_PER_LINE));
  return Math.max(0, Math.min(Math.floor(qty), cap));
}

export function addItem(items: CartItem[], incoming: CartItem): CartItem[] {
  const key = lineKey(incoming);
  const existing = items.find((i) => lineKey(i) === key);
  if (existing) {
    return items.map((i) =>
      lineKey(i) === key
        ? { ...i, maxQuantity: incoming.maxQuantity, price: incoming.price, quantity: clampQty(i.quantity + incoming.quantity, incoming.maxQuantity) }
        : i,
    );
  }
  const quantity = clampQty(incoming.quantity, incoming.maxQuantity);
  if (quantity <= 0) return items;
  return [...items, { ...incoming, quantity }];
}

export function setQuantity(items: CartItem[], key: string, quantity: number): CartItem[] {
  return items
    .map((i) => (lineKey(i) === key ? { ...i, quantity: clampQty(quantity, i.maxQuantity) } : i))
    .filter((i) => i.quantity > 0);
}

export function removeItem(items: CartItem[], key: string): CartItem[] {
  return items.filter((i) => lineKey(i) !== key);
}

export function cartCount(items: CartItem[]): number {
  return items.reduce((s, i) => s + i.quantity, 0);
}

export function cartSubtotal(items: CartItem[]): number {
  return items.reduce((s, i) => s + i.price * i.quantity, 0);
}
