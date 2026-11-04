import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Inter, Space_Grotesk } from "next/font/google";
import { Providers } from "@/components/providers";
import { SITE, FULL_ADDRESS, MAPS } from "@/lib/site";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const grotesk = Space_Grotesk({ variable: "--font-grotesk", subsets: ["latin"], display: "swap" });
const bebas = Bebas_Neue({ variable: "--font-bebas", weight: "400", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "Fitzone Supplements — Gym Supplements & Sports Nutrition in Nagarabhavi, Bengaluru",
    template: "%s | Fitzone Supplements Bengaluru",
  },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: [
    "gym supplements Bengaluru",
    "supplement store Nagarabhavi",
    "whey protein Bangalore",
    "sports nutrition store Bengaluru",
    "creatine Bengaluru",
    "mass gainer Bangalore",
    "pre-workout Bengaluru",
    "Fitzone Supplements",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: SITE.name,
    title: "Fitzone Supplements — Fuel Your Strength",
    description: SITE.description,
    url: "/",
  },
  twitter: { card: "summary_large_image", title: "Fitzone Supplements", description: SITE.description },
  robots: { index: true, follow: true },
  formatDetection: { telephone: true, address: true },
};

export const viewport: Viewport = {
  themeColor: "#080A09",
  width: "device-width",
  initialScale: 1,
};

/** LocalBusiness structured data — only verified facts (no self-served ratings). */
const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "Store",
  "@id": `${SITE.url}/#store`,
  name: SITE.name,
  description: SITE.description,
  url: SITE.url,
  telephone: SITE.phoneE164,
  image: `${SITE.url}/opengraph-image`,
  address: {
    "@type": "PostalAddress",
    streetAddress: `${SITE.address.line1}, ${SITE.address.line2}`,
    addressLocality: SITE.address.locality,
    addressRegion: SITE.address.region,
    postalCode: SITE.address.postalCode,
    addressCountry: SITE.address.country,
  },
  hasMap: MAPS.search,
  areaServed: "Bengaluru",
  keywords: FULL_ADDRESS,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-IN" className={`${inter.variable} ${grotesk.variable} ${bebas.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
