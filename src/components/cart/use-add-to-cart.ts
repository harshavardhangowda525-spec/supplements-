"use client";

import { toast } from "sonner";
import { useCart } from "@/lib/cart-store";
import { track } from "@/lib/analytics";
import type { Product, Variant } from "@/lib/types";

export function useAddToCart() {
  const add = useCart((s) => s.add);
  return (product: Product, variant: Variant, quantity = 1) => {
    if (variant.stock <= 0) {
      toast.error("This option is out of stock", { description: "Ask us on WhatsApp — we can check incoming stock." });
      return;
    }
    add({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      brand: product.brand,
      image: product.images[0],
      variantId: variant.id,
      variantLabel: variant.label,
      price: variant.price,
      quantity,
      maxQuantity: variant.stock,
      isDemo: product.isDemo,
    });
    track("add_to_cart", { productSlug: product.slug, meta: { variant: variant.label, quantity } });
  };
}
