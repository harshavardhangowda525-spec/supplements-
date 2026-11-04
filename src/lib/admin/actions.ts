"use server";

import { redirect } from "next/navigation";
import { updateTag } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "./auth";
import { createSessionClient } from "../supabase/server";
import { PRODUCT_IMAGE_BUCKET } from "../supabase/env";
import { categoryInputSchema, productInputSchema, settingsInputSchema } from "../validation";

export type ActionResult = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string[] | undefined>;
  /** saveProduct: variant ids in display order after saving. */
  variantIds?: string[];
};

const CATALOG = "catalog";

/* ───────────── Auth ───────────── */

const loginSchema = z.object({ email: z.string().trim().email(), password: z.string().min(6).max(200) });

export async function signIn(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: "Enter a valid email and password." };
  const sb = await createSessionClient();
  if (!sb) return { ok: false, message: "Supabase is not configured yet. See the README." };
  const { error } = await sb.auth.signInWithPassword(parsed.data);
  if (error) return { ok: false, message: "Invalid email or password." };
  const { data: isAdmin } = await sb.rpc("is_admin");
  if (!isAdmin) {
    await sb.auth.signOut();
    return { ok: false, message: "This account does not have admin access." };
  }
  redirect("/admin");
}

export async function signOut() {
  const sb = await createSessionClient();
  await sb?.auth.signOut();
  redirect("/admin/login");
}

/* ───────────── Products ───────────── */

export async function saveProduct(productId: string | null, payload: unknown): Promise<ActionResult> {
  const { sb } = await requireAdmin();
  const parsed = productInputSchema.safeParse(payload);
  if (!parsed.success) {
    return { ok: false, message: "Please fix the highlighted fields.", errors: parsed.error.flatten().fieldErrors };
  }
  const p = parsed.data;
  const row = {
    name: p.name,
    slug: p.slug,
    brand: p.brand,
    category_id: p.categoryId,
    description: p.description,
    ingredients: p.ingredients,
    nutrition: p.nutrition,
    usage: p.usage,
    authenticity: p.authenticity,
    images: p.images,
    featured: p.featured,
    is_active: p.isActive,
    is_demo: p.isDemo,
  };

  let id = productId;
  if (id) {
    const { error } = await sb.from("products").update(row).eq("id", id);
    if (error) return { ok: false, message: friendly(error.message) };
  } else {
    const { data, error } = await sb.from("products").insert(row).select("id").single();
    if (error) return { ok: false, message: friendly(error.message) };
    id = data.id as string;
  }

  // Sync variants: update existing, insert new, delete removed.
  const { data: existing } = await sb.from("product_variants").select("id").eq("product_id", id);
  const keep = new Set(p.variants.filter((v) => v.id).map((v) => v.id));
  const toDelete = (existing ?? []).map((v) => v.id as string).filter((vid) => !keep.has(vid));
  if (toDelete.length) {
    const { error } = await sb.from("product_variants").delete().in("id", toDelete);
    if (error) return { ok: false, message: friendly(error.message) };
  }
  const rows = p.variants.map((v, i) => ({
    id: v.id,
    product_id: id,
    label: v.label,
    flavor: v.flavor,
    size: v.size,
    price: v.price,
    mrp: v.mrp,
    stock: v.stock,
    sort_order: i,
  }));
  // Existing variants are upserted by id; new ones are inserted separately so
  // Postgres generates their ids (mixing both in one upsert would send id=null).
  const existingRows = rows.filter((r) => r.id);
  const newRows = rows.filter((r) => !r.id).map((r) => {
    const copy: Partial<typeof r> = { ...r };
    delete copy.id;
    return copy;
  });
  if (existingRows.length) {
    const { error } = await sb.from("product_variants").upsert(existingRows);
    if (error) return { ok: false, message: friendly(error.message) };
  }
  if (newRows.length) {
    const { error } = await sb.from("product_variants").insert(newRows);
    if (error) return { ok: false, message: friendly(error.message) };
  }

  updateTag(CATALOG);
  if (!productId) redirect(`/admin/products/${id}?created=1`);
  const { data: saved } = await sb.from("product_variants").select("id").eq("product_id", id).order("sort_order");
  return { ok: true, message: "Product saved.", variantIds: (saved ?? []).map((v) => v.id as string) };
}

export async function deleteProduct(productId: string): Promise<ActionResult> {
  const { sb } = await requireAdmin();
  const { error } = await sb.from("products").delete().eq("id", z.string().uuid().parse(productId));
  if (error) return { ok: false, message: friendly(error.message) };
  updateTag(CATALOG);
  redirect("/admin/products?deleted=1");
}

const stockSchema = z.object({ variantId: z.string().uuid(), stock: z.coerce.number().int().min(0).max(100_000), price: z.coerce.number().int().min(0).max(10_000_000) });

export async function updateVariantQuick(input: { variantId: string; stock: number; price: number }): Promise<ActionResult> {
  const { sb } = await requireAdmin();
  const parsed = stockSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Invalid stock or price." };
  const { error } = await sb
    .from("product_variants")
    .update({ stock: parsed.data.stock, price: parsed.data.price })
    .eq("id", parsed.data.variantId);
  if (error) return { ok: false, message: friendly(error.message) };
  updateTag(CATALOG);
  return { ok: true, message: "Updated." };
}

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export async function uploadProductImage(formData: FormData): Promise<ActionResult & { url?: string }> {
  const { sb } = await requireAdmin();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { ok: false, message: "Choose an image file." };
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) return { ok: false, message: "Use JPG, PNG, WebP or AVIF." };
  if (file.size > MAX_IMAGE_BYTES) return { ok: false, message: "Image must be under 5 MB." };
  const ext = file.type.split("/")[1].replace("jpeg", "jpg");
  const path = `products/${crypto.randomUUID()}.${ext}`;
  const { error } = await sb.storage.from(PRODUCT_IMAGE_BUCKET).upload(path, file, { contentType: file.type, upsert: false });
  if (error) return { ok: false, message: friendly(error.message) };
  const { data } = sb.storage.from(PRODUCT_IMAGE_BUCKET).getPublicUrl(path);
  return { ok: true, url: data.publicUrl };
}

/* ───────────── Categories ───────────── */

export async function saveCategory(categoryId: string | null, _prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const { sb } = await requireAdmin();
  const parsed = categoryInputSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: "Check the category fields.", errors: parsed.error.flatten().fieldErrors };
  const row = {
    name: parsed.data.name,
    slug: parsed.data.slug,
    description: parsed.data.description,
    image_url: parsed.data.imageUrl || null,
    sort_order: parsed.data.sortOrder,
  };
  const { error } = categoryId
    ? await sb.from("categories").update(row).eq("id", categoryId)
    : await sb.from("categories").insert(row);
  if (error) return { ok: false, message: friendly(error.message) };
  updateTag(CATALOG);
  return { ok: true, message: categoryId ? "Category updated." : "Category added." };
}

export async function deleteCategory(categoryId: string): Promise<ActionResult> {
  const { sb } = await requireAdmin();
  const { count } = await sb.from("products").select("id", { count: "exact", head: true }).eq("category_id", categoryId);
  if (count && count > 0) return { ok: false, message: `Move or delete the ${count} product(s) in this category first.` };
  const { error } = await sb.from("categories").delete().eq("id", categoryId);
  if (error) return { ok: false, message: friendly(error.message) };
  updateTag(CATALOG);
  return { ok: true, message: "Category deleted." };
}

/* ───────────── Settings ───────────── */

export async function saveSettings(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const { sb } = await requireAdmin();
  const parsed = settingsInputSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: "Check the settings fields.", errors: parsed.error.flatten().fieldErrors };
  const s = parsed.data;
  const { error } = await sb.from("store_settings").upsert({
    id: 1,
    hours_text: s.hoursText,
    closing_time: s.closingTime,
    announcement: s.announcement,
    maps_url: s.mapsUrl,
    reviews_url: s.reviewsUrl,
    updated_at: new Date().toISOString(),
  });
  if (error) return { ok: false, message: friendly(error.message) };
  updateTag("settings");
  return { ok: true, message: "Store settings saved." };
}

/* ───────────── Inquiries & reviews ───────────── */

const inquiryStatus = z.enum(["new", "contacted", "closed"]);
export async function setInquiryStatus(id: string, status: string): Promise<ActionResult> {
  const { sb } = await requireAdmin();
  const s = inquiryStatus.safeParse(status);
  if (!s.success) return { ok: false, message: "Invalid status." };
  const { error } = await sb.from("inquiries").update({ status: s.data }).eq("id", id);
  return error ? { ok: false, message: friendly(error.message) } : { ok: true };
}

const orderStatus = z.enum(["paid", "ready", "collected", "cancelled"]);
export async function setOrderStatus(id: string, status: string): Promise<ActionResult> {
  const { sb } = await requireAdmin();
  const s = orderStatus.safeParse(status);
  if (!s.success) return { ok: false, message: "Invalid status." };
  // Only orders that were actually paid can move through pickup states.
  const { data, error } = await sb
    .from("orders")
    .update({ status: s.data })
    .eq("id", id)
    .in("status", ["paid", "ready", "collected", "cancelled"])
    .select("id");
  if (error) return { ok: false, message: friendly(error.message) };
  if (!data?.length) return { ok: false, message: "Only paid orders can be updated." };
  return { ok: true };
}

const reviewStatus = z.enum(["pending", "approved", "rejected"]);
export async function setReviewStatus(id: string, status: string): Promise<ActionResult> {
  const { sb } = await requireAdmin();
  const s = reviewStatus.safeParse(status);
  if (!s.success) return { ok: false, message: "Invalid status." };
  const { error } = await sb.from("reviews").update({ status: s.data }).eq("id", id);
  if (error) return { ok: false, message: friendly(error.message) };
  updateTag("reviews");
  return { ok: true };
}

export async function deleteReview(id: string): Promise<ActionResult> {
  const { sb } = await requireAdmin();
  const { error } = await sb.from("reviews").delete().eq("id", id);
  if (error) return { ok: false, message: friendly(error.message) };
  updateTag("reviews");
  return { ok: true };
}

function friendly(message: string): string {
  if (/duplicate key.*slug/i.test(message)) return "That URL slug is already used. Choose another.";
  if (/row-level security|permission denied/i.test(message)) return "You don’t have permission to do that.";
  return "Something went wrong saving your changes. Please try again.";
}
