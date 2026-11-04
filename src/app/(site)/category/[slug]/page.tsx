import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { ShopView } from "@/components/shop/shop-view";
import { ProductGridSkeleton } from "@/components/shop/skeletons";
import { DemoNotice } from "@/components/brand/demo-badge";
import { getCategories, getCategory, getProducts, isDemoMode, staticParamsOrPlaceholder } from "@/lib/data/catalog";
import { cn } from "@/lib/utils";

export async function generateStaticParams() {
  const categories = await getCategories();
  return staticParamsOrPlaceholder(categories.map((c) => c.slug));
}

export async function generateMetadata({ params }: PageProps<"/category/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) return { title: "Category not found" };
  return {
    title: `${category.name} in Bengaluru`,
    description: `${category.description} Shop ${category.name.toLowerCase()} at Fitzone Supplements, Nagarabhavi, Bengaluru.`,
    alternates: { canonical: `/category/${category.slug}` },
    openGraph: { images: [category.image] },
  };
}

async function CategoryContent({ params }: { params: PageProps<"/category/[slug]">["params"] }) {
  const { slug } = await params;
  const [category, categories, products] = await Promise.all([getCategory(slug), getCategories(), getProducts()]);
  if (!category) notFound();
  const demo = isDemoMode() || products.some((p) => p.isDemo);

  return (
    <>
      <PageHeader
        eyebrow="Category"
        title={category.name}
        description={category.description}
        crumbs={[{ href: "/", label: "Home" }, { href: "/shop", label: "Shop" }, { label: category.name }]}
      >
        <nav aria-label="Categories" className="mt-8 -mx-4 overflow-x-auto px-4 pb-2">
          <ul className="flex w-max gap-2">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/category/${c.slug}`}
                  className={cn(
                    "flex items-center gap-2 rounded-full border py-1 pr-4 pl-1 text-sm transition-colors",
                    c.slug === category.slug
                      ? "border-lime bg-lime/10 text-lime"
                      : "border-white/15 text-white/80 hover:border-white/40 hover:text-white",
                  )}
                  aria-current={c.slug === category.slug ? "page" : undefined}
                >
                  <span className="relative size-7 overflow-hidden rounded-full bg-[#efe6db]">
                    <Image src={c.image} alt="" fill sizes="28px" className="object-cover" />
                  </span>
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </PageHeader>
      <div className="container-fz py-10">
        {demo && <DemoNotice className="mb-8" />}
        <Suspense fallback={<ProductGridSkeleton />}>
          <ShopView products={products} categories={categories} lockedCategory={category.slug} />
        </Suspense>
      </div>
    </>
  );
}

export default function CategoryPage(props: PageProps<"/category/[slug]">) {
  return (
    <Suspense
      fallback={
        <div className="container-fz py-16">
          <ProductGridSkeleton />
        </div>
      }
    >
      <CategoryContent params={props.params} />
    </Suspense>
  );
}
