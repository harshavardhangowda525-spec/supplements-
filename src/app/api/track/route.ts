import { analyticsSchema } from "@/lib/validation";
import { createPublicClient } from "@/lib/supabase/public";

/**
 * First-party analytics sink. Validates the payload server-side and inserts it
 * with the anon key (RLS: insert-only for whitelisted event types). No IP
 * address or user agent is stored.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    const text = await request.text();
    if (text.length > 4000) return new Response(null, { status: 413 });
    body = JSON.parse(text);
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }

  const parsed = analyticsSchema.safeParse(body);
  if (!parsed.success) return Response.json({ ok: false }, { status: 400 });

  const sb = createPublicClient();
  if (!sb) return new Response(null, { status: 204 }); // demo mode: accepted, not stored

  const { event, path, productSlug, sessionId, meta } = parsed.data;
  const { error } = await sb.from("analytics_events").insert({
    event_type: event,
    path: path ?? null,
    product_slug: productSlug ?? null,
    session_id: sessionId ?? null,
    meta: meta ?? {},
  });
  if (error) console.error("[track] insert failed:", error.message);
  return new Response(null, { status: 204 });
}
