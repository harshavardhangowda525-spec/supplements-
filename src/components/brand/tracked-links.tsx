"use client";

import { track } from "@/lib/analytics";
import { waLink } from "@/lib/whatsapp";
import type { AnalyticsEvent } from "@/lib/validation";

type AnchorProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">;

/** External WhatsApp link with a prefilled, URL-encoded message + click tracking. */
export function WhatsAppLink({
  message,
  productSlug,
  source,
  onClick,
  children,
  ...rest
}: AnchorProps & { message?: string; productSlug?: string; source: string }) {
  return (
    <a
      href={waLink(message)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => {
        track("whatsapp_click", { productSlug, meta: { source } });
        onClick?.(e);
      }}
      {...rest}
    >
      {children}
    </a>
  );
}

export function TrackedAnchor({
  href,
  event,
  source,
  children,
  ...rest
}: AnchorProps & { href: string; event: AnalyticsEvent; source: string }) {
  const external = /^https?:/.test(href);
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      onClick={() => track(event, { meta: { source } })}
      {...rest}
    >
      {children}
    </a>
  );
}
