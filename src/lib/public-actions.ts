"use server";

import { inquirySchema, reviewSchema } from "./validation";
import { createPublicClient } from "./supabase/public";

export type FormState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

/**
 * Website contact / inquiry form. Saves to Supabase (RLS allows anonymous
 * insert only) so the owner can follow up from the admin dashboard.
 */
export async function submitInquiry(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = inquirySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { status: "error", message: "Please check the highlighted fields.", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  if (parsed.data.website) return { status: "success", message: "Thanks!" }; // bot honeypot

  const sb = createPublicClient();
  if (!sb) {
    return {
      status: "error",
      message: "Online inquiries aren’t connected yet. Please message us on WhatsApp or call the store.",
    };
  }
  const { name, phone, kind, productRef, message } = parsed.data;
  const { error } = await sb.from("inquiries").insert({ name, phone, kind, product_ref: productRef || null, message });
  if (error) {
    console.error("[inquiry] insert failed:", error.message);
    return { status: "error", message: "We couldn’t send your inquiry. Please try WhatsApp or call us." };
  }
  return { status: "success", message: "Thanks! Your inquiry was received. The store will contact you — nothing is confirmed until they reply." };
}

/** Website review submission — stored as "pending" until moderated by the owner. */
export async function submitReview(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = reviewSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { status: "error", message: "Please check the highlighted fields.", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  if (parsed.data.website) return { status: "success", message: "Thanks!" };

  const sb = createPublicClient();
  if (!sb) {
    return { status: "error", message: "Website reviews aren’t connected yet. You can review us on Google instead." };
  }
  const { name, rating, comment } = parsed.data;
  const { error } = await sb.from("reviews").insert({ name, rating, comment, status: "pending" });
  if (error) {
    console.error("[review] insert failed:", error.message);
    return { status: "error", message: "We couldn’t save your review. Please try again later." };
  }
  return { status: "success", message: "Thank you! Your review will appear after the store approves it." };
}
