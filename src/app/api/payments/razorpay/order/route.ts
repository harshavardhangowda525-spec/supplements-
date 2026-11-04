import { checkoutSchema } from "@/lib/validation";
import { createServiceClient } from "@/lib/supabase/service";
import { priceOrder, type VariantRecord } from "@/lib/payments/pricing";
import { createRazorpayOrder, missingPaymentConfig } from "@/lib/payments/server";
import { RAZORPAY_KEY_ID } from "@/lib/payments";

/**
 * Creates a pending store-pickup order priced from the database, then a
 * matching Razorpay order. The browser receives only what Razorpay Checkout
 * needs — never the secret.
 */
export async function POST(request: Request) {
  const missing = missingPaymentConfig();
  if (missing.length) {
    console.error("[payments] not configured, missing:", missing.join(", "));
    return Response.json({ error: "Online payment isn’t set up yet. Please send your order on WhatsApp instead." }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    const first = Object.values(parsed.error.flatten().fieldErrors).flat()[0];
    return Response.json({ error: first ?? "Please check your details.", fieldErrors: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  const input = parsed.data;
  const sb = createServiceClient()!;

  const { data: variantRows, error: vErr } = await sb
    .from("product_variants")
    .select("id, label, price, stock, product:products(id, name, is_active, is_demo)")
    .in(
      "id",
      input.items.map((i) => i.variantId),
    );
  if (vErr) {
    console.error("[payments] variant lookup failed:", vErr.message);
    return Response.json({ error: "Couldn’t check stock right now. Please try again." }, { status: 500 });
  }

  const pricing = priceOrder(input.items, (variantRows ?? []) as unknown as VariantRecord[]);
  if (!pricing.ok) return Response.json({ error: pricing.error }, { status: 409 });

  const { data: order, error: oErr } = await sb
    .from("orders")
    .insert({
      customer_name: input.name,
      customer_phone: input.phone,
      customer_email: input.email,
      notes: input.notes,
      items: pricing.items,
      amount: pricing.amount,
      status: "pending",
    })
    .select("id, order_number")
    .single();
  if (oErr || !order) {
    console.error("[payments] order insert failed:", oErr?.message);
    return Response.json({ error: "Couldn’t start your order. Please try again." }, { status: 500 });
  }

  try {
    const rzp = await createRazorpayOrder({
      amountPaise: pricing.amount * 100,
      receipt: order.order_number,
      notes: { order_id: order.id, order_number: order.order_number, fulfilment: "store pickup" },
    });
    await sb.from("orders").update({ razorpay_order_id: rzp.id }).eq("id", order.id);
    return Response.json({
      orderId: order.id,
      orderNumber: order.order_number,
      razorpayOrderId: rzp.id,
      amount: rzp.amount,
      currency: rzp.currency,
      keyId: RAZORPAY_KEY_ID,
    });
  } catch (e) {
    console.error("[payments]", (e as Error).message);
    await sb.from("orders").update({ status: "failed" }).eq("id", order.id);
    return Response.json({ error: "The payment gateway is unavailable right now. Please try again or order on WhatsApp." }, { status: 502 });
  }
}
