import { Clock, MapPin, Navigation, Phone } from "lucide-react";
import { SectionHeading } from "@/components/brand/section-heading";
import { Reveal } from "@/components/brand/reveal";
import { fzButton } from "@/components/brand/button-styles";
import { TrackedAnchor, WhatsAppLink } from "@/components/brand/tracked-links";
import { WhatsAppIcon } from "@/components/brand/icons";
import { FULL_ADDRESS, MAPS, SITE } from "@/lib/site";
import { storeAssistanceMessage } from "@/lib/whatsapp";
import type { StoreSettings } from "@/lib/types";

export function MapEmbed({ className }: { className?: string }) {
  return (
    <iframe
      title="Map showing Fitzone Supplements, Nagarabhavi, Bengaluru"
      src={MAPS.embed}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      className={className ?? "h-full min-h-[340px] w-full rounded-3xl border-0 grayscale-[0.6] invert-[0.92] hue-rotate-180"}
    />
  );
}

export function HoursBlock({ settings }: { settings: StoreSettings }) {
  return settings.hoursText ? (
    <p className="whitespace-pre-line text-mist">{settings.hoursText}</p>
  ) : (
    <div className="text-mist">
      <p>
        Closes at <strong className="text-white">{settings.closingTime}</strong> (as listed).
      </p>
      <p className="mt-1 text-xs text-white/50">Full opening hours are being confirmed — please call before visiting.</p>
    </div>
  );
}

export function LocationSection({ settings }: { settings: StoreSettings }) {
  return (
    <section className="container-fz py-24" id="visit">
      <SectionHeading eyebrow="Visit the store" title={<>Find us in <span className="text-lime">Nagarabhavi</span></>} />
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <Reveal className="metal-border flex flex-col gap-7 rounded-3xl p-8 sm:p-10">
          <div className="flex gap-4">
            <MapPin className="mt-1 size-5 shrink-0 text-lime" />
            <div>
              <h3 className="font-heading font-semibold text-white">{SITE.name}</h3>
              <address className="mt-1 not-italic text-mist">{FULL_ADDRESS}</address>
            </div>
          </div>
          <div className="flex gap-4">
            <Phone className="mt-1 size-5 shrink-0 text-lime" />
            <TrackedAnchor href={`tel:${SITE.phoneE164}`} event="call_click" source="location_section" className="font-heading text-lg text-white hover:text-lime">
              {SITE.phoneDisplay}
            </TrackedAnchor>
          </div>
          <div className="flex gap-4">
            <Clock className="mt-1 size-5 shrink-0 text-lime" />
            <HoursBlock settings={settings} />
          </div>
          <div className="mt-auto grid gap-3 sm:grid-cols-3">
            <TrackedAnchor href={MAPS.directions} event="directions_click" source="location_section" className={fzButton("primary", "md")}>
              <Navigation /> Directions
            </TrackedAnchor>
            <TrackedAnchor href={`tel:${SITE.phoneE164}`} event="call_click" source="location_section_btn" className={fzButton("outline", "md")}>
              <Phone /> Call
            </TrackedAnchor>
            <WhatsAppLink source="location_section" message={storeAssistanceMessage()} className={fzButton("whatsapp", "md")}>
              <WhatsAppIcon className="size-4" /> WhatsApp
            </WhatsAppLink>
          </div>
        </Reveal>
        <Reveal delay={0.1} className="overflow-hidden rounded-3xl border border-white/10">
          <MapEmbed />
        </Reveal>
      </div>
    </section>
  );
}
