import type { Metadata } from "next";
import { Clock, MapPin, Navigation, Phone, MessageCircle, PackageSearch, ShoppingBag, HelpCircle } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Reveal } from "@/components/brand/reveal";
import { fzButton } from "@/components/brand/button-styles";
import { TrackedAnchor, WhatsAppLink } from "@/components/brand/tracked-links";
import { WhatsAppIcon } from "@/components/brand/icons";
import { HoursBlock, MapEmbed } from "@/components/home/location-section";
import { InquiryForm } from "@/components/forms/inquiry-form";
import { getStoreSettings } from "@/lib/data/catalog";
import { FULL_ADDRESS, MAPS, SITE } from "@/lib/site";
import { orderInquiryFollowUpMessage, storeAssistanceMessage } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Contact & Store Location — Nagarabhavi, Bengaluru",
  description: `Visit Fitzone Supplements at ${FULL_ADDRESS}. Call ${SITE.phoneDisplay} or message us on WhatsApp.`,
  alternates: { canonical: "/contact" },
};

const WA_ACTIONS = [
  { icon: MessageCircle, title: "Product inquiry", body: "Ask about a specific product, brand or flavour.", message: "Hello Fitzone Supplements! I have a question about a product." },
  { icon: PackageSearch, title: "Availability check", body: "Check stock before you visit.", message: "Hello Fitzone Supplements! Could you please check if a product is currently in stock?" },
  { icon: HelpCircle, title: "Store assistance", body: "Get help choosing what suits your routine.", message: storeAssistanceMessage() },
  { icon: ShoppingBag, title: "Order inquiry", body: "Follow up on an inquiry you’ve sent.", message: orderInquiryFollowUpMessage() },
];

export default async function ContactPage() {
  const settings = await getStoreSettings();
  return (
    <>
      <PageHeader
        eyebrow="Contact & location"
        title={
          <>
            Visit <span className="text-lime">Fitzone</span>
          </>
        }
        description="Find the store in Nagarabhavi 2nd Stage, call us, or message us on WhatsApp."
        crumbs={[{ href: "/", label: "Home" }, { label: "Contact" }]}
      />

      <section className="container-fz grid gap-6 py-16 lg:grid-cols-[1fr_1.2fr]">
        <Reveal className="metal-border flex flex-col gap-7 rounded-3xl p-8 sm:p-10">
          <div className="flex gap-4">
            <MapPin className="mt-1 size-5 shrink-0 text-lime" />
            <div>
              <h2 className="font-heading font-semibold">{SITE.name}</h2>
              <address className="mt-1 not-italic text-mist">{FULL_ADDRESS}</address>
            </div>
          </div>
          <div className="flex gap-4">
            <Phone className="mt-1 size-5 shrink-0 text-lime" />
            <TrackedAnchor href={`tel:${SITE.phoneE164}`} event="call_click" source="contact" className="font-heading text-lg hover:text-lime">
              {SITE.phoneDisplay}
            </TrackedAnchor>
          </div>
          <div className="flex gap-4">
            <Clock className="mt-1 size-5 shrink-0 text-lime" />
            <div>
              <h2 className="mb-1 font-heading font-semibold">Business hours</h2>
              <HoursBlock settings={settings} />
            </div>
          </div>
          <div className="mt-auto grid gap-3 sm:grid-cols-3">
            <TrackedAnchor href={MAPS.directions} event="directions_click" source="contact" className={fzButton("primary", "md")}>
              <Navigation /> Directions
            </TrackedAnchor>
            <TrackedAnchor href={`tel:${SITE.phoneE164}`} event="call_click" source="contact_btn" className={fzButton("outline", "md")}>
              <Phone /> Tap to call
            </TrackedAnchor>
            <WhatsAppLink source="contact" message={storeAssistanceMessage()} className={fzButton("whatsapp", "md")}>
              <WhatsAppIcon className="size-4" /> WhatsApp
            </WhatsAppLink>
          </div>
          <a href={settings.mapsUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-mist underline-offset-4 hover:text-lime hover:underline">
            Open in Google Maps
          </a>
        </Reveal>
        <Reveal delay={0.1} className="min-h-[380px] overflow-hidden rounded-3xl border border-white/10">
          <MapEmbed />
        </Reveal>
      </section>

      <section className="container-fz py-8">
        <p className="eyebrow mb-3">WhatsApp</p>
        <h2 className="display mb-8 text-5xl">How can we help?</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {WA_ACTIONS.map(({ icon: Icon, title, body, message }) => (
            <WhatsAppLink
              key={title}
              source={`contact_${title.toLowerCase().replace(/\s+/g, "_")}`}
              message={message}
              className="group metal-border flex flex-col gap-3 rounded-2xl p-6 transition-shadow hover:shadow-[0_20px_50px_-20px_rgb(37_211_102/0.5)]"
            >
              <Icon className="size-6 text-[#25D366]" />
              <span className="font-heading font-semibold text-white">{title}</span>
              <span className="text-sm text-mist">{body}</span>
              <span className="mt-auto text-xs font-semibold text-[#25D366] group-hover:underline">Open WhatsApp →</span>
            </WhatsAppLink>
          ))}
        </div>
      </section>

      <section className="container-fz py-16">
        <Reveal className="metal-border mx-auto max-w-3xl rounded-3xl p-6 sm:p-10">
          <h2 className="display text-4xl sm:text-5xl">Send an inquiry</h2>
          <p className="mb-6 mt-2 text-sm text-mist">Prefer not to use WhatsApp? Leave your details and the store will get back to you.</p>
          <InquiryForm />
        </Reveal>
      </section>
    </>
  );
}
