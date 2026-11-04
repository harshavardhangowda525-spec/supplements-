import "server-only";
import { redirect } from "next/navigation";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createSessionClient } from "../supabase/server";

export type AdminContext = { sb: SupabaseClient; user: User };

/**
 * Server-side authorisation for every admin page and action:
 *  1. a valid Supabase Auth session (verified with the Auth server), and
 *  2. membership in `public.admin_users` (checked via the is_admin() RPC).
 * RLS policies enforce the same rule in the database.
 */
export async function getAdmin(): Promise<AdminContext | null> {
  const sb = await createSessionClient();
  if (!sb) return null;
  const { data: userData, error } = await sb.auth.getUser();
  if (error || !userData.user) return null;
  const { data: isAdmin } = await sb.rpc("is_admin");
  if (!isAdmin) return null;
  return { sb, user: userData.user };
}

export async function requireAdmin(): Promise<AdminContext> {
  const ctx = await getAdmin();
  if (!ctx) redirect("/admin/login?error=unauthorised");
  return ctx;
}
