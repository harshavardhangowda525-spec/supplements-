"use client";

import { useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import type { Category, Product } from "@/lib/types";
import {
  activeFilterCount,
  applyFilters,
  EMPTY_FILTERS,
  facetOptions,
  parseFilters,
  serializeFilters,
  type ProductFilters,
  type SortKey,
} from "@/lib/filters";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { fzButton } from "@/components/brand/button-styles";
import { WhatsAppLink } from "@/components/brand/tracked-links";
import { storeAssistanceMessage } from "@/lib/whatsapp";
import { ProductCard } from "./product-card";

type Props = { products: Product[]; categories: Category[]; lockedCategory?: string };

function toggle(list: string[], value: string) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function CheckGroup({
  legend,
  options,
  selected,
  onToggle,
  labels,
}: {
  legend: string;
  options: string[];
  selected: string[];
  onToggle: (v: string) => void;
  labels?: Record<string, string>;
}) {
  if (!options.length) return null;
  return (
    <fieldset className="border-b border-white/10 pb-5">
      <legend className="eyebrow mb-3">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const active = selected.includes(o);
          return (
            <label
              key={o}
              className={cn(
                "cursor-pointer rounded-full border px-3 py-1.5 text-xs transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-lime",
                active ? "border-lime bg-lime/10 text-lime" : "border-white/15 text-white/80 hover:border-white/40",
              )}
            >
              <input type="checkbox" className="sr-only" checked={active} onChange={() => onToggle(o)} />
              {labels?.[o] ?? o}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

function FilterPanel({
  filters,
  update,
  categories,
  facets,
  lockedCategory,
}: {
  filters: ProductFilters;
  update: (patch: Partial<ProductFilters>) => void;
  categories: Category[];
  facets: ReturnType<typeof facetOptions>;
  lockedCategory?: string;
}) {
  const catLabels = Object.fromEntries(categories.map((c) => [c.slug, c.name]));
  return (
    <div className="space-y-5">
      {!lockedCategory && (
        <CheckGroup
          legend="Category"
          options={categories.map((c) => c.slug)}
          labels={catLabels}
          selected={filters.categories}
          onToggle={(v) => update({ categories: toggle(filters.categories, v) })}
        />
      )}
      <CheckGroup legend="Brand" options={facets.brands} selected={filters.brands} onToggle={(v) => update({ brands: toggle(filters.brands, v) })} />
      <CheckGroup legend="Flavour" options={facets.flavors} selected={filters.flavors} onToggle={(v) => update({ flavors: toggle(filters.flavors, v) })} />
      <CheckGroup legend="Weight / quantity" options={facets.sizes} selected={filters.sizes} onToggle={(v) => update({ sizes: toggle(filters.sizes, v) })} />

      <fieldset className="border-b border-white/10 pb-5">
        <legend className="eyebrow mb-3">Price (₹)</legend>
        <div className="grid grid-cols-2 gap-2">
          {(["minPrice", "maxPrice"] as const).map((k) => (
            <label key={k} className="block">
              <span className="sr-only">{k === "minPrice" ? "Minimum price" : "Maximum price"}</span>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                placeholder={k === "minPrice" ? `Min ${facets.priceMin}` : `Max ${facets.priceMax}`}
                value={filters[k] ?? ""}
                onChange={(e) => update({ [k]: e.target.value === "" ? null : Math.max(0, Number(e.target.value)) })}
                className="h-10 w-full rounded-xl border border-white/15 bg-white/[0.03] px-3 text-sm text-white placeholder:text-white/30 focus:border-lime focus:outline-none"
              />
            </label>
          ))}
        </div>
      </fieldset>

      <label className="flex cursor-pointer items-center justify-between gap-3">
        <span className="font-heading text-sm font-medium text-white">In stock only</span>
        <input
          type="checkbox"
          role="switch"
          checked={filters.inStockOnly}
          onChange={(e) => update({ inStockOnly: e.target.checked })}
          className="peer sr-only"
        />
        <span className="relative h-6 w-11 rounded-full bg-white/15 transition-colors peer-checked:bg-lime peer-focus-visible:outline-2 peer-focus-visible:outline-lime after:absolute after:top-0.5 after:left-0.5 after:size-5 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-5" />
      </label>
    </div>
  );
}

export function ShopView({ products, categories, lockedCategory }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [sheetOpen, setSheetOpen] = useState(false);

  const filters = useMemo(() => {
    const f = parseFilters(new URLSearchParams(searchParams.toString()));
    return lockedCategory ? { ...f, categories: [lockedCategory] } : f;
  }, [searchParams, lockedCategory]);

  const scoped = useMemo(
    () => (lockedCategory ? products.filter((p) => p.categorySlug === lockedCategory) : products),
    [products, lockedCategory],
  );
  const facets = useMemo(() => facetOptions(scoped), [scoped]);
  const results = useMemo(() => applyFilters(scoped, filters), [scoped, filters]);
  const activeCount = activeFilterCount(filters) - (lockedCategory ? 1 : 0);

  function update(patch: Partial<ProductFilters>) {
    const next = { ...filters, ...patch };
    if (lockedCategory) next.categories = [];
    const qs = serializeFilters(next);
    startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
  }
  const reset = () => update({ ...EMPTY_FILTERS, q: filters.q, sort: filters.sort });

  return (
    <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
      <aside className="hidden lg:block" aria-label="Product filters">
        <div className="sticky top-28 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-sm font-semibold tracking-[0.15em] text-white uppercase">Filters</h2>
            {activeCount > 0 && (
              <button type="button" onClick={reset} className="text-xs text-mist hover:text-lime">
                Clear all
              </button>
            )}
          </div>
          <FilterPanel filters={filters} update={update} categories={categories} facets={facets} lockedCategory={lockedCategory} />
        </div>
      </aside>

      <div>
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative flex-1">
            <span className="sr-only">Search products</span>
            <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-mist" />
            <input
              type="search"
              defaultValue={filters.q}
              onChange={(e) => update({ q: e.target.value })}
              placeholder="Search by product or brand"
              className="h-12 w-full rounded-full border border-white/15 bg-white/[0.03] pr-4 pl-11 text-sm text-white placeholder:text-white/35 focus:border-lime focus:outline-none"
            />
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              className={fzButton("outline", "md", "flex-1 lg:hidden")}
              aria-label={`Open filters${activeCount ? `, ${activeCount} active` : ""}`}
            >
              <SlidersHorizontal /> Filters
              {activeCount > 0 && (
                <span className="grid size-5 place-items-center rounded-full bg-lime text-[10px] text-obsidian">{activeCount}</span>
              )}
            </button>
            <label className="relative flex-1 sm:flex-none">
              <span className="sr-only">Sort products</span>
              <select
                value={filters.sort}
                onChange={(e) => update({ sort: e.target.value as SortKey })}
                className="h-11 w-full appearance-none rounded-full border border-white/15 bg-charcoal px-5 pr-10 font-heading text-xs font-semibold tracking-wide text-white uppercase focus:border-lime focus:outline-none sm:w-52"
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
                <option value="name">Name A–Z</option>
              </select>
              <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-xs text-mist">▾</span>
            </label>
          </div>
        </div>

        <h2 className="sr-only">Products</h2>
        <p className="mb-5 text-sm text-mist" aria-live="polite">
          Showing <strong className="text-white">{results.length}</strong> of {scoped.length} products
        </p>

        {results.length ? (
          <motion.div layout className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
            <AnimatePresence mode="popLayout">
              {results.map((p, i) => (
                <motion.div
                  key={p.id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.3 }}
                >
                  <ProductCard product={p} priority={i < 4} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="metal-border flex flex-col items-center gap-4 rounded-3xl px-6 py-16 text-center">
            <X className="size-10 text-mist" />
            <p className="font-heading text-lg font-semibold">No products match these filters</p>
            <p className="max-w-sm text-sm text-mist">Try removing a filter — or ask us on WhatsApp, we may have it in store.</p>
            <div className="flex flex-wrap justify-center gap-3">
              <button type="button" onClick={reset} className={fzButton("primary", "md")}>
                Clear filters
              </button>
              <WhatsAppLink source="shop_empty" message={storeAssistanceMessage()} className={fzButton("outline", "md")}>
                Ask on WhatsApp
              </WhatsAppLink>
            </div>
          </div>
        )}
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="max-h-[85dvh] rounded-t-3xl border-white/10 bg-charcoal text-white">
          <SheetHeader className="px-5 pt-5">
            <SheetTitle className="display text-3xl text-white">Filters</SheetTitle>
            <SheetDescription className="text-mist">Results update as you choose.</SheetDescription>
          </SheetHeader>
          <div className="overflow-y-auto px-5 pb-4">
            <FilterPanel filters={filters} update={update} categories={categories} facets={facets} lockedCategory={lockedCategory} />
          </div>
          <div className="grid grid-cols-2 gap-3 border-t border-white/10 p-5">
            <button type="button" onClick={reset} className={fzButton("outline", "md")}>
              Clear
            </button>
            <button type="button" onClick={() => setSheetOpen(false)} className={fzButton("primary", "md")}>
              Show {results.length}
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
