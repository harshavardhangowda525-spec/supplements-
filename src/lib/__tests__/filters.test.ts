import { describe, expect, it } from "vitest";
import { applyFilters, EMPTY_FILTERS, facetOptions, parseFilters, serializeFilters } from "../filters";
import { DEMO_PRODUCTS } from "../demo-data";

describe("product filters", () => {
  it("round-trips through the URL", () => {
    const f = { ...EMPTY_FILTERS, q: "whey", categories: ["creatine", "whey-protein"], minPrice: 500, inStockOnly: true, sort: "price-asc" as const };
    expect(parseFilters(new URLSearchParams(serializeFilters(f)))).toEqual(f);
  });

  it("ignores invalid params", () => {
    const f = parseFilters(new URLSearchParams("min=-5&max=abc&sort=hack"));
    expect(f.minPrice).toBeNull();
    expect(f.maxPrice).toBeNull();
    expect(f.sort).toBe("featured");
  });

  it("filters by category", () => {
    const r = applyFilters(DEMO_PRODUCTS, { ...EMPTY_FILTERS, categories: ["creatine"] });
    expect(r.length).toBeGreaterThan(0);
    expect(r.every((p) => p.categorySlug === "creatine")).toBe(true);
  });

  it("requires a single variant to satisfy flavour + stock together", () => {
    // Demo Mass Gainer: Banana variant is out of stock.
    const r = applyFilters(DEMO_PRODUCTS, { ...EMPTY_FILTERS, flavors: ["Banana"], inStockOnly: true });
    expect(r.find((p) => p.slug === "demo-mass-gainer")).toBeUndefined();
    const r2 = applyFilters(DEMO_PRODUCTS, { ...EMPTY_FILTERS, flavors: ["Banana"] });
    expect(r2.find((p) => p.slug === "demo-mass-gainer")).toBeDefined();
  });

  it("filters by price range and sorts", () => {
    const r = applyFilters(DEMO_PRODUCTS, { ...EMPTY_FILTERS, maxPrice: 1000, sort: "price-asc" });
    expect(r.length).toBeGreaterThan(0);
    for (const p of r) expect(p.variants.some((v) => v.price <= 1000)).toBe(true);
    const mins = r.map((p) => Math.min(...p.variants.map((v) => v.price)));
    expect(mins).toEqual([...mins].sort((a, b) => a - b));
  });

  it("searches name and brand", () => {
    expect(applyFilters(DEMO_PRODUCTS, { ...EMPTY_FILTERS, q: "omega" }).map((p) => p.slug)).toEqual(["demo-omega-3-softgels"]);
  });

  it("derives facets", () => {
    const f = facetOptions(DEMO_PRODUCTS);
    expect(f.brands).toContain("Sample Brand A");
    expect(f.flavors).toContain("Chocolate");
    expect(f.priceMin).toBeLessThan(f.priceMax);
  });
});
