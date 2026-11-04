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
| `/cart` | Full cart + order summary + checkout (online payment for pickup, or WhatsApp inquiry) |
| `/order/[id]` | Online order confirmation (order number, status, pickup details) |
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
   The website uses the **anon/publishable** key. The service-role key is only needed for online payments, as a server-only variable (see “Online payments”).
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

WhatsApp orders are always described as inquiries that are **only confirmed when the store replies**. Online payment (if enabled) is a separate checkout option; see “Online payments”.

## Analytics (privacy-conscious)

`/api/track` stores first-party events: page views, product views, WhatsApp clicks, add/remove cart, cart → WhatsApp, call taps and direction taps.

- No cookies, no IP or user-agent storage, and no third-party scripts.
- A random per-tab session id lives in `sessionStorage`.
- Browsers sending Do-Not-Track or Global Privacy Control are not tracked.
- The admin overview labels these numbers as **tracked website activity, not confirmed sales**.
- In demo mode, events are accepted but not stored.

## Online payments (Razorpay, store pickup)

Customers can pay online for **store pickup** (no delivery). The WhatsApp inquiry stays available as an alternative.

**How it works**
1. The cart sends only product variant IDs and quantities to `/api/payments/razorpay/order`.
2. The server re-prices everything from the database. It rejects demo, hidden and out-of-stock items, saves a `pending` order and creates a Razorpay order.
3. Razorpay Checkout (UPI, cards, netbanking) opens in the browser.
4. `/api/payments/razorpay/verify` checks the payment signature with your key secret. Only then does the database function `mark_order_paid` mark the order paid (exactly once) and reduce stock.
5. The customer lands on `/order/[id]` with their order number. The order appears in **Admin → Online orders**, where you move it through *paid → ready → collected* (or *cancelled*).
6. *(Recommended)* The Razorpay webhook `/api/payments/razorpay/webhook` confirms the payment even if the customer closes the browser too early.

**Setup**
1. In Supabase → SQL Editor, run `supabase/002_online_payments.sql` (after `schema.sql`).
2. Add these in Vercel → Settings → Environment Variables, then redeploy:

   | Key | Value |
   | --- | --- |
   | `NEXT_PUBLIC_PAYMENTS_ENABLED` | `true` |
   | `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Razorpay Key ID (`rzp_test_…` while testing) |
   | `RAZORPAY_KEY_SECRET` | Razorpay Key Secret, **server-only** |
   | `SUPABASE_SERVICE_ROLE_KEY` | Supabase `service_role` / secret key, **server-only**, used only by the payment routes |
   | `RAZORPAY_WEBHOOK_SECRET` | *(recommended)* the secret you choose when creating the webhook |

3. *(Recommended)* In Razorpay Dashboard → **Webhooks → Add New Webhook**:
   - URL: `https://YOUR-DOMAIN/api/payments/razorpay/webhook`
   - Secret: any strong string (the same value goes in `RAZORPAY_WEBHOOK_SECRET`)
   - Events: `payment.captured`, `order.paid`, `payment.failed`
4. In Razorpay, make sure payments are set to **auto-capture** (Account & Settings → Payment capture).
5. Test with `rzp_test_…` keys and Razorpay’s test cards or UPI (`success@razorpay`). Switch to `rzp_live_…` keys only after your Razorpay account is activated.

**Notes**
- Products marked `is_demo` can never be bought online. Real products need a price and stock set in the admin.
- The two server-only keys must **never** get a `NEXT_PUBLIC_` prefix. They are read only in server code (`src/lib/supabase/service.ts`, `src/lib/payments/server.ts`).
- Refunds are issued from the Razorpay dashboard. Then set the order to *cancelled* in the admin. Stock is not automatically restored on cancellation; adjust it in Products.

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
| Razorpay (online payment, store pickup) | See “Online payments” | Built; enable with keys + `002_online_payments.sql` |
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
supabase/002_online_payments.sql  orders table + mark_order_paid() for Razorpay
scripts/               seed generator, smoke test
```

## Image credits

Product photos are generic, unbranded supplement containers by **Supplements On Demand** on [Pexels](https://www.pexels.com/) (Pexels License), plus fitness-accessory photos from [Unsplash](https://unsplash.com/) (Unsplash License). They are illustrative and do not show actual store inventory.
