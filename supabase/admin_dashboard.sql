-- Metricas privadas del panel administrativo.

create or replace function public.get_admin_dashboard_stats()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if (select auth.uid()) is null then
    raise exception 'Debes iniciar sesion.';
  end if;

  if not exists (
    select 1
    from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.role in ('admin', 'super_admin')
  ) then
    raise exception 'No tienes permisos administrativos.';
  end if;

  return jsonb_build_object(
    'businesses_total', (select count(*) from public.businesses),
    'businesses_active', (select count(*) from public.businesses where status = 'active'),
    'businesses_pending', (select count(*) from public.businesses where status = 'pending_review'),
    'businesses_suspended', (select count(*) from public.businesses where status = 'suspended'),
    'businesses_rejected', (select count(*) from public.businesses where status = 'rejected'),
    'products_total', (select count(*) from public.products),
    'products_active', (select count(*) from public.products where status = 'active'),
    'searches_total', (select count(*) from public.search_logs),
    'contacts_total', (select count(*) from public.contact_events)
  );
end;
$$;

revoke all on function public.get_admin_dashboard_stats() from public;
grant execute on function public.get_admin_dashboard_stats() to authenticated;
