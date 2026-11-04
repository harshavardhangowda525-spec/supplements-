"use client";

import Link from "next/link";
import { useEffect } from "react";
import { fzButton } from "@/components/brand/button-styles";

export default function SiteError({ error, unstable_retry }: { error: Error & { digest?: string }; unstable_retry?: () => void; reset?: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container-fz flex min-h-[60vh] flex-col items-center justify-center gap-5 py-20 text-center">
      <p className="eyebrow">Something went wrong</p>
      <h1 className="display text-6xl">We dropped the bar.</h1>
      <p className="max-w-md text-mist">An unexpected error occurred while loading this page. Please try again.</p>
      <div className="flex gap-3">
        <button type="button" onClick={() => (unstable_retry ? unstable_retry() : window.location.reload())} className={fzButton("primary", "md")}>
          Try again
        </button>
        <Link href="/" className={fzButton("outline", "md")}>
          Go home
        </Link>
      </div>
    </div>
  );
}
