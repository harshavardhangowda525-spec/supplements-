"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CreditCard, Store, FlaskConical } from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { cartSubtotal } from "@/lib/cart-math";
import { formatINR } from "@/lib/format";
import { RAZORPAY_CHECKOUT_SRC, isTestMode } from "@/lib/payments";
import { SITE } from "@/lib/site";
import { fzButton } from "@/components/brand/button-styles";

type RazorpaySuccess = { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string };
type RazorpayInstance = { open: () => void; on: (event: string, cb: (resp: { error?: { description?: string } }) => void) => void };
declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance;
  }
}

let scriptPromise: Promise<boolean> | null = null;
function loadCheckout(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);
  scriptPromise ??= new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = RAZORPAY_CHECKOUT_SRC;
    s.async = true;
    s.onload = () => resolve(true);
    s.onerror = () => {
      scriptPromise = null;
      resolve(false);
    };
    document.body.appendChild(s);
  });
  return scriptPromise;
}

const input =
  "h-11 w-full rounded-xl border border-white/15 bg-white/[0.03] px-4 text-sm text-white placeholder:text-white/30 focus:border-lime focus:outline-none";

export function OnlinePayment({ onDone }: { onDone?: () => void }) {
  const router = useRouter();
  const items = useCart((s) => s.items);
  const clear = useCart((s) => s.clear);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const total = cartSubtotal(items);
  const hasDemo = items.some((i) => i.isDemo);

  if (hasDemo) {
    return (
      <p className="flex gap-2 rounded-xl border border-amber-300/25 bg-amber-300/[0.07] p-3 text-xs text-amber-100/90">
        <FlaskConical className="mt-0.5 size-3.5 shrink-0 text-amber-300" />
        Online payment isn’t available for sample (demo) products. Use the WhatsApp inquiry instead.
      </p>
    );
  }

  async function pay(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const [ok, res] = await Promise.all([
        loadCheckout(),
        fetch("/api/payments/razorpay/order", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            name,
            phone,
            email,
            items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
          }),
        }),
      ]);
      const data = (await res.json()) as {
        error?: string;
        orderId?: string;
        orderNumber?: string;
        razorpayOrderId?: string;
        amount?: number;
        currency?: string;
        keyId?: string;
      };
      if (!res.ok || !data.razorpayOrderId) throw new Error(data.error ?? "Couldn’t start the payment.");
      if (!ok || !window.Razorpay) throw new Error("Couldn’t load the Razorpay checkout. Check your connection and try again.");

      const rzp = new window.Razorpay({
        key: data.keyId,
        order_id: data.razorpayOrderId,
        amount: data.amount,
        currency: data.currency,
        name: SITE.name,
        description: `Order ${data.orderNumber} · Store pickup`,
        prefill: { name, contact: phone, email: email || undefined },
        notes: { order_number: data.orderNumber },
        theme: { color: "#C6FF00" },
        modal: {
          ondismiss: () => {
            setBusy(false);
            toast.info("Payment cancelled", { description: "Your cart is still saved." });
          },
        },
        handler: async (resp: RazorpaySuccess) => {
          try {
            const v = await fetch("/api/payments/razorpay/verify", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify(resp),
            });
            const result = (await v.json()) as { ok?: boolean; orderId?: string; error?: string };
            if (!v.ok || !result.ok) throw new Error(result.error ?? "Payment verification failed.");
            clear();
            onDone?.();
            router.push(`/order/${result.orderId}`);
          } catch (err) {
            setBusy(false);
            setError(`${(err as Error).message} Payment ID: ${resp.razorpay_payment_id}`);
          }
        },
      });
      rzp.on("payment.failed", (resp) => {
        toast.error("Payment failed", { description: resp.error?.description ?? "Please try again." });
      });
      // The cart drawer is a modal that traps focus; close it so the Razorpay
      // popup (rendered outside it) can receive clicks and keyboard input.
      useCart.getState().close();
      rzp.open();
    } catch (err) {
      setBusy(false);
      setError((err as Error).message);
    }
  }

  return (
    <form onSubmit={pay} className="space-y-3">
      <p className="flex items-start gap-2 text-xs text-mist">
        <Store className="mt-0.5 size-3.5 shrink-0 text-lime" />
        Pay online and collect from the store in Nagarabhavi. Show your order number at pickup.
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="block">
          <span className="sr-only">Your name</span>
          <input className={input} placeholder="Your name *" value={name} onChange={(e) => setName(e.target.value.slice(0, 80))} autoComplete="name" required minLength={2} />
        </label>
        <label className="block">
          <span className="sr-only">Mobile number</span>
          <input className={input} placeholder="Mobile number *" type="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value.slice(0, 16))} autoComplete="tel" required />
        </label>
      </div>
      <label className="block">
        <span className="sr-only">Email (optional)</span>
        <input className={input} placeholder="Email (optional)" type="email" value={email} onChange={(e) => setEmail(e.target.value.slice(0, 120))} autoComplete="email" />
      </label>
      {error && (
        <p role="alert" className="rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-xs text-red-200">
          {error}
        </p>
      )}
      <button type="submit" disabled={busy || !items.length} className={fzButton("primary", "lg", "w-full")}>
        <CreditCard /> {busy ? "Opening payment…" : `Pay ${formatINR(total)} online`}
      </button>
      <p className="text-[11px] text-white/60">
        Secure payment by Razorpay (UPI, cards, netbanking). Final amount is calculated from current store prices.
        {isTestMode() && " Test mode — no real money is charged."} Questions? Call {SITE.phoneDisplay}.
      </p>
    </form>
  );
}
