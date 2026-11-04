"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion } from "motion/react";
import { ArrowUpRight, ShoppingBag } from "lucide-react";
import type { Product } from "@/lib/types";
import { defaultVariant, discountPercent, formatINR } from "@/lib/format";
import { productInquiryMessage } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";
import { DemoBadge } from "@/components/brand/demo-badge";
import { WhatsAppLink } from "@/components/brand/tracked-links";
import { WhatsAppIcon } from "@/components/brand/icons";
import { fzButton } from "@/components/brand/button-styles";
import { useAddToCart } from "@/components/cart/use-add-to-cart";
import { StockPill } from "./stock-pill";

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const [variantId, setVariantId] = useState(() => defaultVariant(product).id);
  const variant = product.variants.find((v) => v.id === variantId) ?? product.variants[0];
  const discount = discountPercent(variant);
  const addToCart = useAddToCart();
  const href = `/product/${product.slug}`;

  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="group metal-border relative flex h-full flex-col overflow-hidden rounded-2xl hover:shadow-[0_30px_60px_-30px_rgb(198_255_0/0.35)]"
    >
      <Link href={href} className="relative block aspect-square overflow-hidden bg-[#efe6db]" aria-label={`View ${product.name}`}>
        <Image
          src={product.images[0]}
          alt={`${product.name} — illustrative product photo`}
          fill
          priority={priority}
          sizes="(min-width: 1280px) 300px, (min-width: 768px) 33vw, 50vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.07]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-obsidian/60 via-transparent to-transparent" />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {product.isDemo && <DemoBadge />}
          {discount && (
            <span className="rounded-full bg-lime px-2 py-0.5 font-heading text-[10px] font-bold text-obsidian">
              {discount}% OFF
            </span>
          )}
        </div>
        <span className="absolute right-3 bottom-3 grid size-9 place-items-center rounded-full bg-obsidian/70 text-white opacity-0 backdrop-blur transition-all duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
          <ArrowUpRight className="size-4" />
        </span>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <p className="font-heading text-[11px] font-semibold tracking-[0.16em] text-mist uppercase">{product.brand}</p>
          <h3 className="mt-1 font-heading text-base leading-snug font-semibold text-white">
            <Link href={href} className="hover:text-lime focus-visible:text-lime">
              {product.name}
            </Link>
          </h3>
        </div>

        {product.variants.length > 1 && (
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Choose option">
            {product.variants.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setVariantId(v.id)}
                aria-pressed={v.id === variant.id}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-[11px] transition-colors",
                  v.id === variant.id
                    ? "border-lime bg-lime/10 text-lime"
                    : "border-white/10 text-mist hover:border-white/30 hover:text-white",
                  v.stock <= 0 && "line-through opacity-60",
                )}
              >
                {v.label}
              </button>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-end justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-heading text-xl font-bold text-white">{formatINR(variant.price)}</span>
              {discount && <span className="text-xs text-mist line-through">{formatINR(variant.mrp!)}</span>}
            </div>
            <StockPill stock={variant.stock} className="mt-1" />
          </div>
        </div>

        <div className="grid grid-cols-[1fr_auto] gap-2">
          <button
            type="button"
            onClick={() => addToCart(product, variant)}
            disabled={variant.stock <= 0}
            className={fzButton("primary", "sm", "w-full")}
          >
            <ShoppingBag />
            {variant.stock > 0 ? (
              <>
                <span className="sm:hidden">Add</span>
                <span className="hidden sm:inline">Add to cart</span>
              </>
            ) : (
              "Sold out"
            )}
          </button>
          <WhatsAppLink
            source="product_card"
            productSlug={product.slug}
            message={productInquiryMessage(product.name, variant.label)}
            className={fzButton("outline", "sm", "w-9 px-0 hover:border-[#25D366] hover:text-[#25D366]")}
            aria-label={`Ask about ${product.name} on WhatsApp`}
          >
            <WhatsAppIcon className="size-4" />
          </WhatsAppLink>
        </div>
        <Link href={href} className="text-center text-xs font-medium text-mist underline-offset-4 hover:text-lime hover:underline">
          View details
        </Link>
      </div>
    </motion.article>
  );
}
