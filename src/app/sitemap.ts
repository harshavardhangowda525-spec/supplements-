import type { MetadataRoute } from "next";
import { getCategories, getProducts } from "@/lib/data/catalog";
import { SITE } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);
  const staticRoutes = ["", "/shop", "/about", "/reviews", "/contact", "/privacy", "/terms"].map((path) => ({
    url: `${SITE.url}${path}`,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));
  return [
    ...staticRoutes,
    ...categories.map((c) => ({ url: `${SITE.url}/category/${c.slug}`, changeFrequency: "weekly" as const, priority: 0.8 })),
    // Demo products are noindex, so they are left out of the sitemap.
    ...products
      .filter((p) => !p.isDemo)
      .map((p) => ({ url: `${SITE.url}/product/${p.slug}`, changeFrequency: "weekly" as const, priority: 0.6 })),
  ];
}
