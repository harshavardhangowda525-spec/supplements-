/**
 * Public Supabase configuration. Only the anon/publishable key is used anywhere
 * in this app — all access control is enforced by Postgres row-level security.
 * A service-role key is never required and must never be exposed.
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY && /^https?:\/\//.test(SUPABASE_URL));
}

export const PRODUCT_IMAGE_BUCKET = "product-images";
