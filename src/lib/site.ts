/**
 * Business facts supplied by the owner / Google Business listing.
 * Everything here is either verified information or explicitly marked as
 * "to be confirmed". Do not add details that the business has not confirmed.
 */
export const SITE = {
  name: "Fitzone Supplements",
  shortName: "FITZONE",
  tagline: "Fuel your strength. Power every rep.",
  description:
    "Fitzone Supplements is a gym supplements and sports nutrition store in Nagarabhavi, Bengaluru. Explore whey protein, mass gainers, creatine, pre-workout, BCAAs, vitamins and fitness accessories.",
  url: process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000",
  phoneDisplay: "+91 96868 60337",
  phoneE164: "+919686860337",
  whatsappNumber: "919686860337",
  address: {
    line1: "Beside Wakefit Store, Ground Floor",
    line2: "Nagarabhavi 2nd Stage, Marilingappa Extension, Papareddypalya",
    locality: "Bengaluru",
    region: "Karnataka",
    postalCode: "560072",
    country: "IN",
  },
  /** Supplied snapshot from the Google listing — NOT a live value. */
  googleRating: {
    rating: 5.0,
    count: 67,
    snapshotLabel: "Snapshot supplied by the business, not live",
  },
  /** Only the closing time was supplied. Opening time / weekly schedule must be confirmed. */
  hours: {
    closingTime: "9:30 PM",
    confirmed: false,
  },
} as const;

export const FULL_ADDRESS = `${SITE.address.line1}, ${SITE.address.line2}, ${SITE.address.locality}, ${SITE.address.region} ${SITE.address.postalCode}`;

const mapsQuery = encodeURIComponent(`${SITE.name}, ${FULL_ADDRESS}`);

/**
 * No verified Google Maps listing URL was supplied, so these are search links
 * generated from the business name + address. Replace via the admin
 * "Store settings" page (or NEXT_PUBLIC_GOOGLE_MAPS_URL) once confirmed.
 */
export const MAPS = {
  search: process.env.NEXT_PUBLIC_GOOGLE_MAPS_URL || `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`,
  directions: `https://www.google.com/maps/dir/?api=1&destination=${mapsQuery}`,
  embed: `https://www.google.com/maps?q=${mapsQuery}&output=embed`,
  reviews: process.env.NEXT_PUBLIC_GOOGLE_REVIEWS_URL || `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`,
};

export const NAV_LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/category/whey-protein", label: "Protein" },
  { href: "/about", label: "About" },
  { href: "/reviews", label: "Reviews" },
  { href: "/contact", label: "Visit Store" },
] as const;

/** Supplied Google review quotes (shown unattributed until names are confirmed). */
export const GOOGLE_QUOTES = [
  "Great service, genuine products, and friendly staff.",
  "Great place to buy genuine gym supplements at good prices.",
  "Best price and good quality supplement sir",
] as const;
