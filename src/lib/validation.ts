import { z } from "zod";

const trimmed = (max: number) => z.string().trim().max(max);
const indianPhone = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s()-]/g, ""))
  .pipe(z.string().regex(/^(\+?91)?[6-9]\d{9}$/, "Enter a valid Indian mobile number"));

export const inquirySchema = z.object({
  name: trimmed(80).min(2, "Please enter your name"),
  phone: indianPhone,
  kind: z.enum(["product", "availability", "store", "order"]).default("store"),
  productRef: trimmed(160).optional().default(""),
  message: trimmed(1000).min(5, "Please add a short message"),
  // Honeypot — must stay empty.
  website: z.string().max(0).optional().default(""),
});
export type InquiryInput = z.infer<typeof inquirySchema>;

export const reviewSchema = z.object({
  name: trimmed(60).min(2, "Please enter your name"),
  rating: z.coerce.number().int().min(1).max(5),
  comment: trimmed(800).min(10, "Please write at least a few words"),
  website: z.string().max(0).optional().default(""),
});
export type ReviewInput = z.infer<typeof reviewSchema>;

export const ANALYTICS_EVENTS = [
  "page_view",
  "product_view",
  "whatsapp_click",
  "add_to_cart",
  "remove_from_cart",
  "cart_whatsapp_checkout",
  "call_click",
  "directions_click",
] as const;
export type AnalyticsEvent = (typeof ANALYTICS_EVENTS)[number];

export const analyticsSchema = z.object({
  event: z.enum(ANALYTICS_EVENTS),
  path: trimmed(200).regex(/^\//).optional(),
  productSlug: trimmed(120).optional(),
  sessionId: z.string().regex(/^[a-z0-9-]{8,40}$/i).optional(),
  meta: z.record(z.string(), z.union([z.string().max(120), z.number(), z.boolean()])).optional(),
});

/* ───────── Admin ───────── */

const money = z.coerce.number().int("Use whole rupees").min(0).max(10_000_000);

export const variantInputSchema = z.object({
  id: z.string().optional(),
  label: trimmed(80).min(1, "Variant label required"),
  flavor: trimmed(60).optional().transform((v) => v || null),
  size: trimmed(40).optional().transform((v) => v || null),
  price: money,
  mrp: z
    .union([z.literal(""), money])
    .optional()
    .transform((v) => (v === "" || v === undefined ? null : v)),
  stock: z.coerce.number().int().min(0).max(100_000),
});

export const productInputSchema = z.object({
  name: trimmed(140).min(2),
  slug: trimmed(90).regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers and dashes only").min(2),
  brand: trimmed(80).min(1),
  categoryId: z.string().uuid("Choose a category"),
  description: trimmed(4000).default(""),
  ingredients: trimmed(4000).optional().transform((v) => v || null),
  nutrition: trimmed(4000).optional().transform((v) => v || null),
  usage: trimmed(2000).optional().transform((v) => v || null),
  authenticity: trimmed(1000).optional().transform((v) => v || null),
  images: z.array(z.string().url().or(z.string().regex(/^\/images\//))).max(8).default([]),
  featured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  isDemo: z.boolean().default(false),
  variants: z.array(variantInputSchema).min(1, "Add at least one variant").max(30),
});
export type ProductInput = z.infer<typeof productInputSchema>;

export const categoryInputSchema = z.object({
  name: trimmed(80).min(2),
  slug: trimmed(80).regex(/^[a-z0-9-]+$/).min(2),
  description: trimmed(400).default(""),
  imageUrl: z.string().trim().max(500).default(""),
  sortOrder: z.coerce.number().int().min(0).max(999).default(0),
});

export const settingsInputSchema = z.object({
  hoursText: trimmed(600).optional().transform((v) => v || null),
  closingTime: trimmed(40).min(1),
  announcement: trimmed(200).optional().transform((v) => v || null),
  mapsUrl: z.union([z.literal(""), z.string().trim().url().max(500)]).transform((v) => v || null),
  reviewsUrl: z.union([z.literal(""), z.string().trim().url().max(500)]).transform((v) => v || null),
});
