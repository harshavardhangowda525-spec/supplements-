"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { ArrowRight, LayoutGrid, MapPin } from "lucide-react";
import { Magnetic } from "@/components/brand/magnetic";
import { fzButton } from "@/components/brand/button-styles";
import { TrackedAnchor } from "@/components/brand/tracked-links";
import { GoogleIcon, Stars } from "@/components/brand/icons";
import { MAPS, SITE } from "@/lib/site";


function SplitLine({ text, delay, className, wordClassName }: { text: string; delay: number; className?: string; wordClassName?: string }) {
  return (
    <span className={className} aria-hidden="true">
      {text.split(" ").map((word, i) => (
        <span key={i} className="inline-block overflow-hidden pb-1 align-bottom">
          <span className={`fz-word ${wordClassName ?? ""}`} style={{ animationDelay: `${delay + i * 0.08}s` }}>
            {word}&nbsp;
          </span>
        </span>
      ))}
    </span>
  );
}

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const visualY = useTransform(scrollYProgress, [0, 1], ["0%", "-12%"]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section ref={ref} className="grain relative -mt-16 overflow-hidden pt-16 md:-mt-20 md:pt-20">
      {/* Atmospheric background */}
      <motion.div style={{ y: bgY }} className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_75%_40%,rgb(198_255_0/0.16),transparent_60%),radial-gradient(ellipse_50%_50%_at_10%_90%,rgb(198_255_0/0.07),transparent_60%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgb(255_255_255/0.035)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/0.035)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
        <span className="display absolute -bottom-10 left-1/2 -translate-x-1/2 text-[28vw] whitespace-nowrap text-transparent [-webkit-text-stroke:1px_rgb(255_255_255/0.06)]">
          FITZONE
        </span>
      </motion.div>

      <div className="container-fz relative grid min-h-[calc(100svh-4rem)] items-center gap-10 py-12 md:min-h-[calc(100svh-5rem)] lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
        <motion.div style={{ opacity: textOpacity }} className="relative z-10">
          <div
            className="fz-rise glass mb-7 inline-flex items-center gap-3 rounded-full py-1.5 pr-4 pl-1.5"
          >
            <span className="grid size-7 place-items-center rounded-full bg-white">
              <GoogleIcon className="size-4" />
            </span>
            <span className="flex items-center gap-2 text-xs text-white/90">
              <strong className="font-heading text-sm">{SITE.googleRating.rating.toFixed(1)}</strong>
              <Stars className="[&_svg]:size-3" />
              <span className="text-mist">{SITE.googleRating.count} Google reviews</span>
            </span>
          </div>

          <h1 className="display text-[clamp(3.6rem,11vw,9.5rem)] text-white">
            <span className="sr-only">Fuel your strength. Power every rep.</span>
            <SplitLine text="FUEL YOUR" delay={0.1} className="block" />
            <SplitLine text="STRENGTH." delay={0.25} className="block" wordClassName="text-gradient-lime" />
          </h1>
          <p
            style={{ animationDelay: "0.6s" }}
            className="fz-rise mt-2 font-heading text-xl font-semibold tracking-[0.3em] text-white/90 sm:text-2xl"
          >
            POWER EVERY REP.
          </p>
          <p
            style={{ animationDelay: "0.75s" }}
            className="fz-rise mt-6 max-w-lg text-base leading-relaxed text-mist sm:text-lg"
          >
            Explore sports nutrition and gym supplements at Fitzone Supplements, Bengaluru.
          </p>

          <div
            style={{ animationDelay: "0.9s" }}
            className="fz-rise mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap"
          >
            <Magnetic>
              <Link href="/shop" className={fzButton("primary", "lg", "w-full sm:w-auto")}>
                Shop supplements <ArrowRight />
              </Link>
            </Magnetic>
            <Magnetic>
              <Link href="/#categories" className={fzButton("outline", "lg", "w-full sm:w-auto")}>
                <LayoutGrid /> Explore categories
              </Link>
            </Magnetic>
            <Magnetic>
              <TrackedAnchor href={MAPS.directions} event="directions_click" source="hero" className={fzButton("ghost", "lg", "w-full sm:w-auto")}>
                <MapPin /> Get directions
              </TrackedAnchor>
            </Magnetic>
          </div>
        </motion.div>

        {/* Product visual */}
        <motion.div style={{ y: visualY }} className="relative mx-auto aspect-square w-full max-w-[540px]">
          <div className="absolute inset-[12%] rounded-full bg-lime/25 blur-[90px]" aria-hidden="true" />
          <div
            style={{ animationDelay: "0.5s", rotate: "-9deg" }}
            className="fz-rise absolute top-[14%] left-0 w-[42%] overflow-hidden rounded-3xl border border-white/10 shadow-2xl"
          >
            <div className="relative aspect-[4/5]">
              <Image src="/images/products/jar-orange-1.jpg" alt="" fill sizes="240px" className="object-cover" />
            </div>
          </div>
          <div
            style={{ animationDelay: "0.6s", rotate: "9deg" }}
            className="fz-rise absolute top-[22%] right-0 w-[40%] overflow-hidden rounded-3xl border border-white/10 shadow-2xl"
          >
            <div className="relative aspect-[4/5]">
              <Image src="/images/products/jar-pink-1.jpg" alt="" fill sizes="240px" className="object-cover" />
            </div>
          </div>
          <div className="absolute inset-x-[20%] top-[6%] bottom-[8%]">
            <div className="animate-float h-full motion-reduce:animate-none">
              <div className="relative h-full overflow-hidden rounded-[2rem] border border-lime/40 shadow-[0_40px_80px_-20px_rgb(0_0_0/0.8),0_0_60px_-10px_rgb(198_255_0/0.45)]">
                <Image
                  src="/images/products/whey-tub-1.jpg"
                  alt="Protein supplement tub with scoop (illustrative photo)"
                  fill
                  priority
                  sizes="(min-width: 1024px) 320px, 60vw"
                  className="object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-obsidian/90 to-transparent p-5 pt-16">
                  <p className="eyebrow">In store now</p>
                  <p className="display mt-1 text-3xl text-white">Whey · Creatine · Pre</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
