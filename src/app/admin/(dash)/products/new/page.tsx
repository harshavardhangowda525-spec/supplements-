import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { adminCategories } from "@/lib/admin/queries";
import { ProductForm } from "@/components/admin/product-form";

export const metadata = { title: "Add product" };

export default async function NewProductPage() {
  const { sb } = await requireAdmin();
  const categories = await adminCategories(sb);
  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/products" className="text-xs text-mist hover:text-lime">
          ← All products
        </Link>
        <h1 className="display mt-2 text-5xl">Add product</h1>
      </div>
      {categories.length ? (
        <ProductForm categories={categories} />
      ) : (
        <p className="text-mist">
          Create a category first on the <Link href="/admin/categories" className="text-lime underline">Categories</Link> page.
        </p>
      )}
    </div>
  );
}
