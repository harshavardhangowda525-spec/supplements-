import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Hero } from "@/components/home/hero";
import { Marquee } from "@/components/home/marquee";
import { CategoriesGrid } from "@/components/home/categories-grid";
import { WhyChoose } from "@/components/home/why-choose";
import { ReviewsSection } from "@/components/home/reviews-section";
import { LocationSection } from "@/components/home/location-section";
import { SectionHeading } from "@/components/brand/section-heading";
import { DemoNotice } from "@/components/brand/demo-badge";
import { Reveal } from "@/components/brand/reveal";
import { fzButton } from "@/components/brand/button-styles";
import { WhatsAppLink } from "@/components/brand/tracked-links";
import { WhatsAppIcon } from "@/components/brand/icons";
import { ProductCard } from "@/components/shop/product-card";
import { getCategories, getProducts, getStoreSettings, isDemoMode } from "@/lib/data/catalog";
import { storeAssistanceMessage } from "@/lib/whatsapp";

export default async function HomePage() {
  const [categories, products, settings] = await Promise.all([getCategories(), getProducts(), getStoreSettings()]);
  const demo = isDemoMode() || products.some((p) => p.isDemo);
  const featured = products.filter((p) => p.featured).slice(0, 8);
  const counts = demo
    ? null
    : products.reduce<Record<string, number>>((acc, p) => ((acc[p.categorySlug] = (acc[p.categorySlug] ?? 0) + 1), acc), {});

  return (
    <>
      <Hero />
      <Marquee />

      <section id="categories" className="container-fz scroll-mt-24 py-24">
        <SectionHeading
          eyebrow="Shop by goal"
          title={
            <>
              Explore <span className="text-lime">categories</span>
            </>
          }
          description="From your first tub of whey to your full training stack — browse by category."
          action={
            <Link href="/shop" className={fzButton("outline", "md")}>
              View all products <ArrowRight />
            </Link>
          }
        />
        <CategoriesGrid categories={categories} counts={counts} />
      </section>

      <section className="relative py-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgb(198_255_0/0.07),transparent)]" />
        <div className="container-fz relative">
          <SectionHeading
            eyebrow="Popular picks"
            title={
              <>
                Featured <span className="text-lime">supplements</span>
              </>
            }
            action={
              <Link href="/shop" className={fzButton("primary", "md")}>
                Shop all <ArrowRight />
              </Link>
            }
          />
          {demo && <DemoNotice className="mb-8" />}
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {featured.map((p, i) => (
              <Reveal key={p.id} delay={(i % 4) * 0.06}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <WhyChoose />
      <ReviewsSection reviewsUrl={settings.reviewsUrl} />
      <LocationSection settings={settings} />

      <section className="container-fz pb-8">
        <Reveal className="grain relative overflow-hidden rounded-[2rem] bg-lime px-6 py-14 text-center text-obsidian sm:px-12 sm:py-20">
          <p className="font-heading text-xs font-bold tracking-[0.3em] uppercase">Not sure what to pick?</p>
          <h2 className="display mx-auto mt-4 max-w-3xl text-5xl sm:text-7xl">Talk to the Fitzone team</h2>
          <p className="mx-auto mt-4 max-w-xl text-obsidian/75">
            Tell us your training routine and what you’re looking for — we’ll help you compare options and check
            availability.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <WhatsAppLink source="home_cta" message={storeAssistanceMessage()} className={fzButton("dark", "lg")}>
              <WhatsAppIcon /> Chat on WhatsApp
            </WhatsAppLink>
            <Link href="/contact" className={fzButton("dark", "lg", "bg-transparent border-obsidian/30 text-obsidian hover:text-obsidian hover:border-obsidian")}>
              Visit the store
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
