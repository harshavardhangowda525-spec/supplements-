"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { cartSubtotal } from "@/lib/cart-math";
import { formatINR } from "@/lib/format";
import { cartInquiryMessage, waLink } from "@/lib/whatsapp";
import { track } from "@/lib/analytics";
import { onlinePaymentsEnabled } from "@/lib/payments";
import { cn } from "@/lib/utils";
import { fzButton } from "@/components/brand/button-styles";
import { WhatsAppIcon } from "@/components/brand/icons";
import { OnlinePayment } from "./online-payment";

type Mode = "online" | "whatsapp";

/** Order summary + checkout: online payment (store pickup) and/or WhatsApp inquiry. */
export function CartCheckout({ onNavigate }: { onNavigate?: () => void }) {
  const items = useCart((s) => s.items);
  const [name, setName] = useState("");
  const subtotal = cartSubtotal(items);
  const hasDemo = items.some((i) => i.isDemo);
  const online = onlinePaymentsEnabled();
  const [mode, setMode] = useState<Mode>(online && !hasDemo ? "online" : "whatsapp");

  function sendInquiry() {
    track("cart_whatsapp_checkout", { meta: { lines: items.length, subtotal } });
    window.open(waLink(cartInquiryMessage(items, name.trim() || undefined)), "_blank", "noopener,noreferrer");
  }

  return (
    <div className="space-y-4">
      <dl className="space-y-2 text-sm">
        <div className="flex justify-between text-mist">
          <dt>Items</dt>
          <dd>{items.reduce((s, i) => s + i.quantity, 0)}</dd>
        </div>
        <div className="flex justify-between text-base">
          <dt className="font-heading font-semibold text-white">{online && !hasDemo ? "Total" : "Estimated total"}</dt>
          <dd className="font-heading text-xl font-bold text-lime">{formatINR(subtotal)}</dd>
        </div>
      </dl>

      {online && (
        <div role="tablist" aria-label="Checkout method" className="grid grid-cols-2 gap-1 rounded-full border border-white/10 p-1">
          {(
            [
              ["online", "Pay online"],
              ["whatsapp", "WhatsApp inquiry"],
            ] as const
          ).map(([m, label]) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              onClick={() => setMode(m)}
              className={cn(
                "rounded-full py-2 font-heading text-xs font-semibold tracking-wide uppercase transition-colors",
                mode === m ? "bg-lime text-obsidian" : "text-white/70 hover:text-white",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {online && mode === "online" ? (
        <OnlinePayment onDone={onNavigate} />
      ) : (
        <>
          <label className="block">
            <span className="mb-1.5 block text-xs text-mist">Your name (optional, added to the message)</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 60))}
              placeholder="e.g. Rahul"
              autoComplete="given-name"
              className="h-11 w-full rounded-xl border border-white/15 bg-white/[0.03] px-4 text-sm text-white placeholder:text-white/30 focus:border-lime focus:outline-none"
            />
          </label>

          <button type="button" onClick={sendInquiry} disabled={!items.length} className={fzButton("whatsapp", "lg", "w-full")}>
            <WhatsAppIcon /> Send order inquiry on WhatsApp
          </button>

          <p className="flex gap-2 text-xs leading-relaxed text-mist">
            <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            <span>
              This sends your cart to Fitzone as an <strong className="text-white">inquiry</strong>. Your order is only
              confirmed once the store replies with availability and the final price.
              {!online && " No payment is taken on this website."}
              {hasDemo && " Prices shown are sample prices."}
            </span>
          </p>
        </>
      )}
    </div>
  );
}
