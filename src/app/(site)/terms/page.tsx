import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/legal";
import { FULL_ADDRESS, SITE } from "@/lib/site";
import { onlinePaymentsEnabled } from "@/lib/payments";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Terms for using the Fitzone Supplements website.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms & Conditions" updated="November 2026">
      <p>By using this website you agree to the terms below.</p>

      <h2>Product information</h2>
      <p>
        We try to keep product details, prices and availability accurate, but they may change and may differ from
        what is in store. Products marked <strong className="text-white">“Demo data”</strong> are sample listings and
        do not represent actual inventory, brands, prices or stock. Product photos may be illustrative.
      </p>

      <h2>WhatsApp and form inquiries</h2>
      <p>
        Sending your cart on WhatsApp or through the inquiry form creates an
        <strong className="text-white"> inquiry only</strong>. It is confirmed only when {SITE.name} replies and
        accepts it, confirming availability and the final price.
      </p>

      <h2>Online payment (store pickup)</h2>
      {onlinePaymentsEnabled() ? (
        <>
          <p>
            Where online payment is offered, payments are processed securely by Razorpay. The amount is calculated from
            current store prices when you check out. Your order is confirmed once payment succeeds and you receive an
            order number.
          </p>
          <p>
            Online orders are for <strong className="text-white">pickup from the store</strong> at {FULL_ADDRESS}. Please
            bring your order number. If an item becomes unavailable, the store will contact you about an alternative or a
            refund to your original payment method.
          </p>
        </>
      ) : (
        <p>Online payment is not currently offered on this website.</p>
      )}

      <h2>Health information</h2>
      <p>
        Content on this website is general information, not medical advice. Supplements are not intended to diagnose,
        treat, cure or prevent any disease. Read product labels and consult a qualified professional before use,
        especially if you are pregnant, nursing, under 18, have a medical condition or take medication.
      </p>

      <h2>Reviews</h2>
      <p>
        Website reviews are moderated before publication. The Google rating shown is a snapshot provided by the
        business and does not update automatically.
      </p>

      <h2>Shipping, returns & refunds</h2>
      <p>These policies will be published once confirmed by the store. Please ask the store directly for current terms.</p>

      <h2>Contact</h2>
      <p>Questions about these terms? Call {SITE.phoneDisplay}.</p>
    </LegalPage>
  );
}
