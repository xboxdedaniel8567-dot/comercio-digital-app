drop policy if exists "Anyone can insert search logs"
on public.search_logs;

create policy "Anyone can insert search logs"
on public.search_logs for insert
with check (true);

grant insert on public.search_logs to anon;
grant insert on public.search_logs to authenticated;
grant select on public.search_logs to authenticated;

drop policy if exists "Authenticated users can view search logs"
on public.search_logs;

create policy "Authenticated users can view search logs"
on public.search_logs for select
using (auth.role() = 'authenticated');
