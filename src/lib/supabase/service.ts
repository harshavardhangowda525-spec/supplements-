import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_URL, isSupabaseConfigured } from "./env";

/**
 * Server-only Supabase client with the service-role key. Used ONLY by the
 * payment routes to create orders and mark them paid after a verified Razorpay
 * signature — things visitors must never be able to do directly.
 *
 * The key is read from SUPABASE_SERVICE_ROLE_KEY (no NEXT_PUBLIC_ prefix), so
 * it is never bundled into browser JavaScript.
 */
const SERVICE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY ?? "").trim();

export function isServiceConfigured(): boolean {
  return isSupabaseConfigured() && SERVICE_KEY.length > 20;
}

export function createServiceClient(): SupabaseClient | null {
  if (!isServiceConfigured()) return null;
  return createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
