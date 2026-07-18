-- Comercio Digital - Reportes de productos y comercios.
-- Ejecutar una vez desde Supabase SQL Editor.

create extension if not exists "uuid-ossp";

create table if not exists public.marketplace_reports (
  id uuid primary key default uuid_generate_v4(),
  reporter_id uuid not null references auth.users(id) on delete cascade,
  target_type text not null check (target_type in ('product', 'business')),
  product_id uuid references public.products(id) on delete cascade,
  business_id uuid references public.businesses(id) on delete cascade,
  reason text not null check (
    reason in ('incorrect_information', 'unavailable', 'misleading', 'prohibited', 'other')
  ),
  details text not null check (length(trim(details)) between 10 and 1000),
  status text not null default 'open' check (
    status in ('open', 'under_review', 'resolved', 'dismissed')
  ),
  admin_note text,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (target_type = 'product' and product_id is not null and business_id is null)
    or
    (target_type = 'business' and business_id is not null and product_id is null)
  )
);

create index if not exists idx_marketplace_reports_status_created
  on public.marketplace_reports(status, created_at desc);

create index if not exists idx_marketplace_reports_reporter
  on public.marketplace_reports(reporter_id, created_at desc);

alter table public.marketplace_reports enable row level security;

drop policy if exists "Users can create own reports" on public.marketplace_reports;
create policy "Users can create own reports"
on public.marketplace_reports
for insert
to authenticated
with check (
  reporter_id = (select auth.uid())
  and status = 'open'
  and admin_note is null
  and resolved_at is null
);

drop policy if exists "Users and admins can read reports" on public.marketplace_reports;
create policy "Users and admins can read reports"
on public.marketplace_reports
for select
to authenticated
using (
  reporter_id = (select auth.uid())
  or exists (
    select 1 from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.role in ('admin', 'super_admin')
  )
);

drop policy if exists "Admins can update reports" on public.marketplace_reports;
create policy "Admins can update reports"
on public.marketplace_reports
for update
to authenticated
using (
  exists (
    select 1 from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.role in ('admin', 'super_admin')
  )
)
with check (
  exists (
    select 1 from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.role in ('admin', 'super_admin')
  )
);

grant select, insert, update on public.marketplace_reports to authenticated;

