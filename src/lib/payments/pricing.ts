import { MAX_PER_LINE } from "../cart-math";

export type RequestedLine = { variantId: string; quantity: number };

export type VariantRecord = {
  id: string;
  label: string;
  price: number;
  stock: number;
  product: { id: string; name: string; is_active: boolean; is_demo: boolean } | null;
};

export type PricedItem = {
  product_id: string;
  variant_id: string;
  name: string;
  variant_label: string;
  unit_price: number;
  quantity: number;
};

export type PricingResult = { ok: true; items: PricedItem[]; amount: number } | { ok: false; error: string };

/**
 * Prices an order using ONLY database values (never prices sent by the
 * browser). Rejects demo, hidden or unknown products and insufficient stock.
 */
export function priceOrder(lines: RequestedLine[], variants: VariantRecord[]): PricingResult {
  if (!lines.length) return { ok: false, error: "Your cart is empty." };

  // Merge duplicate variants.
  const merged = new Map<string, number>();
  for (const l of lines) merged.set(l.variantId, (merged.get(l.variantId) ?? 0) + l.quantity);

  const byId = new Map(variants.map((v) => [v.id, v]));
  const items: PricedItem[] = [];

  for (const [variantId, quantity] of merged) {
    const v = byId.get(variantId);
    if (!v || !v.product || !v.product.is_active) {
      return { ok: false, error: "One of the items in your cart is no longer available. Please remove it and try again." };
    }
    if (v.product.is_demo) {
      return { ok: false, error: `“${v.product.name}” is a sample listing and can’t be bought online.` };
    }
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_PER_LINE) {
      return { ok: false, error: `Please choose between 1 and ${MAX_PER_LINE} of ${v.product.name}.` };
    }
    if (v.stock < quantity) {
      return {
        ok: false,
        error: v.stock > 0 ? `Only ${v.stock} left of ${v.product.name} (${v.label}).` : `${v.product.name} (${v.label}) is out of stock.`,
      };
    }
    if (!Number.isInteger(v.price) || v.price <= 0) {
      return { ok: false, error: `${v.product.name} doesn’t have a price set yet. Please ask the store.` };
    }
    items.push({
      product_id: v.product.id,
      variant_id: v.id,
      name: v.product.name,
      variant_label: v.label,
      unit_price: v.price,
      quantity,
    });
  }

  const amount = items.reduce((s, i) => s + i.unit_price * i.quantity, 0);
  return { ok: true, items, amount };
}
