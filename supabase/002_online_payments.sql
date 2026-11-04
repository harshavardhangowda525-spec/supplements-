-- ════════════════════════════════════════════════════════════════════
--  FITZONE SUPPLEMENTS — online payments (Razorpay, store pickup)
--  Run AFTER schema.sql. Safe to run more than once.
--
--  Orders are created and marked paid only by the website's server
--  (using the server-only service-role key). Visitors can never read or
--  write this table directly; admins can read and update order status.
-- ════════════════════════════════════════════════════════════════════

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique
    default ('FZ-' || to_char(now() at time zone 'Asia/Kolkata', 'YYMMDD') || '-' || upper(substr(md5(gen_random_uuid()::text), 1, 5))),
  customer_name text not null check (char_length(customer_name) between 2 and 80),
  customer_phone text not null check (char_length(customer_phone) between 10 and 16),
  customer_email text check (customer_email is null or char_length(customer_email) <= 120),
  notes text check (notes is null or char_length(notes) <= 500),
  fulfilment text not null default 'pickup' check (fulfilment = 'pickup'),
  -- Snapshot of what was bought, priced from the database at checkout:
  -- [{ product_id, variant_id, name, variant_label, unit_price, quantity }]
  items jsonb not null,
  amount integer not null check (amount > 0),          -- INR, whole rupees
  currency text not null default 'INR',
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'ready', 'collected', 'cancelled', 'failed')),
  razorpay_order_id text unique,
  razorpay_payment_id text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists orders_created_idx on public.orders (created_at desc);
create index if not exists orders_status_idx on public.orders (status);

drop trigger if exists orders_touch on public.orders;
create trigger orders_touch before update on public.orders for each row execute function public.touch_updated_at();

alter table public.orders enable row level security;

drop policy if exists "admin read orders" on public.orders;
create policy "admin read orders" on public.orders for select to authenticated using (public.is_admin());
drop policy if exists "admin update orders" on public.orders;
create policy "admin update orders" on public.orders for update to authenticated
  using (public.is_admin())
  with check (public.is_admin() and status in ('paid', 'ready', 'collected', 'cancelled'));

-- Marks an order paid exactly once (after the server has verified the Razorpay
-- signature) and reduces stock for the purchased variants. Returns true only
-- the first time, so retries and webhooks are harmless.
create or replace function public.mark_order_paid(p_razorpay_order_id text, p_payment_id text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_items jsonb;
  v_item jsonb;
begin
  update public.orders
     set status = 'paid', razorpay_payment_id = p_payment_id, paid_at = now()
   where razorpay_order_id = p_razorpay_order_id
     and status in ('pending', 'failed')
  returning items into v_items;

  if v_items is null then
    return false;
  end if;

  for v_item in select * from jsonb_array_elements(v_items) loop
    update public.product_variants
       set stock = greatest(stock - (v_item ->> 'quantity')::int, 0)
     where id = (v_item ->> 'variant_id')::uuid;
  end loop;

  return true;
end;
$$;

revoke all on function public.mark_order_paid(text, text) from public, anon, authenticated;
grant execute on function public.mark_order_paid(text, text) to service_role;
