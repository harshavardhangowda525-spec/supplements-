import { describe, expect, it } from "vitest";
import { normaliseSupabaseUrl } from "../supabase/env";

describe("normaliseSupabaseUrl", () => {
  it("keeps only the origin of common pasted forms", () => {
    expect(normaliseSupabaseUrl("https://abc.supabase.co")).toBe("https://abc.supabase.co");
    expect(normaliseSupabaseUrl("https://abc.supabase.co/")).toBe("https://abc.supabase.co");
    expect(normaliseSupabaseUrl("https://abc.supabase.co/rest/v1/")).toBe("https://abc.supabase.co");
    expect(normaliseSupabaseUrl('  "https://abc.supabase.co/rest/v1"  ')).toBe("https://abc.supabase.co");
  });
  it("rejects empty or invalid values", () => {
    expect(normaliseSupabaseUrl(undefined)).toBe("");
    expect(normaliseSupabaseUrl("abc.supabase.co")).toBe("");
    expect(normaliseSupabaseUrl("ftp://abc.supabase.co")).toBe("");
  });
});
