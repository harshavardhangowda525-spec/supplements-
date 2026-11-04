import Link from "next/link";
import { AlertTriangle, Eye, MousePointerClick, Phone, Navigation, ShoppingCart, Users, Send, PackageX, Receipt, IndianRupee } from "lucide-react";
import { requireAdmin } from "@/lib/admin/auth";
import { adminEvents, adminOrders, adminProducts } from "@/lib/admin/queries";
import { formatINR } from "@/lib/format";
import { inventorySummary, recentPaidOrders, summarise } from "@/lib/admin/analytics";
import { VisitsChart } from "@/components/admin/visits-chart";

export const metadata = { title: "Overview" };

function Stat({ icon: Icon, label, value, hint }: { icon: React.ElementType; label: string; value: number | string; hint?: string }) {
  return (
    <div className="metal-border rounded-2xl p-5">
      <div className="flex items-center justify-between text-mist">
        <span className="text-xs">{label}</span>
        <Icon className="size-4" />
      </div>
      <p className="mt-3 font-heading text-3xl font-bold text-white tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs text-white/60">{hint}</p>}
    </div>
  );
}

function TopList({ title, rows, names }: { title: string; rows: { slug: string; count: number }[]; names: Map<string, string> }) {
  return (
    <div className="metal-border rounded-2xl p-5">
      <h3 className="mb-4 font-heading text-sm font-semibold">{title}</h3>
      {rows.length ? (
        <ol className="space-y-2 text-sm">
          {rows.map((r, i) => (
            <li key={r.slug} className="flex justify-between gap-3">
              <span className="truncate text-white/85">
                {i + 1}. {names.get(r.slug) ?? r.slug}
              </span>
              <span className="tabular-nums text-mist">{r.count}</span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="text-sm text-mist">No data yet.</p>
      )}
    </div>
  );
}

export default async function AdminOverview() {
  const { sb } = await requireAdmin();
  const [events, products, orders] = await Promise.all([adminEvents(sb, 30), adminProducts(sb), adminOrders(sb, 1000)]);
  const paidOrders = recentPaidOrders(orders ?? [], 30);
  const a = summarise(events, 14);
  const inv = inventorySummary(products);
  const names = new Map(products.map((p) => [p.slug, p.name]));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="display text-5xl">Overview</h1>
        <p className="mt-2 flex items-start gap-2 text-sm text-mist">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-300" />
          Tracked website activity over the last 30 days. These are clicks and views — not confirmed sales. Visitors with
          Do Not Track enabled are not counted.
        </p>
      </div>

      <section aria-label="Website activity" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat icon={Eye} label="Page views" value={a.totals.pageViews} />
        <Stat icon={Users} label="Visitor sessions" value={a.totals.sessions} hint="Per browser tab, no cookies" />
        <Stat icon={MousePointerClick} label="Product views" value={a.totals.productViews} />
        <Stat icon={Send} label="WhatsApp button clicks" value={a.totals.whatsappClicks} hint="Inquiry intent, not orders" />
        <Stat icon={ShoppingCart} label="Add-to-cart events" value={a.totals.addToCart} />
        <Stat icon={Send} label="Cart sent to WhatsApp" value={a.totals.cartCheckouts} hint="Order inquiries started" />
        <Stat icon={Phone} label="Call taps" value={a.totals.calls} />
        <Stat icon={Navigation} label="Directions taps" value={a.totals.directions} />
      </section>

      {orders && (
        <section aria-label="Confirmed online payments" className="space-y-3">
          <h2 className="display text-3xl">Confirmed online payments</h2>
          <p className="text-sm text-mist">Orders actually paid through Razorpay in the last 30 days (excludes cancelled and unpaid orders).</p>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Stat icon={Receipt} label="Paid online orders" value={paidOrders.length} />
            <Stat icon={IndianRupee} label="Paid amount" value={formatINR(paidOrders.reduce((s, o) => s + o.amount, 0))} />
          </div>
        </section>
      )}

      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <VisitsChart data={a.daily} />
        <div className="grid gap-4">
          <TopList title="Most viewed products" rows={a.topViewed} names={names} />
          <TopList title="Most added to cart" rows={a.topCarted} names={names} />
        </div>
      </div>

      <section aria-labelledby="inv-heading" className="space-y-4">
        <h2 id="inv-heading" className="display text-3xl">Inventory overview</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Stat icon={Eye} label="Products (active / total)" value={`${inv.active} / ${inv.products}`} />
          <Stat icon={MousePointerClick} label="Variants" value={inv.variants} />
          <Stat icon={ShoppingCart} label="Units in stock" value={inv.units} />
          <Stat icon={PackageX} label="Out-of-stock variants" value={inv.outOfStock.length} />
        </div>
        {[...inv.outOfStock, ...inv.lowStock].length > 0 && (
          <div className="metal-border rounded-2xl p-5">
            <h3 className="mb-3 font-heading text-sm font-semibold">Needs attention</h3>
            <ul className="divide-y divide-white/5 text-sm">
              {[...inv.outOfStock, ...inv.lowStock].slice(0, 12).map(({ product, variant }) => (
                <li key={variant.id} className="flex items-center justify-between gap-3 py-2">
                  <Link href={`/admin/products/${product.id}`} className="truncate hover:text-lime">
                    {product.name} <span className="text-mist">· {variant.label}</span>
                  </Link>
                  <span className={variant.stock <= 0 ? "text-red-300" : "text-amber-300"}>
                    {variant.stock <= 0 ? "Out of stock" : `${variant.stock} left`}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}
