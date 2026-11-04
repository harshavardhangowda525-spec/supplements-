import type { Product } from "./types";
import { priceRange, productStock } from "./format";

export type SortKey = "featured" | "price-asc" | "price-desc" | "name";

export type ProductFilters = {
  q: string;
  categories: string[];
  brands: string[];
  flavors: string[];
  sizes: string[];
  minPrice: number | null;
  maxPrice: number | null;
  inStockOnly: boolean;
  sort: SortKey;
};

export const EMPTY_FILTERS: ProductFilters = {
  q: "",
  categories: [],
  brands: [],
  flavors: [],
  sizes: [],
  minPrice: null,
  maxPrice: null,
  inStockOnly: false,
  sort: "featured",
};

const SORTS: SortKey[] = ["featured", "price-asc", "price-desc", "name"];

const list = (v: string | null) => (v ? v.split(",").map((s) => s.trim()).filter(Boolean) : []);
const num = (v: string | null) => {
  if (v === null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : null;
};

export function parseFilters(params: URLSearchParams): ProductFilters {
  const sort = params.get("sort") as SortKey | null;
  return {
    q: (params.get("q") ?? "").slice(0, 80),
    categories: list(params.get("category")),
    brands: list(params.get("brand")),
    flavors: list(params.get("flavor")),
    sizes: list(params.get("size")),
    minPrice: num(params.get("min")),
    maxPrice: num(params.get("max")),
    inStockOnly: params.get("stock") === "1",
    sort: sort && SORTS.includes(sort) ? sort : "featured",
  };
}

export function serializeFilters(f: ProductFilters): string {
  const p = new URLSearchParams();
  if (f.q) p.set("q", f.q);
  if (f.categories.length) p.set("category", f.categories.join(","));
  if (f.brands.length) p.set("brand", f.brands.join(","));
  if (f.flavors.length) p.set("flavor", f.flavors.join(","));
  if (f.sizes.length) p.set("size", f.sizes.join(","));
  if (f.minPrice !== null) p.set("min", String(f.minPrice));
  if (f.maxPrice !== null) p.set("max", String(f.maxPrice));
  if (f.inStockOnly) p.set("stock", "1");
  if (f.sort !== "featured") p.set("sort", f.sort);
  return p.toString();
}

export function activeFilterCount(f: ProductFilters): number {
  return (
    f.categories.length +
    f.brands.length +
    f.flavors.length +
    f.sizes.length +
    (f.minPrice !== null || f.maxPrice !== null ? 1 : 0) +
    (f.inStockOnly ? 1 : 0)
  );
}

export function applyFilters(products: Product[], f: ProductFilters): Product[] {
  const q = f.q.trim().toLowerCase();
  const out = products.filter((p) => {
    if (!p.isActive) return false;
    if (q && !`${p.name} ${p.brand}`.toLowerCase().includes(q)) return false;
    if (f.categories.length && !f.categories.includes(p.categorySlug)) return false;
    if (f.brands.length && !f.brands.includes(p.brand)) return false;
    if (f.inStockOnly && productStock(p) <= 0) return false;

    // Variant-level filters: at least one variant must satisfy all of them.
    const needsVariant =
      f.flavors.length || f.sizes.length || f.minPrice !== null || f.maxPrice !== null || f.inStockOnly;
    if (!needsVariant) return true;
    return p.variants.some(
      (v) =>
        (!f.flavors.length || (v.flavor !== null && f.flavors.includes(v.flavor))) &&
        (!f.sizes.length || (v.size !== null && f.sizes.includes(v.size))) &&
        (f.minPrice === null || v.price >= f.minPrice) &&
        (f.maxPrice === null || v.price <= f.maxPrice) &&
        (!f.inStockOnly || v.stock > 0),
    );
  });

  const byPrice = (p: Product) => priceRange(p).min;
  switch (f.sort) {
    case "price-asc":
      return out.sort((a, b) => byPrice(a) - byPrice(b));
    case "price-desc":
      return out.sort((a, b) => byPrice(b) - byPrice(a));
    case "name":
      return out.sort((a, b) => a.name.localeCompare(b.name));
    default:
      return out.sort((a, b) => Number(b.featured) - Number(a.featured));
  }
}

export type FacetOptions = {
  brands: string[];
  flavors: string[];
  sizes: string[];
  priceMin: number;
  priceMax: number;
};

export function facetOptions(products: Product[]): FacetOptions {
  const brands = new Set<string>();
  const flavors = new Set<string>();
  const sizes = new Set<string>();
  let priceMin = Infinity;
  let priceMax = 0;
  for (const p of products) {
    brands.add(p.brand);
    for (const v of p.variants) {
      if (v.flavor) flavors.add(v.flavor);
      if (v.size) sizes.add(v.size);
      priceMin = Math.min(priceMin, v.price);
      priceMax = Math.max(priceMax, v.price);
    }
  }
  const sort = (s: Set<string>) => [...s].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  return {
    brands: sort(brands),
    flavors: sort(flavors),
    sizes: sort(sizes),
    priceMin: Number.isFinite(priceMin) ? priceMin : 0,
    priceMax: priceMax || 0,
  };
}
