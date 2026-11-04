import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CheckCircle2, Clock, MapPin, XCircle, PackageCheck } from "lucide-react";
import { createServiceClient } from "@/lib/supabase/service";
import { formatINR } from "@/lib/format";
import { FULL_ADDRESS, MAPS, SITE } from "@/lib/site";
import { fzButton } from "@/components/brand/button-styles";
import { TrackedAnchor, WhatsAppLink } from "@/components/brand/tracked-links";
import { WhatsAppIcon } from "@/components/brand/icons";
import { Skeleton } from "@/components/ui/skeleton";
import { OrderRefresher } from "@/components/cart/order-refresher";

export const metadata: Metadata = { title: "Your order", robots: { index: false, follow: false } };

type OrderItem = { name: string; variant_label: string; unit_price: number; quantity: number };

const STATUS: Record<string, { title: string; body: string; icon: typeof CheckCircle2; tone: string }> = {
  paid: { title: "Payment received", body: "Thank you! Your order is confirmed. Collect it from the store and show your order number.", icon: CheckCircle2, tone: "text-lime" },
  ready: { title: "Ready for pickup", body: "Your order is packed and waiting for you at the store.", icon: PackageCheck, tone: "text-lime" },
  collected: { title: "Collected", body: "This order has been collected. Thanks for shopping with Fitzone!", icon: CheckCircle2, tone: "text-lime" },
  pending: { title: "Confirming your payment…", body: "This usually takes a few seconds. This page updates automatically.", icon: Clock, tone: "text-amber-300" },
  failed: { title: "Payment not completed", body: "No payment was recorded for this order. You can try again from your cart or message the store.", icon: XCircle, tone: "text-red-300" },
  cancelled: { title: "Order cancelled", body: "This order was cancelled. Contact the store if you have questions about a refund.", icon: XCircle, tone: "text-red-300" },
};

async function OrderDetails({ params }: { params: PageProps<"/order/[id]">["params"] }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const sb = createServiceClient();
  if (!sb) notFound();
  const { data: order } = await sb
    .from("orders")
    .select("id, order_number, customer_name, items, amount, status, razorpay_payment_id, created_at")
    .eq("id", id)
    .maybeSingle();
  if (!order) notFound();

  const s = STATUS[order.status] ?? STATUS.pending;
  const Icon = s.icon;
  const items = order.items as OrderItem[];

  return (
    <div className="container-fz max-w-3xl py-14">
      {order.status === "pending" && <OrderRefresher />}
      <div className="metal-border rounded-3xl p-6 sm:p-10">
        <Icon className={`size-12 ${s.tone}`} />
        <h1 className="display mt-4 text-5xl sm:text-6xl">{s.title}</h1>
        <p className="mt-2 text-mist">{s.body}</p>

        <dl className="mt-8 grid gap-4 rounded-2xl border border-white/10 p-5 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-mist">Order number</dt>
            <dd className="font-heading text-2xl font-bold text-lime">{order.order_number}</dd>
          </div>
          <div>
            <dt className="text-xs text-mist">Name</dt>
            <dd className="text-white">{order.customer_name}</dd>
          </div>
          {order.razorpay_payment_id && (
            <div className="sm:col-span-2">
              <dt className="text-xs text-mist">Payment ID</dt>
              <dd className="font-mono text-sm text-white/85">{order.razorpay_payment_id}</dd>
            </div>
          )}
        </dl>

        <ul className="mt-6 divide-y divide-white/10">
          {items.map((i, idx) => (
            <li key={idx} className="flex justify-between gap-4 py-3 text-sm">
              <span>
                {i.name} <span className="text-mist">· {i.variant_label} × {i.quantity}</span>
              </span>
              <span className="font-heading font-semibold">{formatINR(i.unit_price * i.quantity)}</span>
            </li>
          ))}
          <li className="flex justify-between py-3 text-base">
            <span className="font-heading font-semibold">Total{order.status === "pending" ? "" : " paid"}</span>
            <span className="font-heading text-xl font-bold text-lime">{formatINR(order.amount)}</span>
          </li>
        </ul>

        <div className="mt-6 flex gap-3 rounded-2xl border border-white/10 p-5 text-sm">
          <MapPin className="mt-0.5 size-5 shrink-0 text-lime" />
          <div>
            <p className="font-heading font-semibold">Store pickup</p>
            <p className="text-mist">{FULL_ADDRESS}</p>
            <p className="mt-1 text-xs text-white/60">Closes {SITE.hours.closingTime}. Message the store to check when your order is ready.</p>
          </div>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <WhatsAppLink
            source="order_page"
            message={`Hello Fitzone Supplements! I placed online order ${order.order_number}. When can I collect it?`}
            className={fzButton("whatsapp", "md")}
          >
            <WhatsAppIcon className="size-4" /> WhatsApp store
          </WhatsAppLink>
          <TrackedAnchor href={MAPS.directions} event="directions_click" source="order_page" className={fzButton("outline", "md")}>
            Directions
          </TrackedAnchor>
          <Link href="/shop" className={fzButton("ghost", "md")}>
            Keep shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function OrderPage(props: PageProps<"/order/[id]">) {
  return (
    <Suspense
      fallback={
        <div className="container-fz max-w-3xl py-14">
          <Skeleton className="h-[520px] rounded-3xl bg-white/5" />
        </div>
      }
    >
      <OrderDetails params={props.params} />
    </Suspense>
  );
}
