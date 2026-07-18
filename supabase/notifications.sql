-- Comercio Digital - Centro de notificaciones internas.
-- Crea avisos para reservas, reportes y solicitudes de privacidad.

create extension if not exists "uuid-ossp";

create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_key text not null unique,
  notification_type text not null,
  title text not null,
  body text not null,
  href text not null default '/',
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_notifications_user_unread
on public.notifications(user_id, read_at, created_at desc);

alter table public.notifications enable row level security;

drop policy if exists "Users can read own notifications" on public.notifications;
create policy "Users can read own notifications"
on public.notifications
for select
to authenticated
using (user_id = (select auth.uid()));

grant select on public.notifications to authenticated;

create or replace function public.mark_notification_read(p_notification_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.notifications
  set read_at = coalesce(read_at, now())
  where id = p_notification_id
    and user_id = auth.uid();
$$;

create or replace function public.mark_all_notifications_read()
returns void
language sql
security definer
set search_path = public
as $$
  update public.notifications
  set read_at = now()
  where user_id = auth.uid()
    and read_at is null;
$$;

revoke all on function public.mark_notification_read(uuid) from public;
revoke all on function public.mark_all_notifications_read() from public;
grant execute on function public.mark_notification_read(uuid) to authenticated;
grant execute on function public.mark_all_notifications_read() to authenticated;

create or replace function public.notify_reservation_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_owner uuid;
  product_name text;
  status_label text;
begin
  select businesses.owner_id, products.name
  into target_owner, product_name
  from public.businesses
  join public.products on products.business_id = businesses.id
  where businesses.id = new.business_id
    and products.id = new.product_id;

  if tg_op = 'INSERT' then
    insert into public.notifications (
      user_id, event_key, notification_type, title, body, href
    ) values (
      target_owner,
      'reservation-created:' || new.id::text || ':' || target_owner::text,
      'reservation_created',
      'Nueva solicitud de reserva',
      new.buyer_name || ' quiere reservar ' || coalesce(product_name, 'un producto') || '.',
      '/panel/reservas'
    ) on conflict (event_key) do nothing;
    return new;
  end if;

  if old.status is not distinct from new.status then
    return new;
  end if;

  status_label := case new.status
    when 'confirmed' then 'confirmada'
    when 'rejected' then 'rechazada'
    when 'cancelled' then 'cancelada'
    when 'completed' then 'completada'
    when 'expired' then 'vencida'
    else 'actualizada'
  end;

  if new.status = 'cancelled' then
    insert into public.notifications (
      user_id, event_key, notification_type, title, body, href
    ) values (
      target_owner,
      'reservation-cancelled:' || new.id::text || ':' || new.updated_at::text,
      'reservation_cancelled',
      'Reserva cancelada',
      new.buyer_name || ' cancelo la reserva de ' || coalesce(product_name, 'un producto') || '.',
      '/panel/reservas'
    ) on conflict (event_key) do nothing;
  else
    insert into public.notifications (
      user_id, event_key, notification_type, title, body, href
    ) values (
      new.buyer_id,
      'reservation-status:' || new.id::text || ':' || new.status || ':' || new.updated_at::text,
      'reservation_status',
      'Reserva ' || status_label,
      'Tu solicitud para ' || coalesce(product_name, 'el producto') || ' fue ' || status_label || '.',
      '/cuenta'
    ) on conflict (event_key) do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists reservation_notifications on public.reservation_requests;
create trigger reservation_notifications
after insert or update of status on public.reservation_requests
for each row execute function public.notify_reservation_change();

create or replace function public.notify_report_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.status is not distinct from new.status
     and old.admin_note is not distinct from new.admin_note then
    return new;
  end if;

  insert into public.notifications (
    user_id, event_key, notification_type, title, body, href
  ) values (
    new.reporter_id,
    'report-update:' || new.id::text || ':' || new.updated_at::text,
    'report_update',
    'Tu reporte fue actualizado',
    coalesce(nullif(new.admin_note, ''), 'El equipo administrativo actualizo el estado de tu reporte.'),
    '/cuenta'
  ) on conflict (event_key) do nothing;

  return new;
end;
$$;

drop trigger if exists report_notifications on public.marketplace_reports;
create trigger report_notifications
after update of status, admin_note on public.marketplace_reports
for each row execute function public.notify_report_change();

create or replace function public.notify_privacy_request_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.status is not distinct from new.status
     and old.admin_response is not distinct from new.admin_response then
    return new;
  end if;

  insert into public.notifications (
    user_id, event_key, notification_type, title, body, href
  ) values (
    new.user_id,
    'privacy-update:' || new.id::text || ':' || new.updated_at::text,
    'privacy_request_update',
    'Tu solicitud de privacidad fue actualizada',
    coalesce(nullif(new.admin_response, ''), 'El equipo administrativo actualizo tu solicitud.'),
    '/cuenta'
  ) on conflict (event_key) do nothing;

  return new;
end;
$$;

drop trigger if exists privacy_request_notifications on public.privacy_requests;
create trigger privacy_request_notifications
after update of status, admin_response on public.privacy_requests
for each row execute function public.notify_privacy_request_change();
