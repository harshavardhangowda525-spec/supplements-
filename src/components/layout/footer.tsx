import Link from "next/link";
import { MapPin, Phone, Clock } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { WhatsAppLink, TrackedAnchor } from "@/components/brand/tracked-links";
import { WhatsAppIcon } from "@/components/brand/icons";
import { FULL_ADDRESS, MAPS, SITE } from "@/lib/site";
import { storeAssistanceMessage } from "@/lib/whatsapp";
import type { Category } from "@/lib/types";

export function Footer({ categories, closingTime }: { categories: Category[]; closingTime: string }) {
  return (
    <footer className="relative mt-24 border-t border-white/10 bg-charcoal/60">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-lime/60 to-transparent" />
      <div className="container-fz grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr]">
        <div className="space-y-5">
          <Logo />
          <p className="max-w-xs text-sm leading-relaxed text-mist">
            A Bengaluru destination for gym supplements, sports nutrition and fitness accessories — with friendly,
            knowledgeable in-store help.
          </p>
          <WhatsAppLink
            source="footer"
            message={storeAssistanceMessage()}
            className="inline-flex items-center gap-2 text-sm font-medium text-[#25D366] hover:underline"
          >
            <WhatsAppIcon className="size-4" /> Chat with us on WhatsApp
          </WhatsAppLink>
        </div>

        <div>
          <h3 className="eyebrow mb-4">Shop</h3>
          <ul className="space-y-2.5 text-sm">
            <li>
              <Link href="/shop" className="text-mist hover:text-white">
                All products
              </Link>
            </li>
            {categories.map((c) => (
              <li key={c.slug}>
                <Link href={`/category/${c.slug}`} className="text-mist hover:text-white">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="eyebrow mb-4">Fitzone</h3>
          <ul className="space-y-2.5 text-sm">
            {[
              ["/about", "About us"],
              ["/reviews", "Customer reviews"],
              ["/contact", "Contact & location"],
              ["/cart", "Your cart"],
              ["/privacy", "Privacy policy"],
              ["/terms", "Terms & conditions"],
            ].map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="text-mist hover:text-white">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="eyebrow mb-4">Visit the store</h3>
          <ul className="space-y-4 text-sm text-mist">
            <li className="flex gap-3">
              <MapPin className="mt-0.5 size-4 shrink-0 text-lime" />
              <TrackedAnchor href={MAPS.directions} event="directions_click" source="footer" className="hover:text-white">
                {FULL_ADDRESS}
              </TrackedAnchor>
            </li>
            <li className="flex gap-3">
              <Phone className="mt-0.5 size-4 shrink-0 text-lime" />
              <TrackedAnchor href={`tel:${SITE.phoneE164}`} event="call_click" source="footer" className="hover:text-white">
                {SITE.phoneDisplay}
              </TrackedAnchor>
            </li>
            <li className="flex gap-3">
              <Clock className="mt-0.5 size-4 shrink-0 text-lime" />
              <span>Closes {closingTime}. Please call to confirm opening hours.</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-fz flex flex-col gap-2 py-6 text-xs text-white/60 md:flex-row md:items-center md:justify-between">
          <p>© {SITE.name}, Bengaluru.</p>
          <p>
            Product photos are illustrative (Pexels / Unsplash) and don’t show actual store inventory.
          </p>
        </div>
      </div>
    </footer>
  );
}
