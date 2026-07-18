-- Comercio Digital - Variantes de producto.
-- Permite manejar talla, color, capacidad y stock por presentacion.

create extension if not exists "uuid-ossp";

update public.products
set stock = 0
where stock < 0;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'products_stock_nonnegative'
  ) then
    alter table public.products
      add constraint products_stock_nonnegative check (stock is null or stock >= 0);
  end if;
end $$;

create table if not exists public.product_variants (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null,
  sku text,
  option_values jsonb not null default '{}'::jsonb,
  price numeric(14, 2),
  stock integer not null default 0 check (stock >= 0),
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, name)
);

create unique index if not exists product_variants_sku_unique
on public.product_variants(sku)
where sku is not null and length(trim(sku)) > 0;

create index if not exists idx_product_variants_product
on public.product_variants(product_id, sort_order);

alter table public.product_variants enable row level security;

drop policy if exists "Public can read visible product variants"
on public.product_variants;
create policy "Public can read visible product variants"
on public.product_variants
for select
to anon, authenticated
using (
  is_active = true
  and exists (
    select 1
    from public.products
    join public.businesses on businesses.id = products.business_id
    where products.id = product_variants.product_id
      and products.status = 'active'
      and products.moderation_status = 'approved'
      and businesses.status = 'active'
  )
);

drop policy if exists "Merchants can manage own product variants"
on public.product_variants;
create policy "Merchants can manage own product variants"
on public.product_variants
for all
to authenticated
using (
  exists (
    select 1
    from public.products
    join public.businesses on businesses.id = products.business_id
    where products.id = product_variants.product_id
      and businesses.owner_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.products
    join public.businesses on businesses.id = products.business_id
    where products.id = product_variants.product_id
      and businesses.owner_id = (select auth.uid())
  )
);

drop policy if exists "Admins can manage product variants"
on public.product_variants;
create policy "Admins can manage product variants"
on public.product_variants
for all
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.role in ('admin', 'super_admin')
  )
)
with check (
  exists (
    select 1
    from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.role in ('admin', 'super_admin')
  )
);

grant select on public.product_variants to anon, authenticated;
grant insert, update, delete on public.product_variants to authenticated;

