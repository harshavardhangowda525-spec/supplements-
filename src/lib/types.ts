export type Variant = {
  id: string;
  /** Human label shown in selectors, e.g. "1 kg · Chocolate" */
  label: string;
  flavor: string | null;
  size: string | null;
  /** Selling price in INR (whole rupees). */
  price: number;
  /** Optional MRP in INR — discount is only shown when mrp > price. */
  mrp: number | null;
  stock: number;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  categorySlug: string;
  description: string;
  images: string[];
  variants: Variant[];
  featured: boolean;
  isActive: boolean;
  /** True for sample catalogue entries that are not real store inventory. */
  isDemo: boolean;
  /** Only filled from verified packaging. null = not yet supplied. */
  ingredients: string | null;
  nutrition: string | null;
  usage: string | null;
  authenticity: string | null;
};

export type Category = {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  sortOrder: number;
};

export type StoreSettings = {
  /** Owner-confirmed opening hours text; null = not yet confirmed. */
  hoursText: string | null;
  closingTime: string;
  announcement: string | null;
  mapsUrl: string;
  reviewsUrl: string;
};

export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  brand: string;
  image: string;
  variantId: string;
  variantLabel: string;
  price: number;
  quantity: number;
  maxQuantity: number;
  isDemo: boolean;
};
