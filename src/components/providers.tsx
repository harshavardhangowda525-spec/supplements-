"use client";

import { Suspense, useEffect } from "react";
import { usePathname } from "next/navigation";
import { MotionConfig } from "motion/react";
import { Toaster } from "@/components/ui/sonner";
import { useCart } from "@/lib/cart-store";
import { track } from "@/lib/analytics";

function CartHydration() {
  useEffect(() => {
    void useCart.persist.rehydrate();
  }, []);
  return null;
}

function PageViews() {
  const pathname = usePathname();
  useEffect(() => {
    if (!pathname.startsWith("/admin")) track("page_view");
  }, [pathname]);
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <CartHydration />
      <Suspense fallback={null}>
        <PageViews />
      </Suspense>
      {children}
      <Toaster position="top-center" richColors closeButton />
    </MotionConfig>
  );
}
