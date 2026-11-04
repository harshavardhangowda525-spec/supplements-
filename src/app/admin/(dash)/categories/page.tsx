import { requireAdmin } from "@/lib/admin/auth";
import { adminCategories } from "@/lib/admin/queries";
import { CategoryEditor } from "@/components/admin/category-editor";

export const metadata = { title: "Categories" };

export default async function AdminCategoriesPage() {
  const { sb } = await requireAdmin();
  const categories = await adminCategories(sb);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="display text-5xl">Categories</h1>
        <p className="mt-1 text-sm text-mist">Add, rename, reorder or remove the shop sections. Lower sort numbers appear first.</p>
      </div>
      <div className="space-y-3">
        {categories.map((c) => (
          <CategoryEditor key={c.id} category={c} />
        ))}
      </div>
      <div>
        <h2 className="mb-3 font-heading font-semibold">Add a category</h2>
        <CategoryEditor nextOrder={(categories.at(-1)?.sortOrder ?? 0) + 1} />
      </div>
    </div>
  );
}
