-- Comercio Digital: refuerzo de registro de comercios y moderacion de productos nuevos.
-- Idempotente y compatible con datos existentes.

-- INSERT en businesses: solo comercio propio en estado pendiente de revision.
drop policy if exists "Merchants can insert own pending business" on public.businesses;
create policy "Merchants can insert own pending business"
on public.businesses
for insert
to authenticated
with check (
  owner_id = (select auth.uid())
  and status = 'pending_review'::public.business_status
);

-- Productos nuevos entran en cola editorial (filas existentes no cambian).
alter table public.products
  alter column moderation_status set default 'under_review';

-- search_logs: comerciantes no leen telemetria global; solo su historial o rol admin.
drop policy if exists "Users can read allowed search logs" on public.search_logs;
create policy "Users can read own search logs"
on public.search_logs
for select
to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "Admins can read all search logs" on public.search_logs;
create policy "Admins can read all search logs"
on public.search_logs
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
