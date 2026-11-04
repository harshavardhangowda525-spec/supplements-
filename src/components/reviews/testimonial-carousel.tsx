"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { GoogleIcon, Stars } from "@/components/brand/icons";
import { cn } from "@/lib/utils";

export type Testimonial = { quote: string; author?: string; source: "google" | "website"; rating?: number };

export function TestimonialCarousel({ items, interval = 6000 }: { items: Testimonial[]; interval?: number }) {
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const [paused, setPaused] = useState(false);
  const reduce = useReducedMotion();

  const go = useCallback(
    (delta: number) => {
      setDir(delta);
      setIndex((i) => (i + delta + items.length) % items.length);
    },
    [items.length],
  );

  useEffect(() => {
    if (paused || reduce || items.length < 2) return;
    const t = setInterval(() => go(1), interval);
    return () => clearInterval(t);
  }, [paused, reduce, go, interval, items.length]);

  if (!items.length) return null;
  const item = items[index];

  return (
    <div
      className="metal-border relative overflow-hidden rounded-3xl p-8 sm:p-12"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      role="region"
      aria-roledescription="carousel"
      aria-label="Customer testimonials"
    >
      <Quote className="absolute top-6 right-6 size-20 text-lime/10" aria-hidden="true" />
      <div className="relative min-h-[180px]" aria-live={paused ? "polite" : "off"}>
        <AnimatePresence mode="wait" custom={dir}>
          <motion.figure
            key={index}
            custom={dir}
            initial={{ opacity: 0, x: dir * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir * -40 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${items.length}`}
          >
            <Stars rating={item.rating ?? 5} />
            <blockquote className="mt-5 font-heading text-2xl leading-snug font-medium text-white sm:text-3xl">
              “{item.quote}”
            </blockquote>
            <figcaption className="mt-6 flex items-center gap-2 text-sm text-mist">
              {item.source === "google" ? <GoogleIcon className="size-4" /> : null}
              {item.author ?? (item.source === "google" ? "Google review" : "Website review")}
            </figcaption>
          </motion.figure>
        </AnimatePresence>
      </div>
      {items.length > 1 && (
        <div className="mt-8 flex items-center justify-between">
          <div className="flex gap-2">
            {items.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setDir(i > index ? 1 : -1);
                  setIndex(i);
                }}
                className={cn("h-1.5 rounded-full transition-all", i === index ? "w-8 bg-lime" : "w-3 bg-white/20 hover:bg-white/40")}
                aria-label={`Show testimonial ${i + 1}`}
                aria-current={i === index}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => go(-1)} className="grid size-10 place-items-center rounded-full border border-white/15 hover:border-lime hover:text-lime" aria-label="Previous testimonial">
              <ChevronLeft className="size-5" />
            </button>
            <button type="button" onClick={() => go(1)} className="grid size-10 place-items-center rounded-full border border-white/15 hover:border-lime hover:text-lime" aria-label="Next testimonial">
              <ChevronRight className="size-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
