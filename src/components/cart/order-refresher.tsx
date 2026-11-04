"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** While a payment is still being confirmed, re-check the order every few seconds (max ~1 min). */
export function OrderRefresher() {
  const router = useRouter();
  useEffect(() => {
    let n = 0;
    const t = setInterval(() => {
      n += 1;
      router.refresh();
      if (n >= 12) clearInterval(t);
    }, 5000);
    return () => clearInterval(t);
  }, [router]);
  return null;
}
