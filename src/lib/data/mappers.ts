import type { Category, Product, StoreSettings, Variant } from "../types";
import { DEFAULT_SETTINGS } from "../demo-data";

/* Row shapes as stored in Supabase (see supabase/schema.sql). */
export type CategoryRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  image_url: string | null;
  sort_order: number | null;
};

export type VariantRow = {
  id: string;
  label: string;
  flavor: string | null;
  size: string | null;
  price: number;
  mrp: number | null;
  stock: number;
  sort_order: number | null;
};

export type ProductRow = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  description: string | null;
  images: string[] | null;
  featured: boolean;
  is_active: boolean;
  is_demo: boolean;
  ingredients: string | null;
  nutrition: string | null;
  usage: string | null;
  authenticity: string | null;
  categories: { slug: string } | null;
  product_variants: VariantRow[] | null;
};

export type SettingsRow = {
  hours_text: string | null;
  closing_time: string | null;
  announcement: string | null;
  maps_url: string | null;
  reviews_url: string | null;
};

export const PRODUCT_SELECT =
  "id, slug, name, brand, description, images, featured, is_active, is_demo, ingredients, nutrition, usage, authenticity, categories(slug), product_variants(id, label, flavor, size, price, mrp, stock, sort_order)";

const FALLBACK_IMAGE = "/images/products/whey-tub-1.jpg";

export function mapCategory(r: CategoryRow): Category {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    description: r.description ?? "",
    image: r.image_url || FALLBACK_IMAGE,
    sortOrder: r.sort_order ?? 0,
  };
}

function mapVariant(r: VariantRow): Variant {
  return {
    id: r.id,
    label: r.label,
    flavor: r.flavor,
    size: r.size,
    price: Number(r.price),
    mrp: r.mrp === null ? null : Number(r.mrp),
    stock: Number(r.stock),
  };
}

export function mapProduct(r: ProductRow): Product {
  const variants = [...(r.product_variants ?? [])]
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map(mapVariant);
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    brand: r.brand,
    categorySlug: r.categories?.slug ?? "uncategorised",
    description: r.description ?? "",
    images: r.images?.length ? r.images : [FALLBACK_IMAGE],
    variants: variants.length
      ? variants
      : [{ id: `${r.id}-none`, label: "Standard", flavor: null, size: null, price: 0, mrp: null, stock: 0 }],
    featured: r.featured,
    isActive: r.is_active,
    isDemo: r.is_demo,
    ingredients: r.ingredients,
    nutrition: r.nutrition,
    usage: r.usage,
    authenticity: r.authenticity,
  };
}

export function mapSettings(r: SettingsRow | null): StoreSettings {
  if (!r) return DEFAULT_SETTINGS;
  return {
    hoursText: r.hours_text?.trim() || null,
    closingTime: r.closing_time?.trim() || DEFAULT_SETTINGS.closingTime,
    announcement: r.announcement?.trim() || null,
    mapsUrl: r.maps_url?.trim() || DEFAULT_SETTINGS.mapsUrl,
    reviewsUrl: r.reviews_url?.trim() || DEFAULT_SETTINGS.reviewsUrl,
  };
}
