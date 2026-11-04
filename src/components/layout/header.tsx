"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { Menu, Phone, ShoppingBag, X } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { fzButton } from "@/components/brand/button-styles";
import { TrackedAnchor } from "@/components/brand/tracked-links";
import { useCart } from "@/lib/cart-store";
import { cartCount } from "@/lib/cart-math";
import { NAV_LINKS, SITE } from "@/lib/site";
import { cn } from "@/lib/utils";

export function Header({ announcement }: { announcement?: string | null }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 24));

  const items = useCart((s) => s.items);
  const openCart = useCart((s) => s.open);
  const count = cartCount(items);

  // Close the mobile menu whenever the route changes.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setMenuOpen(false);
  }

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <>
      {announcement && (
        <div className="bg-lime px-4 py-2 text-center font-heading text-xs font-semibold tracking-wide text-obsidian">
          {announcement}
        </div>
      )}
      <header
        className={cn(
          "sticky top-0 z-40 transition-[background-color,border-color,backdrop-filter] duration-300",
          scrolled || menuOpen
            ? "border-b border-white/10 bg-obsidian/80 backdrop-blur-xl"
            : "border-b border-transparent bg-transparent",
        )}
      >
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-full focus:bg-lime focus:px-4 focus:py-2 focus:text-obsidian"
        >
          Skip to content
        </a>
        <div className="container-fz flex h-16 items-center justify-between gap-4 md:h-20">
          <Logo />

          <nav aria-label="Main" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className={cn(
                      "relative rounded-full px-4 py-2 font-heading text-sm font-medium transition-colors",
                      isActive(l.href) ? "text-lime" : "text-white/80 hover:text-white",
                    )}
                  >
                    {l.label}
                    {isActive(l.href) && (
                      <motion.span layoutId="nav-dot" className="absolute inset-x-4 -bottom-0.5 h-px bg-lime" />
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <TrackedAnchor
              href={`tel:${SITE.phoneE164}`}
              event="call_click"
              source="header"
              className="hidden items-center gap-2 rounded-full px-3 py-2 text-sm text-white/80 hover:text-lime md:flex"
            >
              <Phone className="size-4" /> {SITE.phoneDisplay}
            </TrackedAnchor>
            <button
              type="button"
              onClick={openCart}
              className="relative grid size-11 place-items-center rounded-full border border-white/15 text-white transition-colors hover:border-lime hover:text-lime"
              aria-label={`Open cart, ${count} item${count === 1 ? "" : "s"}`}
            >
              <ShoppingBag className="size-5" />
              <AnimatePresence>
                {count > 0 && (
                  <motion.span
                    key={count}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1 grid min-w-5 place-items-center rounded-full bg-lime px-1 text-[11px] font-bold text-obsidian"
                  >
                    {count}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
            <button
              type="button"
              className="grid size-11 place-items-center rounded-full border border-white/15 text-white lg:hidden"
              onClick={() => setMenuOpen((o) => !o)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.nav
              id="mobile-menu"
              aria-label="Mobile"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "calc(100dvh - 4rem)" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden border-t border-white/10 bg-obsidian lg:hidden"
            >
              <ul className="container-fz flex flex-col gap-1 py-6">
                {[{ href: "/", label: "Home" }, ...NAV_LINKS].map((l, i) => (
                  <motion.li key={l.href} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i + 0.1 }}>
                    <Link
                      href={l.href}
                      onClick={() => setMenuOpen(false)}
                      className={cn(
                        "display block py-2 text-5xl",
                        isActive(l.href) ? "text-lime" : "text-white hover:text-lime",
                      )}
                    >
                      {l.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>
              <div className="container-fz flex flex-col gap-3 pb-10">
                <TrackedAnchor href={`tel:${SITE.phoneE164}`} event="call_click" source="mobile_menu" className={fzButton("outline", "lg", "w-full")}>
                  <Phone /> Call {SITE.phoneDisplay}
                </TrackedAnchor>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
