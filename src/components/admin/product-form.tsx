"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { ImagePlus, Plus, Trash2, X, Save } from "lucide-react";
import { saveProduct, deleteProduct, uploadProductImage } from "@/lib/admin/actions";
import type { Category, Product } from "@/lib/types";
import { slugify } from "@/lib/format";
import { fzButton } from "@/components/brand/button-styles";
import { Field, TextArea, TextInput, SelectInput } from "@/components/forms/fields";

type VariantDraft = { id?: string; label: string; flavor: string; size: string; price: string; mrp: string; stock: string };

const emptyVariant = (): VariantDraft => ({ label: "", flavor: "", size: "", price: "", mrp: "", stock: "0" });

export function ProductForm({ product, categories }: { product?: Product & { categoryId: string | null }; categories: Category[] }) {
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(product));
  const [brand, setBrand] = useState(product?.brand ?? "");
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? categories[0]?.id ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [ingredients, setIngredients] = useState(product?.ingredients ?? "");
  const [nutrition, setNutrition] = useState(product?.nutrition ?? "");
  const [usage, setUsage] = useState(product?.usage ?? "");
  const [authenticity, setAuthenticity] = useState(product?.authenticity ?? "");
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [imageUrl, setImageUrl] = useState("");
  const [featured, setFeatured] = useState(product?.featured ?? false);
  const [isActive, setIsActive] = useState(product?.isActive ?? true);
  const [isDemo, setIsDemo] = useState(product?.isDemo ?? false);
  const [variants, setVariants] = useState<VariantDraft[]>(
    product?.variants.map((v) => ({
      id: v.id,
      label: v.label,
      flavor: v.flavor ?? "",
      size: v.size ?? "",
      price: String(v.price),
      mrp: v.mrp === null ? "" : String(v.mrp),
      stock: String(v.stock),
    })) ?? [emptyVariant()],
  );
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>({});
  const [pending, start] = useTransition();
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const setVariant = (i: number, patch: Partial<VariantDraft>) =>
    setVariants((vs) => vs.map((v, idx) => (idx === i ? { ...v, ...patch } : v)));

  async function onUpload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    for (const file of Array.from(files).slice(0, 8 - images.length)) {
      const fd = new FormData();
      fd.set("file", file);
      const res = await uploadProductImage(fd);
      if (res.ok && res.url) setImages((imgs) => [...imgs, res.url!]);
      else toast.error(res.message ?? "Upload failed");
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      name,
      slug,
      brand,
      categoryId,
      description,
      ingredients,
      nutrition,
      usage,
      authenticity,
      images,
      featured,
      isActive,
      isDemo,
      variants: variants.map((v) => ({ ...v, mrp: v.mrp === "" ? "" : v.mrp })),
    };
    start(async () => {
      const res = await saveProduct(product?.id ?? null, payload);
      if (!res) return;
      setErrors(res.errors ?? {});
      if (res.ok) {
        toast.success(res.message ?? "Saved");
        if (res.variantIds?.length === variants.length) {
          setVariants((vs) => vs.map((v, i) => ({ ...v, id: res.variantIds![i] })));
        }
      }
      else toast.error(res.message ?? "Could not save");
    });
  }

  function onDelete() {
    if (!product || !confirm(`Delete “${product.name}”? This cannot be undone.`)) return;
    start(async () => {
      const res = await deleteProduct(product.id);
      if (res && !res.ok) toast.error(res.message ?? "Could not delete");
    });
  }

  const toggle = (label: string, checked: boolean, set: (v: boolean) => void, hint: string) => (
    <label className="flex items-start gap-3 rounded-xl border border-white/10 p-3">
      <input type="checkbox" checked={checked} onChange={(e) => set(e.target.checked)} className="mt-0.5 size-4 accent-[#C6FF00]" />
      <span>
        <span className="block text-sm text-white">{label}</span>
        <span className="text-xs text-mist">{hint}</span>
      </span>
    </label>
  );

  return (
    <form onSubmit={submit} className="grid gap-6 xl:grid-cols-[1.5fr_1fr]" noValidate>
      <div className="space-y-6">
        <section className="metal-border space-y-4 rounded-2xl p-5">
          <h2 className="font-heading font-semibold">Basics</h2>
          <Field label="Product name" name="name" error={errors.name}>
            <TextInput
              name="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!slugTouched) setSlug(slugify(e.target.value));
              }}
              required
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="URL slug" name="slug" error={errors.slug} hint={`/product/${slug || "…"}`}>
              <TextInput
                name="slug"
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(slugify(e.target.value));
                }}
                required
              />
            </Field>
            <Field label="Brand" name="brand" error={errors.brand}>
              <TextInput name="brand" value={brand} onChange={(e) => setBrand(e.target.value)} required />
            </Field>
          </div>
          <Field label="Category" name="categoryId" error={errors.categoryId}>
            <SelectInput name="categoryId" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Description" name="description" error={errors.description}>
            <TextArea name="description" value={description} onChange={(e) => setDescription(e.target.value)} />
          </Field>
        </section>

        <section className="metal-border space-y-4 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-semibold">Variants, prices & stock</h2>
            <button type="button" onClick={() => setVariants((v) => [...v, emptyVariant()])} className={fzButton("outline", "sm")}>
              <Plus /> Add variant
            </button>
          </div>
          {errors.variants && <p className="text-xs text-red-300">{errors.variants[0]}</p>}
          <div className="space-y-3">
            {variants.map((v, i) => (
              <div key={v.id ?? `new-${i}`} className="grid grid-cols-2 gap-2 rounded-xl border border-white/10 p-3 sm:grid-cols-6">
                <TextInput aria-label="Variant label" placeholder="Label e.g. 1 kg · Chocolate" value={v.label} onChange={(e) => setVariant(i, { label: e.target.value })} className="col-span-2" />
                <TextInput aria-label="Flavour" placeholder="Flavour" value={v.flavor} onChange={(e) => setVariant(i, { flavor: e.target.value })} />
                <TextInput aria-label="Size" placeholder="Size" value={v.size} onChange={(e) => setVariant(i, { size: e.target.value })} />
                <TextInput aria-label="Price (₹)" placeholder="Price ₹" type="number" min={0} value={v.price} onChange={(e) => setVariant(i, { price: e.target.value })} />
                <TextInput aria-label="MRP (₹, optional)" placeholder="MRP ₹" type="number" min={0} value={v.mrp} onChange={(e) => setVariant(i, { mrp: e.target.value })} />
                <TextInput aria-label="Stock" placeholder="Stock" type="number" min={0} value={v.stock} onChange={(e) => setVariant(i, { stock: e.target.value })} />
                <button
                  type="button"
                  onClick={() => setVariants((vs) => vs.filter((_, idx) => idx !== i))}
                  disabled={variants.length === 1}
                  className="flex items-center justify-center gap-1 rounded-xl border border-white/10 text-xs text-mist hover:text-red-300 disabled:opacity-30"
                  aria-label="Remove variant"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>
          <p className="text-xs text-mist">A discount badge is shown only when MRP is higher than the price.</p>
        </section>

        <section className="metal-border space-y-4 rounded-2xl p-5">
          <h2 className="font-heading font-semibold">Verified label information</h2>
          <p className="text-xs text-amber-200/80">Copy only from the actual product packaging. Leave blank if not verified — the site shows a “not yet supplied” note.</p>
          <Field label="Ingredients" name="ingredients">
            <TextArea name="ingredients" value={ingredients} onChange={(e) => setIngredients(e.target.value)} />
          </Field>
          <Field label="Nutrition information" name="nutrition">
            <TextArea name="nutrition" value={nutrition} onChange={(e) => setNutrition(e.target.value)} />
          </Field>
          <Field label="Usage (manufacturer directions)" name="usage">
            <TextArea name="usage" value={usage} onChange={(e) => setUsage(e.target.value)} />
          </Field>
          <Field label="Authenticity details (only if verified)" name="authenticity">
            <TextArea name="authenticity" value={authenticity} onChange={(e) => setAuthenticity(e.target.value)} />
          </Field>
        </section>
      </div>

      <div className="space-y-6">
        <section className="metal-border space-y-4 rounded-2xl p-5">
          <h2 className="font-heading font-semibold">Images</h2>
          <div className="grid grid-cols-3 gap-2">
            {images.map((src, i) => (
              <div key={src + i} className="group relative aspect-square overflow-hidden rounded-xl bg-[#efe6db]">
                <Image src={src} alt="" fill sizes="120px" className="object-cover" />
                {i === 0 && <span className="absolute top-1 left-1 rounded bg-lime px-1.5 text-[10px] font-bold text-obsidian">MAIN</span>}
                <button
                  type="button"
                  onClick={() => setImages((imgs) => imgs.filter((_, idx) => idx !== i))}
                  className="absolute top-1 right-1 grid size-6 place-items-center rounded-full bg-obsidian/80 text-white"
                  aria-label="Remove image"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple onChange={(e) => onUpload(e.target.files)} className="sr-only" id="image-upload" />
          <label htmlFor="image-upload" className={fzButton("outline", "sm", "w-full cursor-pointer")}>
            <ImagePlus /> {uploading ? "Uploading…" : "Upload images (max 5 MB)"}
          </label>
          <div className="flex gap-2">
            <TextInput aria-label="Image URL" placeholder="…or paste an image URL" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
            <button
              type="button"
              onClick={() => {
                if (imageUrl.trim()) setImages((imgs) => [...imgs, imageUrl.trim()]);
                setImageUrl("");
              }}
              className={fzButton("outline", "sm", "h-11")}
            >
              Add
            </button>
          </div>
          {errors.images && <p className="text-xs text-red-300">Check the image URLs.</p>}
        </section>

        <section className="metal-border space-y-3 rounded-2xl p-5">
          <h2 className="font-heading font-semibold">Visibility</h2>
          {toggle("Visible on website", isActive, setIsActive, "Hidden products stay in the dashboard only.")}
          {toggle("Featured on homepage", featured, setFeatured, "Shown in “Featured supplements”.")}
          {toggle("Demo / sample listing", isDemo, setIsDemo, "Shows a DEMO badge and keeps the page out of search engines.")}
        </section>

        <div className="flex flex-col gap-3">
          <button type="submit" disabled={pending} className={fzButton("primary", "lg", "w-full")}>
            <Save /> {pending ? "Saving…" : product ? "Save changes" : "Create product"}
          </button>
          {product && (
            <button type="button" onClick={onDelete} disabled={pending} className={fzButton("ghost", "md", "w-full text-red-300 hover:text-red-200")}>
              <Trash2 /> Delete product
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
