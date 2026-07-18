-- Comercio Digital - Historial personal de busquedas.
-- Ejecutar una vez desde Supabase SQL Editor.

alter table public.search_logs
  add column if not exists user_id uuid references auth.users(id) on delete set null;

create index if not exists idx_search_logs_user_created
  on public.search_logs(user_id, created_at desc);

alter table public.search_logs enable row level security;

drop policy if exists "Anyone can insert search logs" on public.search_logs;
create policy "Anyone can insert search logs"
on public.search_logs
for insert
to anon, authenticated
with check (user_id is null or user_id = (select auth.uid()));

drop policy if exists "Authenticated users can view search logs" on public.search_logs;
drop policy if exists "Users can read allowed search logs" on public.search_logs;
create policy "Users can read allowed search logs"
on public.search_logs
for select
to authenticated
using (
  user_id = (select auth.uid())
  or exists (
    select 1
    from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.role in ('merchant', 'merchant_staff', 'admin', 'super_admin')
  )
);

drop policy if exists "Buyers can delete own search logs" on public.search_logs;
create policy "Buyers can delete own search logs"
on public.search_logs
for delete
to authenticated
using (user_id = (select auth.uid()));

grant insert on public.search_logs to anon, authenticated;
grant select, delete on public.search_logs to authenticated;

