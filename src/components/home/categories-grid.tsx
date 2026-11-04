"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import type { Category } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Stagger, StaggerItem } from "@/components/brand/reveal";

export function CategoriesGrid({ categories, counts }: { categories: Category[]; counts: Record<string, number> | null }) {
  return (
    <Stagger className="grid auto-rows-[220px] grid-cols-2 gap-3 sm:auto-rows-[260px] sm:gap-4 lg:grid-cols-4">
      {categories.map((c, i) => (
        <StaggerItem key={c.slug} className={cn(i === 0 && "col-span-2 row-span-2", i === 3 && "lg:col-span-2")}>
          <Link
            href={`/category/${c.slug}`}
            className="group relative flex h-full flex-col justify-end overflow-hidden rounded-2xl border border-white/10 bg-[#efe6db] p-4 sm:p-6"
          >
            <Image
              src={c.image}
              alt=""
              fill
              sizes={i === 0 ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 25vw, 50vw"}
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/40 to-transparent transition-opacity duration-500 group-hover:opacity-90" />
            <motion.div className="absolute inset-0 rounded-2xl ring-0 ring-lime/0 transition-all duration-300 group-hover:ring-2 group-hover:ring-lime/70" />
            <div className="relative flex items-end justify-between gap-3">
              <div>
                <span className="font-heading text-[11px] font-semibold tracking-[0.2em] text-lime">
                  {String(i + 1).padStart(2, "0")}
                  {counts && ` · ${counts[c.slug] ?? 0} products`}
                </span>
                <h3 className={cn("display text-white", i === 0 ? "text-5xl sm:text-7xl" : "text-3xl sm:text-4xl")}>
                  {c.name}
                </h3>
                {i === 0 && <p className="mt-2 hidden max-w-sm text-sm text-white/75 sm:block">{c.description}</p>}
              </div>
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition-all duration-300 group-hover:rotate-45 group-hover:bg-lime group-hover:text-obsidian">
                <ArrowUpRight className="size-5" />
              </span>
            </div>
            <span className="sr-only">Explore {c.name}</span>
          </Link>
        </StaggerItem>
      ))}
    </Stagger>
  );
}
