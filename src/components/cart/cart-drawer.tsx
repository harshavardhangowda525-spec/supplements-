"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCart } from "@/lib/cart-store";
import { cartCount } from "@/lib/cart-math";
import { fzButton } from "@/components/brand/button-styles";
import { onlinePaymentsEnabled } from "@/lib/payments";
import { CartLines } from "./cart-lines";
import { CartCheckout } from "./cart-checkout";

export function CartDrawer() {
  const isOpen = useCart((s) => s.isOpen);
  const setOpen = useCart((s) => s.setOpen);
  const items = useCart((s) => s.items);
  const close = () => setOpen(false);

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent
        side="right"
        className="w-full gap-0 border-white/10 bg-charcoal p-0 text-white data-[side=right]:w-full data-[side=right]:sm:max-w-md"
      >
        <SheetHeader className="border-b border-white/10 p-5">
          <SheetTitle className="display text-3xl text-white">Your cart ({cartCount(items)})</SheetTitle>
          <SheetDescription className="text-mist">
            {onlinePaymentsEnabled()
              ? "Review items, then pay online for store pickup or send a WhatsApp inquiry."
              : "Review items, then send an inquiry on WhatsApp."}
          </SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
            <span className="grid size-16 place-items-center rounded-full bg-white/5 text-lime">
              <ShoppingBag className="size-7" />
            </span>
            <p className="font-heading text-lg font-semibold">Your cart is empty</p>
            <p className="text-sm text-mist">Browse the catalogue and add the supplements you’re interested in.</p>
            <Link href="/shop" onClick={close} className={fzButton("primary", "md")}>
              Shop supplements
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5">
              <CartLines compact onNavigate={close} />
            </div>
            <div className="border-t border-white/10 bg-obsidian/60 p-5">
              <CartCheckout onNavigate={close} />
              <Link href="/cart" onClick={close} className="mt-3 block text-center text-xs text-mist underline-offset-4 hover:text-lime hover:underline">
                View full cart
              </Link>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
