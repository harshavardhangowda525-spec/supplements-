import { requireAdmin } from "@/lib/admin/auth";
import { adminOrders } from "@/lib/admin/queries";
import { StatusSelect } from "@/components/admin/status-select";
import { formatINR } from "@/lib/format";
import { isTestMode, onlinePaymentsEnabled } from "@/lib/payments";
import { cn } from "@/lib/utils";

export const metadata = { title: "Online orders" };

const BADGE: Record<string, string> = {
  pending: "bg-white/10 text-mist",
  failed: "bg-red-400/15 text-red-300",
  paid: "bg-lime text-obsidian",
  ready: "bg-sky-400/20 text-sky-200",
  collected: "bg-white/10 text-white",
  cancelled: "bg-red-400/15 text-red-300",
};

export default async function AdminOrdersPage() {
  const { sb } = await requireAdmin();
  const orders = await adminOrders(sb);

  if (orders === null) {
    return (
      <div className="space-y-4">
        <h1 className="display text-5xl">Online orders</h1>
        <div className="rounded-2xl border border-amber-300/25 bg-amber-300/[0.07] p-5 text-sm text-amber-100/90">
          The orders table doesn’t exist yet. In Supabase → SQL Editor, run <code className="text-white">supabase/002_online_payments.sql</code>.
        </div>
      </div>
    );
  }

  const paid = orders.filter((o) => ["paid", "ready", "collected"].includes(o.status));
  const toCollect = orders.filter((o) => o.status === "paid" || o.status === "ready");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="display text-5xl">Online orders</h1>
        <p className="mt-1 text-sm text-mist">
          Orders paid online through Razorpay for store pickup. Refunds are issued from the Razorpay dashboard.
          {!onlinePaymentsEnabled() && " Online payments are currently switched off on the website."}
          {onlinePaymentsEnabled() && isTestMode() && " Razorpay is in TEST mode — these are not real payments."}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="metal-border rounded-2xl p-5">
          <p className="text-xs text-mist">Paid orders (last {orders.length} shown)</p>
          <p className="mt-2 font-heading text-3xl font-bold">{paid.length}</p>
        </div>
        <div className="metal-border rounded-2xl p-5">
          <p className="text-xs text-mist">Paid amount</p>
          <p className="mt-2 font-heading text-3xl font-bold text-lime">{formatINR(paid.reduce((s, o) => s + o.amount, 0))}</p>
        </div>
        <div className="metal-border rounded-2xl p-5">
          <p className="text-xs text-mist">Waiting for pickup</p>
          <p className="mt-2 font-heading text-3xl font-bold">{toCollect.length}</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="metal-border rounded-2xl p-10 text-center text-mist">No online orders yet.</div>
      ) : (
        <ul className="space-y-3">
          {orders.map((o) => {
            const canUpdate = ["paid", "ready", "collected", "cancelled"].includes(o.status);
            return (
              <li key={o.id} className="metal-border rounded-2xl p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="flex flex-wrap items-center gap-2 font-heading font-semibold">
                      {o.order_number}
                      <span className={cn("rounded-full px-2 py-0.5 text-[10px] uppercase", BADGE[o.status] ?? BADGE.pending)}>
                        {o.status === "pending" ? "awaiting payment" : o.status}
                      </span>
                    </p>
                    <p className="text-xs text-mist">
                      {o.customer_name} · <a href={`tel:${o.customer_phone}`} className="hover:text-lime">{o.customer_phone}</a>
                      {o.customer_email && ` · ${o.customer_email}`} ·{" "}
                      {new Date(o.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                    </p>
                    {o.razorpay_payment_id && <p className="mt-1 font-mono text-[11px] text-white/60">{o.razorpay_payment_id}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-heading text-lg font-bold">{formatINR(o.amount)}</span>
                    {canUpdate && <StatusSelect id={o.id} value={o.status} kind="order" />}
                  </div>
                </div>
                <ul className="mt-3 space-y-1 text-sm text-white/85">
                  {o.items.map((i, idx) => (
                    <li key={idx}>
                      {i.quantity} × {i.name} <span className="text-mist">({i.variant_label}) · {formatINR(i.unit_price)}</span>
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
