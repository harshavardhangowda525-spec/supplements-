import Image from "next/image";
import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { requireAdmin } from "@/lib/admin/auth";
import { adminCategories, adminProducts } from "@/lib/admin/queries";
import { QuickVariant } from "@/components/admin/quick-variant";
import { DemoBadge } from "@/components/brand/demo-badge";
import { fzButton } from "@/components/brand/button-styles";

export const metadata = { title: "Products" };

export default async function AdminProductsPage() {
  const { sb } = await requireAdmin();
  const [products, categories] = await Promise.all([adminProducts(sb), adminCategories(sb)]);
  const catName = new Map(categories.map((c) => [c.id, c.name]));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display text-5xl">Products</h1>
          <p className="mt-1 text-sm text-mist">{products.length} products. Update price and stock inline, or open a product to edit everything.</p>
        </div>
        <Link href="/admin/products/new" className={fzButton("primary", "md")}>
          <Plus /> Add product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="metal-border rounded-2xl p-10 text-center text-mist">No products yet. Add your first product.</div>
      ) : (
        <ul className="space-y-3">
          {products.map((p) => (
            <li key={p.id} className="metal-border flex flex-col gap-4 rounded-2xl p-4 lg:flex-row lg:items-center">
              <div className="flex min-w-0 flex-1 items-center gap-4">
                <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-[#efe6db]">
                  <Image src={p.images[0]} alt="" fill sizes="64px" className="object-cover" />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={`/admin/products/${p.id}`} className="truncate font-heading font-semibold hover:text-lime">
                      {p.name}
                    </Link>
                    {p.isDemo && <DemoBadge />}
                    {!p.isActive && <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] uppercase">Hidden</span>}
                    {p.featured && <span className="rounded-full bg-lime/15 px-2 py-0.5 text-[10px] text-lime uppercase">Featured</span>}
                  </div>
                  <p className="text-xs text-mist">
                    {p.brand} · {p.categoryId ? catName.get(p.categoryId) : "No category"}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                {p.variants.map((v) => (
                  <QuickVariant key={v.id} variantId={v.id} label={v.label} stock={v.stock} price={v.price} />
                ))}
              </div>
              <Link href={`/admin/products/${p.id}`} className={fzButton("outline", "sm")}>
                <Pencil /> Edit
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
