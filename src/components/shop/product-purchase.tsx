"use client";

import { useEffect, useState } from "react";
import { Minus, Plus, ShoppingBag, PackageSearch } from "lucide-react";
import type { Product } from "@/lib/types";
import { defaultVariant, discountPercent, formatINR } from "@/lib/format";
import { availabilityMessage, productInquiryMessage } from "@/lib/whatsapp";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { fzButton } from "@/components/brand/button-styles";
import { WhatsAppLink } from "@/components/brand/tracked-links";
import { WhatsAppIcon } from "@/components/brand/icons";
import { useAddToCart } from "@/components/cart/use-add-to-cart";
import { StockPill } from "./stock-pill";

export function ProductPurchase({ product }: { product: Product }) {
  const [variantId, setVariantId] = useState(() => defaultVariant(product).id);
  const [qty, setQty] = useState(1);
  const variant = product.variants.find((v) => v.id === variantId) ?? product.variants[0];
  const discount = discountPercent(variant);
  const addToCart = useAddToCart();
  const maxQty = Math.max(1, Math.min(variant.stock, 20));
  const soldOut = variant.stock <= 0;

  useEffect(() => {
    track("product_view", { productSlug: product.slug });
  }, [product.slug]);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-baseline gap-3">
          <span className="font-heading text-4xl font-bold text-white">{formatINR(variant.price)}</span>
          {discount && (
            <>
              <span className="text-lg text-mist line-through">{formatINR(variant.mrp!)}</span>
              <span className="rounded-full bg-lime px-2.5 py-0.5 font-heading text-xs font-bold text-obsidian">{discount}% OFF</span>
            </>
          )}
        </div>
        <p className="mt-1 text-xs text-mist">
          {product.isDemo ? "Sample price for demonstration. " : "Price shown on website. "}Please confirm the final price with the store.
        </p>
        <StockPill stock={variant.stock} className="mt-3 text-sm" />
      </div>

      <fieldset>
        <legend className="eyebrow mb-3">Choose option</legend>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {product.variants.map((v) => (
            <label
              key={v.id}
              className={cn(
                "flex cursor-pointer items-center justify-between gap-3 rounded-2xl border p-3.5 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-lime",
                v.id === variant.id ? "border-lime bg-lime/[0.07]" : "border-white/15 hover:border-white/35",
              )}
            >
              <input
                type="radio"
                name="variant"
                value={v.id}
                checked={v.id === variant.id}
                onChange={() => {
                  setVariantId(v.id);
                  setQty(1);
                }}
                className="sr-only"
              />
              <span>
                <span className={cn("block text-sm font-medium", v.stock <= 0 ? "text-white/50" : "text-white")}>{v.label}</span>
                <span className="text-xs text-mist">{v.stock > 0 ? "Available" : "Out of stock"}</span>
              </span>
              <span className="font-heading text-sm font-semibold text-white">{formatINR(v.price)}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex h-14 items-center justify-between rounded-full border border-white/15 px-2 sm:w-36" role="group" aria-label="Quantity">
          <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid size-10 place-items-center rounded-full hover:text-lime" aria-label="Decrease quantity">
            <Minus className="size-4" />
          </button>
          <span className="w-8 text-center font-heading text-lg tabular-nums" aria-live="polite">
            {qty}
          </span>
          <button type="button" onClick={() => setQty((q) => Math.min(maxQty, q + 1))} disabled={soldOut || qty >= maxQty} className="grid size-10 place-items-center rounded-full hover:text-lime disabled:opacity-40" aria-label="Increase quantity">
            <Plus className="size-4" />
          </button>
        </div>
        <button type="button" onClick={() => addToCart(product, variant, qty)} disabled={soldOut} className={fzButton("primary", "lg", "flex-1")}>
          <ShoppingBag /> {soldOut ? "Out of stock" : "Add to cart"}
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <WhatsAppLink
          source="product_page_order"
          productSlug={product.slug}
          message={productInquiryMessage(product.name, variant.label)}
          className={fzButton("whatsapp", "md")}
        >
          <WhatsAppIcon className="size-4" /> Order via WhatsApp
        </WhatsAppLink>
        <WhatsAppLink
          source="product_page_availability"
          productSlug={product.slug}
          message={availabilityMessage(product.name, variant.label)}
          className={fzButton("outline", "md")}
        >
          <PackageSearch /> Check availability
        </WhatsAppLink>
      </div>

      {/* Sticky mobile purchase bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-obsidian/90 p-3 backdrop-blur-xl md:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-mist">{variant.label}</p>
            <p className="font-heading text-lg font-bold text-white">{formatINR(variant.price)}</p>
          </div>
          <button type="button" onClick={() => addToCart(product, variant, qty)} disabled={soldOut} className={fzButton("primary", "md")}>
            <ShoppingBag /> {soldOut ? "Sold out" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
