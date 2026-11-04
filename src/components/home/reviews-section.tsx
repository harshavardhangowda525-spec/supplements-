import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { SectionHeading } from "@/components/brand/section-heading";
import { Reveal } from "@/components/brand/reveal";
import { GoogleIcon, Stars } from "@/components/brand/icons";
import { fzButton } from "@/components/brand/button-styles";
import { TestimonialCarousel } from "@/components/reviews/testimonial-carousel";
import { GOOGLE_QUOTES, SITE } from "@/lib/site";

export function ReviewsSection({ reviewsUrl }: { reviewsUrl: string }) {
  return (
    <section className="container-fz py-24">
      <SectionHeading
        eyebrow="Google reviews"
        title={
          <>
            Rated <span className="text-lime">{SITE.googleRating.rating.toFixed(1)}</span> by Bengaluru lifters
          </>
        }
        action={
          <Link href="/reviews" className={fzButton("outline", "md")}>
            All reviews
          </Link>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <Reveal className="metal-border flex flex-col justify-between rounded-3xl p-8 sm:p-10">
          <div>
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-full bg-white">
                <GoogleIcon />
              </span>
              <span className="font-heading text-sm font-semibold text-white">Google Business rating</span>
            </div>
            <p className="display mt-8 text-[7rem] leading-none text-white sm:text-[9rem]">
              {SITE.googleRating.rating.toFixed(1)}
              <span className="text-4xl text-mist">/5</span>
            </p>
            <Stars className="mt-2 [&_svg]:size-6" />
            <p className="mt-3 text-mist">Based on {SITE.googleRating.count} reviews</p>
            <p className="mt-1 text-xs text-white/60">{SITE.googleRating.snapshotLabel}. See Google for the current rating.</p>
          </div>
          <a href={reviewsUrl} target="_blank" rel="noopener noreferrer" className={fzButton("primary", "md", "mt-8 w-full sm:w-auto")}>
            Read reviews on Google <ExternalLink />
          </a>
        </Reveal>
        <Reveal delay={0.1}>
          <TestimonialCarousel items={GOOGLE_QUOTES.map((quote) => ({ quote, source: "google" as const }))} />
        </Reveal>
      </div>
    </section>
  );
}
