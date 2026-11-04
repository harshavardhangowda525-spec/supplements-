import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { adminCategories, adminProduct } from "@/lib/admin/queries";
import { ProductForm } from "@/components/admin/product-form";

export const metadata = { title: "Edit product" };

export default async function EditProductPage({ params }: PageProps<"/admin/products/[id]">) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { sb } = await requireAdmin();
  const [product, categories] = await Promise.all([adminProduct(sb, id), adminCategories(sb)]);
  if (!product) notFound();
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link href="/admin/products" className="text-xs text-mist hover:text-lime">
            ← All products
          </Link>
          <h1 className="display mt-2 text-5xl">{product.name}</h1>
        </div>
        <Link href={`/product/${product.slug}`} target="_blank" className="text-sm text-mist hover:text-lime">
          View on website ↗
        </Link>
      </div>
      <ProductForm product={product} categories={categories} />
    </div>
  );
}
