/**
 * ⚠️ DEMONSTRATION DATA — NOT REAL STORE INVENTORY.
 *
 * Brands ("Sample Brand A/B/C"), prices, stock and variants below are
 * placeholders used to demonstrate the shopping experience until the owner
 * supplies the actual catalogue (via Supabase / the admin dashboard).
 * Ingredients, nutrition, usage and authenticity are intentionally left
 * empty (null) — they must come from verified packaging.
 *
 * Product photos: generic, unbranded supplement containers from Pexels
 * (photographer: Supplements On Demand) and Unsplash. Illustrative only.
 */
import type { Category, Product, StoreSettings, Variant } from "./types";
import { SITE, MAPS } from "./site";

const img = (name: string) => `/images/products/${name}.jpg`;

export const DEMO_CATEGORIES: Category[] = [
  { id: "cat-whey", slug: "whey-protein", name: "Whey Protein", description: "Whey concentrates, isolates and blends for your daily protein intake.", image: img("whey-tub-1"), sortOrder: 1 },
  { id: "cat-mass", slug: "mass-gainers", name: "Mass Gainers", description: "Calorie-dense gainers for those working on size and weight.", image: img("tub-wide-1"), sortOrder: 2 },
  { id: "cat-creatine", slug: "creatine", name: "Creatine", description: "Creatine monohydrate and related formats.", image: img("tub-tall-2"), sortOrder: 3 },
  { id: "cat-pre", slug: "pre-workout", name: "Pre-Workout", description: "Pre-training formulas, with and without stimulants.", image: img("jar-orange-1"), sortOrder: 4 },
  { id: "cat-bcaa", slug: "bcaa-amino-acids", name: "BCAA & Amino Acids", description: "BCAAs, EAAs and amino acid blends.", image: img("jar-orange-2"), sortOrder: 5 },
  { id: "cat-vit", slug: "vitamins-minerals", name: "Vitamins & Minerals", description: "Multivitamins, omega-3 and everyday micronutrients.", image: img("bottle-1"), sortOrder: 6 },
  { id: "cat-acc", slug: "fitness-accessories", name: "Fitness Accessories", description: "Shakers, bands, weights and training gear.", image: img("accessories-1"), sortOrder: 7 },
];

type V = [label: string, flavor: string | null, size: string | null, price: number, mrp: number | null, stock: number];

function variants(productId: string, list: V[]): Variant[] {
  return list.map(([label, flavor, size, price, mrp, stock], i) => ({
    id: `${productId}-v${i + 1}`,
    label,
    flavor,
    size,
    price,
    mrp,
    stock,
  }));
}

const DEMO_DESCRIPTION =
  "Sample listing used to demonstrate the Fitzone product page. Brand, price, variants and stock shown here are placeholders — the store will replace them with its actual catalogue. Ask us on WhatsApp for current availability.";

function product(
  n: number,
  slug: string,
  name: string,
  brand: string,
  categorySlug: string,
  images: string[],
  list: V[],
  featured = false,
): Product {
  const id = `demo-${n}`;
  return {
    id,
    slug,
    name,
    brand,
    categorySlug,
    description: DEMO_DESCRIPTION,
    images: images.map(img),
    variants: variants(id, list),
    featured,
    isActive: true,
    isDemo: true,
    ingredients: null,
    nutrition: null,
    usage: null,
    authenticity: null,
  };
}

export const DEMO_PRODUCTS: Product[] = [
  product(1, "demo-whey-protein-blend", "Demo Whey Protein Blend", "Sample Brand A", "whey-protein", ["whey-tub-1", "tub-tall-2"], [
    ["1 kg · Chocolate", "Chocolate", "1 kg", 2499, 2999, 12],
    ["1 kg · Vanilla", "Vanilla", "1 kg", 2499, 2999, 3],
    ["2 kg · Chocolate", "Chocolate", "2 kg", 4599, 5499, 8],
  ], true),
  product(2, "demo-whey-isolate", "Demo Whey Isolate", "Sample Brand B", "whey-protein", ["tub-tall-2", "whey-tub-1"], [
    ["1 kg · Unflavoured", "Unflavoured", "1 kg", 3299, null, 0],
    ["2 kg · Cafe Mocha", "Cafe Mocha", "2 kg", 5999, 6799, 4],
  ], true),
  product(3, "demo-mass-gainer", "Demo Mass Gainer", "Sample Brand A", "mass-gainers", ["tub-wide-1", "tub-tall-2"], [
    ["3 kg · Chocolate", "Chocolate", "3 kg", 2899, 3499, 10],
    ["3 kg · Banana", "Banana", "3 kg", 2899, 3499, 0],
    ["5 kg · Chocolate", "Chocolate", "5 kg", 4299, 4999, 6],
  ], true),
  product(4, "demo-lean-gainer", "Demo Lean Gainer", "Sample Brand C", "mass-gainers", ["tub-wide-1"], [
    ["2 kg · Vanilla", "Vanilla", "2 kg", 2199, null, 7],
  ]),
  product(5, "demo-creatine-monohydrate", "Demo Creatine Monohydrate", "Sample Brand B", "creatine", ["tub-tall-2", "whey-tub-1"], [
    ["100 g · Unflavoured", "Unflavoured", "100 g", 699, 899, 20],
    ["250 g · Unflavoured", "Unflavoured", "250 g", 1299, 1599, 15],
  ], true),
  product(6, "demo-micronised-creatine", "Demo Micronised Creatine", "Sample Brand C", "creatine", ["whey-tub-1"], [
    ["300 g · Unflavoured", "Unflavoured", "300 g", 1499, null, 2],
  ]),
  product(7, "demo-pre-workout", "Demo Pre-Workout", "Sample Brand A", "pre-workout", ["jar-orange-1", "jar-orange-3"], [
    ["300 g · Fruit Punch", "Fruit Punch", "300 g", 1799, 2199, 9],
    ["300 g · Green Apple", "Green Apple", "300 g", 1799, 2199, 0],
  ], true),
  product(8, "demo-stim-free-pre-workout", "Demo Stim-Free Pre-Workout", "Sample Brand C", "pre-workout", ["jar-orange-3", "jar-orange-1"], [
    ["250 g · Blue Raspberry", "Blue Raspberry", "250 g", 1599, null, 5],
  ]),
  product(9, "demo-bcaa-2-1-1", "Demo BCAA 2:1:1", "Sample Brand B", "bcaa-amino-acids", ["jar-orange-2", "jar-orange-1"], [
    ["250 g · Watermelon", "Watermelon", "250 g", 1199, 1499, 11],
    ["450 g · Mango", "Mango", "450 g", 1899, null, 6],
  ], true),
  product(10, "demo-eaa-blend", "Demo EAA Blend", "Sample Brand A", "bcaa-amino-acids", ["jar-pink-2", "jar-pink-1"], [
    ["300 g · Lemon", "Lemon", "300 g", 1699, null, 4],
  ]),
  product(11, "demo-daily-multivitamin", "Demo Daily Multivitamin", "Sample Brand C", "vitamins-minerals", ["bottle-1", "bottle-spill", "bottle-2"], [
    ["60 tablets", null, "60 tablets", 599, 799, 25],
    ["120 tablets", null, "120 tablets", 999, 1299, 10],
  ], true),
  product(12, "demo-omega-3-softgels", "Demo Omega-3 Softgels", "Sample Brand B", "vitamins-minerals", ["bottle-tilt", "bottle-glass"], [
    ["60 softgels", null, "60 softgels", 749, null, 14],
  ]),
  product(13, "demo-gummy-vitamins", "Demo Gummy Vitamins", "Sample Brand A", "vitamins-minerals", ["jar-pink-1", "jar-pink-2"], [
    ["60 gummies · Mixed Berry", "Mixed Berry", "60 gummies", 649, null, 8],
  ]),
  product(14, "demo-resistance-band-kit", "Demo Resistance Band Kit", "Sample Brand C", "fitness-accessories", ["accessories-1"], [
    ["Light / Medium / Heavy set", null, "3 bands", 899, 1199, 9],
  ]),
  product(15, "demo-hex-dumbbell-pair", "Demo Hex Dumbbell Pair", "Sample Brand B", "fitness-accessories", ["accessories-2"], [
    ["5 kg pair", null, "5 kg", 2499, null, 3],
    ["7.5 kg pair", null, "7.5 kg", 3399, null, 0],
  ]),
];

export const DEFAULT_SETTINGS: StoreSettings = {
  hoursText: null,
  closingTime: SITE.hours.closingTime,
  announcement: null,
  mapsUrl: MAPS.search,
  reviewsUrl: MAPS.reviews,
};
