import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { Category, Product, StoreSettings } from "../types";
import { DEFAULT_SETTINGS, DEMO_CATEGORIES, DEMO_PRODUCTS } from "../demo-data";
import { createPublicClient } from "../supabase/public";
import { isSupabaseConfigured } from "../supabase/env";
import {
  PRODUCT_SELECT,
  mapCategory,
  mapProduct,
  mapSettings,
  type CategoryRow,
  type ProductRow,
  type SettingsRow,
} from "./mappers";

export const CATALOG_TAG = "catalog";
export const SETTINGS_TAG = "settings";

/** True when the site is running on the bundled demo catalogue. */
export function isDemoMode(): boolean {
  return !isSupabaseConfigured();
}

export async function getCategories(): Promise<Category[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag(CATALOG_TAG);

  const sb = createPublicClient();
  if (!sb) return DEMO_CATEGORIES;
  const { data, error } = await sb
    .from("categories")
    .select("id, slug, name, description, image_url, sort_order")
    .order("sort_order", { ascending: true });
  if (error) {
    console.error("[catalog] categories:", error.message);
    return [];
  }
  return (data as CategoryRow[]).map(mapCategory);
}

export async function getProducts(): Promise<Product[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag(CATALOG_TAG);

  const sb = createPublicClient();
  if (!sb) return DEMO_PRODUCTS;
  const { data, error } = await sb
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("is_active", true)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[catalog] products:", error.message);
    return [];
  }
  return (data as unknown as ProductRow[]).map(mapProduct);
}

export async function getProduct(slug: string): Promise<Product | null> {
  const products = await getProducts();
  return products.find((p) => p.slug === slug) ?? null;
}

export async function getCategory(slug: string): Promise<Category | null> {
  const categories = await getCategories();
  return categories.find((c) => c.slug === slug) ?? null;
}

export async function getStoreSettings(): Promise<StoreSettings> {
  "use cache";
  cacheLife("minutes");
  cacheTag(SETTINGS_TAG);

  const sb = createPublicClient();
  if (!sb) return DEFAULT_SETTINGS;
  const { data, error } = await sb
    .from("store_settings")
    .select("hours_text, closing_time, announcement, maps_url, reviews_url")
    .eq("id", 1)
    .maybeSingle();
  if (error) {
    console.error("[catalog] settings:", error.message);
    return DEFAULT_SETTINGS;
  }
  return mapSettings(data as SettingsRow | null);
}

export type ApprovedReview = { id: string; name: string; rating: number; comment: string; createdAt: string };

export async function getApprovedReviews(): Promise<ApprovedReview[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("reviews");

  const sb = createPublicClient();
  if (!sb) return [];
  const { data, error } = await sb
    .from("reviews")
    .select("id, name, rating, comment, created_at")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(30);
  if (error) {
    console.error("[catalog] reviews:", error.message);
    return [];
  }
  return (data ?? []).map((r) => ({
    id: r.id as string,
    name: r.name as string,
    rating: r.rating as number,
    comment: r.comment as string,
    createdAt: r.created_at as string,
  }));
}
