import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ShieldCheck, FileText, FlaskRound, Utensils, Info } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/page-header";
import { ProductGallery } from "@/components/shop/product-gallery";
import { ProductPurchase } from "@/components/shop/product-purchase";
import { ProductCard } from "@/components/shop/product-card";
import { ProductDetailSkeleton } from "@/components/shop/skeletons";
import { DemoBadge, DemoNotice } from "@/components/brand/demo-badge";
import { SectionHeading } from "@/components/brand/section-heading";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { getCategory, getProduct, getProducts } from "@/lib/data/catalog";
import { SITE } from "@/lib/site";

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/product/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: `${product.name} — ${product.brand}`,
    description: `${product.name} by ${product.brand} at Fitzone Supplements, Nagarabhavi, Bengaluru. Check availability and price on WhatsApp.`,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: { images: [product.images[0]] },
    robots: product.isDemo ? { index: false, follow: true } : undefined,
  };
}

const PENDING = "Not yet supplied. This section will show information from the verified product packaging once the store adds it.";

async function ProductDetails({ params }: { params: PageProps<"/product/[slug]">["params"] }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();
  const [category, all] = await Promise.all([getCategory(product.categorySlug), getProducts()]);
  const related = all.filter((p) => p.categorySlug === product.categorySlug && p.id !== product.id).slice(0, 4);
  const fill = related.length < 4 ? all.filter((p) => p.id !== product.id && !related.includes(p)).slice(0, 4 - related.length) : [];

  // Product structured data only for real (non-demo) catalogue entries.
  const jsonLd = product.isDemo
    ? null
    : {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        brand: { "@type": "Brand", name: product.brand },
        image: product.images.map((i) => (i.startsWith("http") ? i : `${SITE.url}${i}`)),
        description: product.description,
        offers: product.variants.map((variant) => ({
          "@type": "Offer",
          priceCurrency: "INR",
          price: variant.price,
          name: variant.label,
          availability: variant.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          seller: { "@type": "Organization", name: SITE.name },
        })),
      };

  const info = [
    { key: "description", icon: FileText, title: "Description", body: product.description },
    { key: "ingredients", icon: FlaskRound, title: "Ingredients", body: product.ingredients },
    { key: "nutrition", icon: Utensils, title: "Nutrition information", body: product.nutrition },
    { key: "usage", icon: Info, title: "Usage guidance (per manufacturer label)", body: product.usage },
    { key: "authenticity", icon: ShieldCheck, title: "Authenticity", body: product.authenticity },
  ];

  return (
    <>
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}
      <div className="container-fz py-8 pb-28 md:pb-10">
        <Breadcrumbs
          items={[
            { href: "/", label: "Home" },
            { href: "/shop", label: "Shop" },
            ...(category ? [{ href: `/category/${category.slug}`, label: category.name }] : []),
            { label: product.name },
          ]}
        />
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <ProductGallery images={product.images} name={product.name} />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-heading text-xs font-semibold tracking-[0.2em] text-lime uppercase">{product.brand}</span>
              {product.isDemo && <DemoBadge />}
            </div>
            <h1 className="display mt-3 text-5xl text-white sm:text-6xl">{product.name}</h1>
            <p className="mt-4 text-mist">{product.description.split(". ")[0]}.</p>
            <div className="mt-8">
              <ProductPurchase product={product} />
            </div>
            {product.isDemo && <DemoNotice className="mt-8" />}

            <h2 className="sr-only">Product information</h2>
            <Accordion multiple defaultValue={["description"]} className="mt-8 rounded-2xl border border-white/10 px-5">
              {info.map(({ key, icon: Icon, title, body }) => (
                <AccordionItem key={key} value={key} className="border-white/10">
                  <AccordionTrigger className="py-4 font-heading text-sm font-semibold text-white hover:no-underline">
                    <span className="flex items-center gap-3">
                      <Icon className="size-4 text-lime" /> {title}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4 text-sm leading-relaxed whitespace-pre-line text-mist">
                    {body || <span className="italic text-white/50">{PENDING}</span>}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            <p className="mt-4 text-xs text-white/60">
              Supplements are not a substitute for a varied diet. Consult a qualified professional if you have a medical
              condition, are pregnant, or take medication.
            </p>
          </div>
        </div>
      </div>

      {[...related, ...fill].length > 0 && (
        <section className="container-fz py-16">
          <SectionHeading eyebrow="You may also like" title={<>Related <span className="text-lime">products</span></>} />
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {[...related, ...fill].map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

export default function ProductPage(props: PageProps<"/product/[slug]">) {
  return (
    <Suspense fallback={<ProductDetailSkeleton />}>
      <ProductDetails params={props.params} />
    </Suspense>
  );
}
