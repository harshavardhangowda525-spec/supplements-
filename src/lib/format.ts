import type { Product, StockStatus, Variant } from "./types";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function formatINR(value: number): string {
  return inr.format(Math.round(value));
}

export function discountPercent(v: Pick<Variant, "price" | "mrp">): number | null {
  if (!v.mrp || v.mrp <= v.price) return null;
  return Math.round(((v.mrp - v.price) / v.mrp) * 100);
}

export const LOW_STOCK_THRESHOLD = 5;

export function stockStatus(stock: number): StockStatus {
  if (stock <= 0) return "out_of_stock";
  if (stock <= LOW_STOCK_THRESHOLD) return "low_stock";
  return "in_stock";
}

export function stockLabel(stock: number): string {
  const s = stockStatus(stock);
  if (s === "out_of_stock") return "Out of stock";
  if (s === "low_stock") return `Only ${stock} left`;
  return "In stock";
}

export function productStock(p: Product): number {
  return p.variants.reduce((sum, v) => sum + Math.max(0, v.stock), 0);
}

export function priceRange(p: Product): { min: number; max: number } {
  const prices = p.variants.map((v) => v.price);
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

/** The default variant to show: cheapest in-stock variant, else the first. */
export function defaultVariant(p: Product): Variant {
  const inStock = p.variants.filter((v) => v.stock > 0).sort((a, b) => a.price - b.price);
  return inStock[0] ?? p.variants[0];
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
