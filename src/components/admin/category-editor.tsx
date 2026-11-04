"use client";

import { useActionState, useTransition } from "react";
import { toast } from "sonner";
import { Save, Trash2 } from "lucide-react";
import { deleteCategory, saveCategory, type ActionResult } from "@/lib/admin/actions";
import type { Category } from "@/lib/types";
import { fzButton } from "@/components/brand/button-styles";
import { Field, FormMessage, TextInput } from "@/components/forms/fields";

export function CategoryEditor({ category, nextOrder }: { category?: Category; nextOrder?: number }) {
  const [state, action, pending] = useActionState<ActionResult, FormData>(saveCategory.bind(null, category?.id ?? null), { ok: false });
  const [deleting, start] = useTransition();
  const e = state.errors ?? {};

  return (
    <form action={action} className="metal-border grid gap-3 rounded-2xl p-4 md:grid-cols-[1fr_1fr_2fr_auto] md:items-end">
      <Field label="Name" name={`name-${category?.id ?? "new"}`} error={e.name}>
        <TextInput name="name" id={`name-${category?.id ?? "new"}`} defaultValue={category?.name} required />
      </Field>
      <Field label="Slug" name={`slug-${category?.id ?? "new"}`} error={e.slug}>
        <TextInput name="slug" id={`slug-${category?.id ?? "new"}`} defaultValue={category?.slug} pattern="[a-z0-9-]+" required />
      </Field>
      <Field label="Description" name={`desc-${category?.id ?? "new"}`}>
        <TextInput name="description" id={`desc-${category?.id ?? "new"}`} defaultValue={category?.description} />
      </Field>
      <div className="flex gap-2">
        {!category && <input type="hidden" name="imageUrl" value="" />}
        <TextInput name="sortOrder" aria-label="Sort order" type="number" min={0} defaultValue={category?.sortOrder ?? nextOrder ?? 0} className="w-20" />
        <button type="submit" disabled={pending} className={fzButton("primary", "sm", "h-11")} aria-label={category ? "Save category" : "Add category"}>
          <Save /> {category ? "" : "Add"}
        </button>
        {category && (
          <button
            type="button"
            disabled={deleting}
            onClick={() =>
              confirm(`Delete “${category.name}”?`) &&
              start(async () => {
                const res = await deleteCategory(category.id);
                if (res.ok) toast.success(res.message ?? "Deleted");
                else toast.error(res.message ?? "Could not delete");
              })
            }
            className={fzButton("ghost", "sm", "h-11 text-red-300")}
            aria-label="Delete category"
          >
            <Trash2 />
          </button>
        )}
      </div>
      {state.message && (
        <div className="md:col-span-4">
          <FormMessage status={state.ok ? "success" : "error"} message={state.message} />
        </div>
      )}
      {category && (
        <details className="text-xs text-mist md:col-span-4">
          <summary className="cursor-pointer hover:text-white">Category image URL</summary>
          <TextInput name="imageUrl" defaultValue={category.image} className="mt-2" aria-label="Category image URL" />
        </details>
      )}
    </form>
  );
}
