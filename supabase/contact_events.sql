create table if not exists public.contact_events (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  business_name text,
  whatsapp text,
  source text not null default 'product_detail',
  created_at timestamptz not null default now()
);

create index if not exists idx_contact_events_business_id
on public.contact_events (business_id);

create index if not exists idx_contact_events_created_at
on public.contact_events (created_at);

alter table public.contact_events enable row level security;

drop policy if exists "Anyone can create contact events"
on public.contact_events;

create policy "Anyone can create contact events"
on public.contact_events for insert
with check (true);

drop policy if exists "Owners can view their contact events"
on public.contact_events;

create policy "Owners can view their contact events"
on public.contact_events for select
using (
  exists (
    select 1
    from public.businesses b
    where b.id = contact_events.business_id
    and b.owner_id = auth.uid()
  )
);

grant insert on public.contact_events to anon;
grant insert on public.contact_events to authenticated;
grant select on public.contact_events to authenticated;
