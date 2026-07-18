-- Comercio Digital - Valores de atributos adaptativos por producto.
-- Ejecutar despues de category_system.sql.

create extension if not exists "uuid-ossp";

create table if not exists public.product_attribute_values (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references public.products(id) on delete cascade,
  attribute_id uuid not null references public.category_attributes(id) on delete cascade,
  value text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, attribute_id)
);

create index if not exists idx_product_attribute_values_product
on public.product_attribute_values(product_id);

create index if not exists idx_product_attribute_values_attribute
on public.product_attribute_values(attribute_id);

alter table public.product_attribute_values enable row level security;

drop policy if exists "Public can read attributes of visible products"
on public.product_attribute_values;
create policy "Public can read attributes of visible products"
on public.product_attribute_values
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.products
    join public.businesses on businesses.id = products.business_id
    where products.id = product_attribute_values.product_id
      and products.status = 'active'
      and products.moderation_status = 'approved'
      and businesses.status = 'active'
  )
);

drop policy if exists "Merchants can manage own product attribute values"
on public.product_attribute_values;
create policy "Merchants can manage own product attribute values"
on public.product_attribute_values
for all
to authenticated
using (
  exists (
    select 1
    from public.products
    join public.businesses on businesses.id = products.business_id
    where products.id = product_attribute_values.product_id
      and businesses.owner_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.products
    join public.businesses on businesses.id = products.business_id
    where products.id = product_attribute_values.product_id
      and businesses.owner_id = (select auth.uid())
  )
);

drop policy if exists "Admins can manage product attribute values"
on public.product_attribute_values;
create policy "Admins can manage product attribute values"
on public.product_attribute_values
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

grant select on public.product_attribute_values to anon, authenticated;
grant insert, update, delete on public.product_attribute_values to authenticated;

