/**
 * Public Supabase configuration. Only the anon/publishable key is used anywhere
 * in this app — all access control is enforced by Postgres row-level security.
 * A service-role key is never required and must never be exposed.
 */

/** Strip whitespace/quotes that often sneak in when pasting into hosting dashboards. */
function clean(value: string | undefined): string {
  return (value ?? "").trim().replace(/^["']|["']$/g, "");
}

/**
 * Accepts the Project URL in any common pasted form — e.g.
 * `https://xyz.supabase.co/`, `https://xyz.supabase.co/rest/v1/` — and keeps
 * only the origin, which is what supabase-js expects.
 */
export function normaliseSupabaseUrl(raw: string | undefined): string {
  const value = clean(raw);
  if (!value) return "";
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.origin : "";
  } catch {
    return "";
  }
}

export const SUPABASE_URL = normaliseSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
export const SUPABASE_ANON_KEY = clean(
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
);

export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

export const PRODUCT_IMAGE_BUCKET = "product-images";
