-- ════════════════════════════════════════════════════════════════════
--  FITZONE SUPPLEMENTS — Supabase schema
--  Run once in the Supabase SQL editor (or `supabase db push`).
--  All access control is enforced with Row Level Security; the web app
--  only ever uses the public anon key + the signed-in admin's session.
-- ════════════════════════════════════════════════════════════════════

create extension if not exists "pgcrypto";

-- ───────────── Admins ─────────────
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid());
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ───────────── Catalogue ─────────────
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name text not null check (char_length(name) between 2 and 80),
  description text not null default '',
  image_url text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name text not null check (char_length(name) between 2 and 140),
  brand text not null,
  category_id uuid references public.categories (id) on delete set null,
  description text not null default '',
  images text[] not null default '{}',
  -- Only from verified packaging; null = not yet supplied
  ingredients text,
  nutrition text,
  usage text,
  authenticity text,
  featured boolean not null default false,
  is_active boolean not null default true,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists products_category_idx on public.products (category_id);

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  label text not null,
  flavor text,
  size text,
  price integer not null check (price >= 0),          -- INR, whole rupees
  mrp integer check (mrp is null or mrp >= 0),
  stock integer not null default 0 check (stock >= 0),
  sort_order int not null default 0
);
create index if not exists variants_product_idx on public.product_variants (product_id);

create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;
drop trigger if exists products_touch on public.products;
create trigger products_touch before update on public.products for each row execute function public.touch_updated_at();

-- ───────────── Store settings (single row) ─────────────
create table if not exists public.store_settings (
  id int primary key default 1 check (id = 1),
  hours_text text,                       -- owner-confirmed hours; null = not confirmed
  closing_time text not null default '9:30 PM',
  announcement text,
  maps_url text,
  reviews_url text,
  updated_at timestamptz not null default now()
);
insert into public.store_settings (id) values (1) on conflict (id) do nothing;

-- ───────────── Website inquiries ─────────────
create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 80),
  phone text not null check (char_length(phone) between 10 and 16),
  kind text not null default 'store' check (kind in ('product', 'availability', 'store', 'order')),
  product_ref text check (product_ref is null or char_length(product_ref) <= 160),
  message text not null check (char_length(message) between 5 and 1000),
  status text not null default 'new' check (status in ('new', 'contacted', 'closed')),
  created_at timestamptz not null default now()
);

-- ───────────── Website reviews (moderated) ─────────────
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 60),
  rating int not null check (rating between 1 and 5),
  comment text not null check (char_length(comment) between 10 and 800),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

-- ───────────── Privacy-conscious analytics ─────────────
create table if not exists public.analytics_events (
  id bigint generated always as identity primary key,
  event_type text not null check (event_type in (
    'page_view', 'product_view', 'whatsapp_click', 'add_to_cart', 'remove_from_cart',
    'cart_whatsapp_checkout', 'call_click', 'directions_click'
  )),
  path text check (path is null or char_length(path) <= 200),
  product_slug text check (product_slug is null or char_length(product_slug) <= 120),
  session_id text check (session_id is null or char_length(session_id) <= 40),
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists analytics_created_idx on public.analytics_events (created_at desc);

-- ════════════════════════ Row Level Security ════════════════════════
alter table public.admin_users enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.store_settings enable row level security;
alter table public.inquiries enable row level security;
alter table public.reviews enable row level security;
alter table public.analytics_events enable row level security;

-- admin_users: admins can see the list; changes only via SQL editor / dashboard
drop policy if exists "admins read admins" on public.admin_users;
create policy "admins read admins" on public.admin_users for select to authenticated using (public.is_admin());

-- categories
drop policy if exists "public read categories" on public.categories;
create policy "public read categories" on public.categories for select using (true);
drop policy if exists "admin write categories" on public.categories;
create policy "admin write categories" on public.categories for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- products: public sees active only; admins see and edit everything
drop policy if exists "public read active products" on public.products;
create policy "public read active products" on public.products for select using (is_active or public.is_admin());
drop policy if exists "admin write products" on public.products;
create policy "admin write products" on public.products for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- variants follow their product's visibility
drop policy if exists "public read variants" on public.product_variants;
create policy "public read variants" on public.product_variants for select using (
  exists (select 1 from public.products p where p.id = product_id and (p.is_active or public.is_admin()))
);
drop policy if exists "admin write variants" on public.product_variants;
create policy "admin write variants" on public.product_variants for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- settings
drop policy if exists "public read settings" on public.store_settings;
create policy "public read settings" on public.store_settings for select using (true);
drop policy if exists "admin write settings" on public.store_settings;
create policy "admin write settings" on public.store_settings for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- inquiries: anyone may submit (status forced to 'new'); only admins read/update
drop policy if exists "anyone submits inquiry" on public.inquiries;
create policy "anyone submits inquiry" on public.inquiries for insert to anon, authenticated with check (status = 'new');
drop policy if exists "admin manage inquiries" on public.inquiries;
create policy "admin manage inquiries" on public.inquiries for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- reviews: anyone may submit a *pending* review; public reads approved; admins moderate
drop policy if exists "anyone submits review" on public.reviews;
create policy "anyone submits review" on public.reviews for insert to anon, authenticated with check (status = 'pending');
drop policy if exists "public read approved reviews" on public.reviews;
create policy "public read approved reviews" on public.reviews for select using (status = 'approved' or public.is_admin());
drop policy if exists "admin manage reviews" on public.reviews;
create policy "admin manage reviews" on public.reviews for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- analytics: insert-only for visitors; admins read
drop policy if exists "anyone logs events" on public.analytics_events;
create policy "anyone logs events" on public.analytics_events for insert to anon, authenticated with check (true);
drop policy if exists "admin reads events" on public.analytics_events;
create policy "admin reads events" on public.analytics_events for select to authenticated using (public.is_admin());

-- ═══════════════════════ Storage: product images ═══════════════════════
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
on conflict (id) do nothing;

drop policy if exists "public read product images" on storage.objects;
create policy "public read product images" on storage.objects for select using (bucket_id = 'product-images');
drop policy if exists "admin upload product images" on storage.objects;
create policy "admin upload product images" on storage.objects for insert to authenticated with check (bucket_id = 'product-images' and public.is_admin());
drop policy if exists "admin update product images" on storage.objects;
create policy "admin update product images" on storage.objects for update to authenticated using (bucket_id = 'product-images' and public.is_admin());
drop policy if exists "admin delete product images" on storage.objects;
create policy "admin delete product images" on storage.objects for delete to authenticated using (bucket_id = 'product-images' and public.is_admin());

-- ═══════════════════════ Make yourself an admin ═══════════════════════
-- 1. Create a user in Authentication → Users (email + password).
-- 2. Then run (replace the email):
--    insert into public.admin_users (user_id)
--    select id from auth.users where email = 'owner@example.com';
