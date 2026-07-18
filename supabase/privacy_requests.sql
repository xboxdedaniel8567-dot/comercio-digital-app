-- Comercio Digital - Solicitudes sobre datos personales.
-- Registra y permite gestionar consultas y reclamos de los titulares.

create extension if not exists "uuid-ossp";

create table if not exists public.privacy_requests (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  contact_email text not null,
  request_type text not null check (
    request_type in ('access', 'correction', 'deletion', 'revoke_consent')
  ),
  details text not null check (char_length(trim(details)) between 10 and 2000),
  status text not null default 'received' check (
    status in ('received', 'in_review', 'completed', 'rejected')
  ),
  admin_response text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index if not exists idx_privacy_requests_user
on public.privacy_requests(user_id, created_at desc);

create index if not exists idx_privacy_requests_status
on public.privacy_requests(status, created_at asc);

create unique index if not exists privacy_requests_one_open_type
on public.privacy_requests(user_id, request_type)
where status in ('received', 'in_review');

alter table public.privacy_requests enable row level security;

drop policy if exists "Users can read own privacy requests"
on public.privacy_requests;
create policy "Users can read own privacy requests"
on public.privacy_requests
for select
to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "Users can create own privacy requests"
on public.privacy_requests;
create policy "Users can create own privacy requests"
on public.privacy_requests
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and status = 'received'
  and admin_response is null
  and resolved_at is null
);

drop policy if exists "Admins can read privacy requests"
on public.privacy_requests;
create policy "Admins can read privacy requests"
on public.privacy_requests
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.role in ('admin', 'super_admin')
  )
);

drop policy if exists "Admins can update privacy requests"
on public.privacy_requests;
create policy "Admins can update privacy requests"
on public.privacy_requests
for update
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

grant select, insert on public.privacy_requests to authenticated;
grant update on public.privacy_requests to authenticated;
