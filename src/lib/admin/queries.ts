import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { PRODUCT_SELECT, mapCategory, mapProduct, mapSettings, type CategoryRow, type ProductRow, type SettingsRow } from "../data/mappers";
import type { EventRow } from "./analytics";

/** Admin reads go through the user's session (RLS) and are never cached. */
export async function adminProducts(sb: SupabaseClient) {
  const { data, error } = await sb
    .from("products")
    .select(`${PRODUCT_SELECT}, category_id`)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data as unknown as (ProductRow & { category_id: string | null })[]).map((r) => ({
    ...mapProduct(r),
    categoryId: r.category_id,
  }));
}

export async function adminProduct(sb: SupabaseClient, id: string) {
  const { data, error } = await sb.from("products").select(`${PRODUCT_SELECT}, category_id`).eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  const r = data as unknown as ProductRow & { category_id: string | null };
  return { ...mapProduct(r), categoryId: r.category_id };
}

export async function adminCategories(sb: SupabaseClient) {
  const { data, error } = await sb.from("categories").select("id, slug, name, description, image_url, sort_order").order("sort_order");
  if (error) throw new Error(error.message);
  return (data as CategoryRow[]).map(mapCategory);
}

export async function adminSettings(sb: SupabaseClient) {
  const { data } = await sb.from("store_settings").select("hours_text, closing_time, announcement, maps_url, reviews_url").eq("id", 1).maybeSingle();
  return { raw: data as SettingsRow | null, settings: mapSettings(data as SettingsRow | null) };
}

export async function adminEvents(sb: SupabaseClient, days = 30): Promise<EventRow[]> {
  const since = new Date(Date.now() - days * 86_400_000).toISOString();
  const { data, error } = await sb
    .from("analytics_events")
    .select("event_type, product_slug, session_id, created_at")
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(20_000);
  if (error) throw new Error(error.message);
  return (data ?? []) as EventRow[];
}

export type InquiryRow = { id: string; name: string; phone: string; kind: string; product_ref: string | null; message: string; status: string; created_at: string };
export async function adminInquiries(sb: SupabaseClient): Promise<InquiryRow[]> {
  const { data, error } = await sb.from("inquiries").select("*").order("created_at", { ascending: false }).limit(200);
  if (error) throw new Error(error.message);
  return (data ?? []) as InquiryRow[];
}

export type ReviewRow = { id: string; name: string; rating: number; comment: string; status: string; created_at: string };
export async function adminReviews(sb: SupabaseClient): Promise<ReviewRow[]> {
  const { data, error } = await sb.from("reviews").select("*").order("created_at", { ascending: false }).limit(200);
  if (error) throw new Error(error.message);
  return (data ?? []) as ReviewRow[];
}

export type OrderRow = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  items: { name: string; variant_label: string; unit_price: number; quantity: number }[];
  amount: number;
  status: string;
  razorpay_payment_id: string | null;
  paid_at: string | null;
  created_at: string;
};

/** Returns null when the orders table hasn't been created yet (002_online_payments.sql not run). */
export async function adminOrders(sb: SupabaseClient, limit = 200): Promise<OrderRow[] | null> {
  const { data, error } = await sb
    .from("orders")
    .select("id, order_number, customer_name, customer_phone, customer_email, items, amount, status, razorpay_payment_id, paid_at, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    if (/relation .*orders.* does not exist|Could not find the table/i.test(error.message)) return null;
    throw new Error(error.message);
  }
  return (data ?? []) as OrderRow[];
}
