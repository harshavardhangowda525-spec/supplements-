"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { lineKey } from "@/lib/cart-math";
import { formatINR } from "@/lib/format";
import { track } from "@/lib/analytics";
import { DemoBadge } from "@/components/brand/demo-badge";

export function CartLines({ compact = false, onNavigate }: { compact?: boolean; onNavigate?: () => void }) {
  const items = useCart((s) => s.items);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);

  return (
    <ul className="divide-y divide-white/10">
      <AnimatePresence initial={false}>
        {items.map((item) => {
          const key = lineKey(item);
          return (
            <motion.li
              key={key}
              layout
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20, height: 0 }}
              className="flex gap-4 py-4"
            >
              <Link
                href={`/product/${item.slug}`}
                onClick={onNavigate}
                className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-[#efe6db] sm:size-24"
              >
                <Image src={item.image} alt="" fill sizes="96px" className="object-cover" />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[11px] tracking-[0.14em] text-mist uppercase">{item.brand}</p>
                    <Link
                      href={`/product/${item.slug}`}
                      onClick={onNavigate}
                      className="line-clamp-2 font-heading text-sm font-semibold text-white hover:text-lime"
                    >
                      {item.name}
                    </Link>
                    <p className="text-xs text-mist">{item.variantLabel}</p>
                    {item.isDemo && !compact && <DemoBadge className="mt-1" />}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      remove(key);
                      track("remove_from_cart", { productSlug: item.slug });
                    }}
                    className="rounded-full p-1.5 text-mist hover:bg-white/5 hover:text-red-300"
                    aria-label={`Remove ${item.name} from cart`}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
                <div className="mt-auto flex items-center justify-between pt-2">
                  <div className="flex items-center rounded-full border border-white/15" role="group" aria-label={`Quantity for ${item.name}`}>
                    <button
                      type="button"
                      onClick={() => setQty(key, item.quantity - 1)}
                      className="grid size-8 place-items-center rounded-full text-white hover:text-lime"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm tabular-nums" aria-live="polite">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQty(key, item.quantity + 1)}
                      disabled={item.quantity >= Math.min(item.maxQuantity, 20)}
                      className="grid size-8 place-items-center rounded-full text-white hover:text-lime disabled:opacity-40"
                      aria-label="Increase quantity"
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>
                  <span className="font-heading font-semibold text-white">{formatINR(item.price * item.quantity)}</span>
                </div>
              </div>
            </motion.li>
          );
        })}
      </AnimatePresence>
    </ul>
  );
}
