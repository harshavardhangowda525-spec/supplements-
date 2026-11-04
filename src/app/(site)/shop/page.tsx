import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { ShopView } from "@/components/shop/shop-view";
import { ProductGridSkeleton } from "@/components/shop/skeletons";
import { DemoNotice } from "@/components/brand/demo-badge";
import { getCategories, getProducts, isDemoMode } from "@/lib/data/catalog";

export const metadata: Metadata = {
  title: "Shop All Supplements",
  description:
    "Browse whey protein, mass gainers, creatine, pre-workout, BCAAs, vitamins and fitness accessories at Fitzone Supplements, Nagarabhavi, Bengaluru.",
  alternates: { canonical: "/shop" },
};

export default async function ShopPage() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);
  const demo = isDemoMode() || products.some((p) => p.isDemo);
  return (
    <>
      <PageHeader
        eyebrow="The catalogue"
        title={
          <>
            Shop all <span className="text-lime">supplements</span>
          </>
        }
        description="Filter by category, brand, flavour, size, price and availability. Add to cart and send your list to us on WhatsApp."
        crumbs={[{ href: "/", label: "Home" }, { label: "Shop" }]}
      />
      <div className="container-fz py-10">
        {demo && <DemoNotice className="mb-8" />}
        <Suspense fallback={<ProductGridSkeleton />}>
          <ShopView products={products} categories={categories} />
        </Suspense>
      </div>
    </>
  );
}
