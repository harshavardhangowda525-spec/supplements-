"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { fzButton } from "@/components/brand/button-styles";
import { Skeleton } from "@/components/ui/skeleton";
import { CartLines } from "./cart-lines";
import { CartCheckout } from "./cart-checkout";

function useHydrated() {
  return useSyncExternalStore(
    (cb) => useCart.persist.onFinishHydration(cb),
    () => useCart.persist.hasHydrated(),
    () => false,
  );
}

export function CartPageView() {
  const items = useCart((s) => s.items);
  const clear = useCart((s) => s.clear);
  const hydrated = useHydrated();

  if (!hydrated) {
    return (
      <div className="grid gap-8 lg:grid-cols-[1fr_400px]" aria-busy="true">
        <Skeleton className="h-64 rounded-3xl bg-white/5" />
        <Skeleton className="h-80 rounded-3xl bg-white/5" />
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="metal-border mx-auto flex max-w-xl flex-col items-center gap-4 rounded-3xl px-6 py-16 text-center">
        <span className="grid size-16 place-items-center rounded-full bg-white/5 text-lime">
          <ShoppingBag className="size-7" />
        </span>
        <h2 className="font-heading text-xl font-semibold">Your cart is empty</h2>
        <p className="text-sm text-mist">Add supplements from the catalogue, then send your list to us on WhatsApp.</p>
        <Link href="/shop" className={fzButton("primary", "md")}>
          Shop supplements
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
      <div className="metal-border rounded-3xl px-5 sm:px-8">
        <CartLines />
        <div className="flex items-center justify-between border-t border-white/10 py-5">
          <Link href="/shop" className="inline-flex items-center gap-2 text-sm text-mist hover:text-lime">
            <ArrowLeft className="size-4" /> Continue shopping
          </Link>
          <button type="button" onClick={clear} className="text-sm text-mist hover:text-red-300">
            Clear cart
          </button>
        </div>
      </div>
      <aside className="metal-border h-fit rounded-3xl p-6 lg:sticky lg:top-28">
        <h2 className="display mb-5 text-3xl">Order summary</h2>
        <CartCheckout />
      </aside>
    </div>
  );
}
