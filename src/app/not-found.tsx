import Link from "next/link";
import { fzButton } from "@/components/brand/button-styles";
import { Logo } from "@/components/brand/logo";

export default function NotFound() {
  return (
    <main className="grain relative flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <Logo />
      <p className="display text-[9rem] leading-none text-lime sm:text-[12rem]">404</p>
      <h1 className="font-heading text-2xl font-semibold">This page skipped leg day.</h1>
      <p className="max-w-md text-mist">We couldn’t find what you were looking for. Try the shop or head back home.</p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/shop" className={fzButton("primary", "md")}>
          Shop supplements
        </Link>
        <Link href="/" className={fzButton("outline", "md")}>
          Go home
        </Link>
      </div>
    </main>
  );
}
