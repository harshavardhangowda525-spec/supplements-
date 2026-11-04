import type { Metadata } from "next";
import { Suspense } from "react";
import { ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Reveal } from "@/components/brand/reveal";
import { GoogleIcon, Stars } from "@/components/brand/icons";
import { fzButton } from "@/components/brand/button-styles";
import { TestimonialCarousel } from "@/components/reviews/testimonial-carousel";
import { ReviewForm } from "@/components/forms/review-form";
import { Skeleton } from "@/components/ui/skeleton";
import { getApprovedReviews, getStoreSettings } from "@/lib/data/catalog";
import { GOOGLE_QUOTES, SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Customer Reviews",
  description: "See what customers say about Fitzone Supplements, Nagarabhavi, Bengaluru — rated 5.0 on Google (snapshot).",
  alternates: { canonical: "/reviews" },
};

async function WebsiteReviews() {
  const reviews = await getApprovedReviews();
  if (!reviews.length) {
    return <p className="text-sm text-mist">No website reviews have been published yet. Be the first to share your experience.</p>;
  }
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {reviews.map((r) => (
        <li key={r.id} className="metal-border rounded-2xl p-6">
          <Stars rating={r.rating} />
          <p className="mt-3 text-white">“{r.comment}”</p>
          <p className="mt-3 text-xs text-mist">
            {r.name} · Website review ·{" "}
            {new Date(r.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
          </p>
        </li>
      ))}
    </ul>
  );
}

export default async function ReviewsPage() {
  const settings = await getStoreSettings();
  return (
    <>
      <PageHeader
        eyebrow="Reviews"
        title={
          <>
            Trusted by <span className="text-lime">lifters</span>
          </>
        }
        description="Customer feedback from Google and from shoppers who review us here on the website."
        crumbs={[{ href: "/", label: "Home" }, { label: "Reviews" }]}
      />

      <section className="container-fz grid gap-6 py-16 lg:grid-cols-[0.8fr_1.2fr]">
        <Reveal className="metal-border rounded-3xl p-8 sm:p-10">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-full bg-white">
              <GoogleIcon />
            </span>
            <h2 className="font-heading font-semibold">Google reviews</h2>
          </div>
          <p className="display mt-6 text-[7rem] leading-none sm:text-[8rem]">
            {SITE.googleRating.rating.toFixed(1)}
            <span className="text-4xl text-mist">/5</span>
          </p>
          <Stars className="mt-2 [&_svg]:size-6" />
          <p className="mt-3 text-mist">Based on {SITE.googleRating.count} reviews</p>
          <p className="mt-1 text-xs text-white/60">{SITE.googleRating.snapshotLabel}. The current rating is on Google.</p>
          <a href={settings.reviewsUrl} target="_blank" rel="noopener noreferrer" className={fzButton("primary", "md", "mt-8")}>
            Read reviews on Google <ExternalLink />
          </a>
        </Reveal>
        <Reveal delay={0.1}>
          <TestimonialCarousel items={GOOGLE_QUOTES.map((quote) => ({ quote, source: "google" as const }))} />
          <p className="mt-3 text-xs text-white/60">
            Quotes taken from Google reviews of Fitzone Supplements. Reviewer names are omitted until attribution is confirmed.
          </p>
        </Reveal>
      </section>

      <section className="container-fz grid gap-10 py-12 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <p className="eyebrow mb-3">From the website</p>
          <h2 className="display mb-6 text-5xl">Website reviews</h2>
          <Suspense fallback={<Skeleton className="h-40 rounded-2xl bg-white/5" />}>
            <WebsiteReviews />
          </Suspense>
        </div>
        <Reveal className="metal-border h-fit rounded-3xl p-6 sm:p-8">
          <h2 className="font-heading text-xl font-semibold">Share your experience</h2>
          <p className="mb-5 mt-1 text-sm text-mist">Shopped at Fitzone? Tell others what it was like.</p>
          <ReviewForm />
        </Reveal>
      </section>
    </>
  );
}
