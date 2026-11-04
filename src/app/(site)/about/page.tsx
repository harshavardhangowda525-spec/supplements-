import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Camera, Phone, MapPin } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Reveal, Stagger, StaggerItem } from "@/components/brand/reveal";
import { SectionHeading } from "@/components/brand/section-heading";
import { fzButton } from "@/components/brand/button-styles";
import { TrackedAnchor, WhatsAppLink } from "@/components/brand/tracked-links";
import { WhatsAppIcon, Stars } from "@/components/brand/icons";
import { WhyChoose } from "@/components/home/why-choose";
import { TestimonialCarousel } from "@/components/reviews/testimonial-carousel";
import { FULL_ADDRESS, GOOGLE_QUOTES, MAPS, SITE } from "@/lib/site";
import { storeAssistanceMessage } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Fitzone Supplements is a Bengaluru-based fitness nutrition retailer in Nagarabhavi, focused on helpful service and a wide selection of gym supplements.",
  alternates: { canonical: "/about" },
};

const GALLERY = [
  { src: "/images/products/whey-tub-1.jpg" },
  { src: "/images/products/jar-orange-1.jpg" },
  { src: "/images/products/bottle-1.jpg" },
  { src: "/images/products/tub-wide-1.jpg" },
  { src: "/images/products/jar-pink-1.jpg" },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About Fitzone"
        title={
          <>
            Built for your <span className="text-lime">fitness journey.</span>
          </>
        }
        crumbs={[{ href: "/", label: "Home" }, { label: "About" }]}
      />

      <section className="container-fz grid gap-12 py-20 lg:grid-cols-2 lg:items-center">
        <Reveal className="space-y-6 text-lg leading-relaxed text-mist">
          <p>
            <strong className="text-white">Fitzone Supplements</strong> is a fitness nutrition retailer based in
            Nagarabhavi, Bengaluru. We stock gym supplements, sports nutrition, vitamins and training accessories for
            people at every stage of their fitness journey.
          </p>
          <p>
            What sets the store apart is the service. Customers come in to compare options, ask questions and get help
            finding products that suit their routine and budget — and many of our Google reviews mention exactly that.
          </p>
          <p>
            Visit us beside the Wakefit store in Nagarabhavi 2nd Stage, or message us on WhatsApp to check
            availability before you come in.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link href="/shop" className={fzButton("primary", "md")}>
              Explore products
            </Link>
            <WhatsAppLink source="about" message={storeAssistanceMessage()} className={fzButton("whatsapp", "md")}>
              <WhatsAppIcon className="size-4" /> Chat with us
            </WhatsAppLink>
          </div>
        </Reveal>
        <Reveal delay={0.1} className="grid grid-cols-2 gap-4">
          {[
            { value: SITE.googleRating.rating.toFixed(1), label: "Google rating (snapshot)" },
            { value: String(SITE.googleRating.count), label: "Google reviews (snapshot)" },
            { value: "560072", label: "Nagarabhavi, Bengaluru" },
            { value: SITE.hours.closingTime, label: "Closing time (as listed)" },
          ].map((s) => (
            <div key={s.label} className="metal-border rounded-2xl p-6">
              <p className="display text-5xl text-lime sm:text-6xl">{s.value}</p>
              <p className="mt-2 text-sm text-mist">{s.label}</p>
            </div>
          ))}
        </Reveal>
      </section>

      <section className="container-fz py-12">
        <SectionHeading
          eyebrow="Gallery"
          title={<>Inside <span className="text-lime">the store</span></>}
          description="Store photography is coming soon. Until then, these illustrative product photos stand in."
        />
        <Stagger className="grid auto-rows-[180px] grid-cols-2 gap-3 sm:auto-rows-[220px] sm:grid-cols-4">
          {GALLERY.map((g, i) => (
            <StaggerItem key={g.src} className={i === 0 ? "col-span-2 row-span-2" : undefined}>
              <figure className="group relative h-full overflow-hidden rounded-2xl border border-white/10 bg-[#efe6db]">
                <Image src={g.src} alt="Illustrative supplement product photo" fill sizes="(min-width: 640px) 25vw, 50vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                {i === 0 && (
                  <figcaption className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-obsidian/75 px-3 py-1.5 text-xs text-white backdrop-blur">
                    <Camera className="size-3.5 text-lime" /> Store photos coming soon
                  </figcaption>
                )}
              </figure>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <WhyChoose />

      <section className="container-fz grid gap-6 py-12 lg:grid-cols-2">
        <Reveal>
          <p className="eyebrow mb-3">Customer feedback</p>
          <h2 className="display text-5xl sm:text-6xl">What shoppers say</h2>
          <div className="mt-4 flex items-center gap-3 text-mist">
            <Stars /> {SITE.googleRating.rating.toFixed(1)} on Google · {SITE.googleRating.count} reviews (snapshot)
          </div>
          <a href={MAPS.reviews} target="_blank" rel="noopener noreferrer" className={fzButton("outline", "md", "mt-6")}>
            Read reviews on Google
          </a>
        </Reveal>
        <Reveal delay={0.1}>
          <TestimonialCarousel items={GOOGLE_QUOTES.map((quote) => ({ quote, source: "google" as const }))} />
        </Reveal>
      </section>

      <section className="container-fz py-12">
        <Reveal className="metal-border grid gap-6 rounded-3xl p-8 sm:p-10 md:grid-cols-[1fr_auto] md:items-center">
          <div className="flex gap-4">
            <MapPin className="mt-1 size-6 shrink-0 text-lime" />
            <div>
              <h2 className="font-heading text-xl font-semibold">Visit Fitzone Supplements</h2>
              <p className="mt-1 text-mist">{FULL_ADDRESS}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <TrackedAnchor href={MAPS.directions} event="directions_click" source="about" className={fzButton("primary", "md")}>
              Get directions
            </TrackedAnchor>
            <TrackedAnchor href={`tel:${SITE.phoneE164}`} event="call_click" source="about" className={fzButton("outline", "md")}>
              <Phone /> Call
            </TrackedAnchor>
          </div>
        </Reveal>
      </section>
    </>
  );
}
