# Fitzone Supplements — website

A premium, mobile-first e-commerce website for **Fitzone Supplements**, a gym supplements and sports nutrition store in Nagarabhavi, Bengaluru.

- Browse products, filter, view details, add to cart.
- Send the cart (or a single product) to the store as a **WhatsApp inquiry**.
- Includes a secure **admin dashboard** for products, stock, categories, inquiries, reviews, store settings and privacy-friendly analytics.

> **Demo mode.** Until Supabase is connected, the site runs on a bundled **sample catalogue**. Its brands (“Sample Brand A/B/C”), prices and stock are placeholders, and every sample product is badged **DEMO DATA**. No ingredients, nutrition facts, certifications or health claims have been invented.

---

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, Cache Components, Turbopack), React 19, TypeScript |
| Styling | Tailwind CSS v4, shadcn/ui (Base UI primitives), custom Fitzone design tokens |
| Motion | Motion for React (scroll reveals, magnetic CTAs, hero entrance, cart drawer, page/grid transitions); respects `prefers-reduced-motion`. GSAP wasn’t needed, so it isn’t shipped, which keeps the bundle smaller. |
| Icons | Lucide |
| Backend | Next.js Server Actions + route handler (`/api/track`) |
| Database / auth / files | Supabase Postgres (row-level security), Supabase Auth, Supabase Storage |
| State | Zustand cart persisted to `localStorage` |
| Validation | Zod (server-side on every action and route) |
| Tests | Vitest (unit) + Playwright smoke test (end-to-end) |
| Hosting | Vercel |

## Pages

| Route | Purpose |
| --- | --- |
| `/` | Home: hero, categories, featured products, why Fitzone, Google review snapshot, location, CTA |
| `/shop` | All products with filters (category, brand, flavour, size, price, availability), search, sort |
| `/category/[slug]` | Category pages |
| `/product/[slug]` | Product detail: gallery with zoom and lightbox, variants, quantity, cart, WhatsApp order and availability check, label-info accordion, related products |
| `/cart` | Full cart + order summary + WhatsApp checkout |
| `/about` | About Fitzone |
| `/reviews` | Google snapshot, testimonial carousel, moderated website reviews and a review form |
| `/contact` | Map, directions, tap-to-call, WhatsApp actions, hours, inquiry form |
| `/privacy`, `/terms` | Policy templates (to be reviewed by the business) |
| `/admin` | Admin dashboard (login, products, categories, inquiries, reviews, settings, analytics) |
| `/sitemap.xml`, `/robots.txt`, `/opengraph-image` | SEO |

---

## Quick start (local)

Requires **Node 20.9+** (developed on Node 22).

```bash
npm install
```

```bash
cp .env.example .env.local
```

```bash
npm run dev
```

Open http://localhost:3000. With the Supabase variables left empty, the site runs in demo mode.

### Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` / `npm start` | Production build / serve |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript |
| `npm test` | Vitest unit tests (cart maths, WhatsApp encoding, filters, validation, analytics) |
| `npm run e2e` | Playwright smoke test of the main flows against a running server (`BASE_URL`, default `http://localhost:3000`). Needs `npm i -D playwright && npx playwright install chromium`. |
| `npm run db:seed-sql` | Regenerates `supabase/seed.sql` from the demo catalogue |

---

## Connecting Supabase (real catalogue + admin)

1. Create a project at [supabase.com](https://supabase.com).
2. In **SQL Editor**, run `supabase/schema.sql`. It creates the tables, row-level security policies, the `is_admin()` function and the public `product-images` storage bucket.
3. *(Optional)* Run `supabase/seed.sql` to load the sample catalogue (flagged `is_demo = true`). You can then replace it from the admin dashboard.
4. Add environment variables to `.env.local` and to Vercel:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-or-publishable-key
   ```
   Only the **anon/publishable** key is used. Never add the service-role key; it isn’t needed.
5. Create the owner login in **Authentication → Users** (email and password). Then grant admin access:
   ```sql
   insert into public.admin_users (user_id)
   select id from auth.users where email = 'owner@example.com';
   ```
6. Sign in at `/admin/login`.

### Security model

- Every table has **RLS**.
  - Visitors can read active products, categories, settings and *approved* reviews.
  - Visitors can *insert* inquiries, pending reviews and whitelisted analytics events.
  - Only rows in `admin_users` can read inquiries and analytics, or change anything.
- Admin pages and server actions call `requireAdmin()`. It verifies the session with Supabase Auth (`getUser`) **and** admin membership (`is_admin()`) on the server.
- `src/proxy.ts` refreshes the auth cookie and redirects signed-out users away from `/admin`.
- All inputs are validated with Zod on the server. Uploads are limited to JPG/PNG/WebP/AVIF under 5 MB (enforced in code and by the bucket).
- Public forms have a honeypot field.
- Security headers (`X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy`) are set in `next.config.ts`.

---

## WhatsApp integration

All links use `https://wa.me/919686860337` with `encodeURIComponent`-encoded messages (`src/lib/whatsapp.ts`).

- **Product:** “Hello Fitzone Supplements! I'm interested in [Product Name] - [Variant]. Could you please confirm availability and price?”
- **Availability check, store assistance, order follow-up:** dedicated messages on product and contact pages.
- **Cart checkout:** lists each item × quantity with a website estimate, and asks the store to confirm availability and the final price.

The UI always says an order is **only confirmed when the store replies**. No payment is taken on the site.

## Analytics (privacy-conscious)

`/api/track` stores first-party events: page views, product views, WhatsApp clicks, add/remove cart, cart → WhatsApp, call taps and direction taps.

- No cookies, no IP or user-agent storage, and no third-party scripts.
- A random per-tab session id lives in `sessionStorage`.
- Browsers sending Do-Not-Track or Global Privacy Control are not tracked.
- The admin overview labels these numbers as **tracked website activity, not confirmed sales**.
- In demo mode, events are accepted but not stored.

## Enabling Razorpay later

The architecture leaves room for online payments (`src/lib/payments/index.ts`), but they are **off**. Turn them on only after all of these are true:

1. The business approves online payments.
2. The catalogue has verified prices and stock.
3. Shipping, returns and refund policies are published.
4. Credentials are set: `NEXT_PUBLIC_RAZORPAY_KEY_ID` (public) and `RAZORPAY_KEY_SECRET` (server-only).
5. You have implemented:
   - a server route `/api/payments/razorpay/order` that creates an order with server-side prices, and
   - a webhook or verify route that checks the payment signature.
6. You set `NEXT_PUBLIC_PAYMENTS_ENABLED=true`.

---

## Deploying to Vercel

1. Push this repository to GitHub and **Import** it in Vercel. The framework (Next.js) is auto-detected.
2. Add the environment variables from `.env.example`. Set `NEXT_PUBLIC_SITE_URL` to the production domain (e.g. `https://fitzonesupplements.in`).
3. Deploy. Catalogue pages are prerendered and refresh automatically: they are cached for minutes and invalidated immediately when the admin saves.
4. In Supabase → **Authentication → URL configuration**, add your production URL.
5. Submit `https://YOUR-DOMAIN/sitemap.xml` in Google Search Console.

---

## What still needs real store data or credentials

| Item | Where to change it | Current state |
| --- | --- | --- |
| Product catalogue: brands, names, prices, MRP, variants, stock | Admin → Products | Sample data, badged DEMO |
| Ingredients, nutrition, usage, authenticity | Admin → Product → “Verified label information” | Empty; site shows “not yet supplied” |
| Product photos | Admin → Product → Images | Illustrative, unbranded stock photos (Pexels: *Supplements On Demand*; Unsplash) in `public/images/products` |
| Store photos (About gallery) | Replace images in `src/app/(site)/about/page.tsx` | Placeholder product photos, labelled “Store photos coming soon” |
| Opening hours / weekly schedule | Admin → Store settings | Only “closes 9:30 PM (as listed)” plus a note to call |
| Verified Google Maps / reviews URL | Admin → Store settings, or `NEXT_PUBLIC_GOOGLE_MAPS_URL` / `NEXT_PUBLIC_GOOGLE_REVIEWS_URL` | Generated Maps search links from name and address |
| Google rating snapshot (5.0 / 67) | `src/lib/site.ts` | Shown as a dated snapshot; never claimed to be live |
| Reviewer names for the three quotes | `src/lib/site.ts` (`GOOGLE_QUOTES`) | Shown without names until attribution is confirmed |
| Categories | Admin → Categories | Proposed sections; owner can add, rename, remove |
| Privacy policy and terms | `src/app/(site)/privacy`, `terms` | Templates marked for review |
| Shipping / returns / refunds pages | Not created | Add only once the business provides its actual policies |
| Supabase project + admin user | See “Connecting Supabase” | Not configured (demo mode) |
| Razorpay | See “Enabling Razorpay later” | Disabled |
| Production domain | `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` |

## Project structure

```
src/
  app/
    (site)/            public pages (shared header/footer/cart drawer)
    admin/             login + (dash) protected dashboard
    api/track/         analytics sink
    sitemap.ts robots.ts opengraph-image.tsx
  components/
    brand/             design-system pieces (buttons, reveal, magnetic, badges, icons)
    home/ shop/ cart/ reviews/ forms/ layout/ admin/
    ui/                shadcn/ui primitives
  lib/
    site.ts            verified business facts
    demo-data.ts       sample catalogue (DEMO)
    data/              cached catalogue queries (Supabase or demo)
    admin/             auth, queries, server actions, analytics aggregation
    whatsapp.ts filters.ts cart-math.ts cart-store.ts validation.ts
  proxy.ts             auth session refresh for /admin
supabase/schema.sql    tables + RLS + storage
supabase/seed.sql      optional demo seed
scripts/               seed generator, smoke test
```

## Image credits

Product photos are generic, unbranded supplement containers by **Supplements On Demand** on [Pexels](https://www.pexels.com/) (Pexels License), plus fitness-accessory photos from [Unsplash](https://unsplash.com/) (Unsplash License). They are illustrative and do not show actual store inventory.
