import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { CartPageView } from "@/components/cart/cart-page-view";

export const metadata: Metadata = {
  title: "Your Cart",
  description: "Review your cart and send it to Fitzone Supplements as a WhatsApp order inquiry.",
  robots: { index: false, follow: true },
};

export default function CartPage() {
  return (
    <>
      <PageHeader
        eyebrow="Order summary"
        title={
          <>
            Your <span className="text-lime">cart</span>
          </>
        }
        crumbs={[{ href: "/", label: "Home" }, { label: "Cart" }]}
      />
      <div className="container-fz py-10">
        <CartPageView />
      </div>
    </>
  );
}
