-- Comercio Digital - Solicitudes de reserva.
-- Ejecutar una vez desde Supabase SQL Editor.

create extension if not exists "uuid-ossp";

create table if not exists public.reservation_requests (
  id uuid primary key default uuid_generate_v4(),
  buyer_id uuid not null references auth.users(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  variant_id uuid references public.product_variants(id) on delete set null,
  buyer_name text not null,
  buyer_phone text not null,
  quantity integer not null default 1 check (quantity between 1 and 99),
  buyer_note text,
  status text not null default 'pending' check (
    status in ('pending', 'confirmed', 'rejected', 'cancelled', 'completed', 'expired')
  ),
  merchant_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_reservations_buyer_created
  on public.reservation_requests(buyer_id, created_at desc);
create index if not exists idx_reservations_business_status
  on public.reservation_requests(business_id, status, created_at desc);

alter table public.reservation_requests enable row level security;

drop policy if exists "Authorized users can read reservations" on public.reservation_requests;
create policy "Authorized users can read reservations"
on public.reservation_requests for select to authenticated
using (
  buyer_id = (select auth.uid())
  or exists (
    select 1 from public.businesses
    where businesses.id = reservation_requests.business_id
      and businesses.owner_id = (select auth.uid())
  )
  or exists (
    select 1 from public.business_staff
    where business_staff.business_id = reservation_requests.business_id
      and business_staff.user_id = (select auth.uid())
  )
  or exists (
    select 1 from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.role in ('admin', 'super_admin')
  )
);

grant select on public.reservation_requests to authenticated;

create or replace function public.create_reservation_request(
  p_product_id uuid,
  p_variant_id uuid,
  p_quantity integer,
  p_note text
)
returns public.reservation_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  buyer_profile public.profiles;
  target_product public.products;
  target_variant public.product_variants;
  target_business public.businesses;
  created_reservation public.reservation_requests;
  available_stock integer;
begin
  if auth.uid() is null then
    raise exception 'Debes iniciar sesion para reservar.';
  end if;

  select * into buyer_profile from public.profiles where id = auth.uid();
  if buyer_profile.role <> 'buyer' then
    raise exception 'Solo las cuentas de comprador pueden reservar.';
  end if;
  if length(trim(coalesce(buyer_profile.phone, ''))) < 7 then
    raise exception 'Agrega un telefono valido en Mi cuenta antes de reservar.';
  end if;
  if coalesce(p_quantity, 0) < 1 or p_quantity > 99 then
    raise exception 'La cantidad solicitada no es valida.';
  end if;

  select * into target_product
  from public.products
  where id = p_product_id and status = 'active' and moderation_status = 'approved';
  if not found then raise exception 'El producto no esta disponible.'; end if;

  select * into target_business
  from public.businesses
  where id = target_product.business_id and status = 'active';
  if not found then raise exception 'La tienda no esta disponible.'; end if;

  if p_variant_id is not null then
    select * into target_variant
    from public.product_variants
    where id = p_variant_id and product_id = p_product_id and is_active = true;
    if not found then raise exception 'La variante seleccionada no esta disponible.'; end if;
    available_stock := target_variant.stock;
  else
    available_stock := target_product.stock;
  end if;

  if available_stock is not null and p_quantity > available_stock then
    raise exception 'La cantidad solicitada supera la disponibilidad.';
  end if;

  insert into public.reservation_requests (
    buyer_id, business_id, product_id, variant_id, buyer_name, buyer_phone,
    quantity, buyer_note
  ) values (
    auth.uid(), target_product.business_id, p_product_id, p_variant_id,
    buyer_profile.full_name, buyer_profile.phone, p_quantity,
    nullif(trim(coalesce(p_note, '')), '')
  ) returning * into created_reservation;

  return created_reservation;
end;
$$;

create or replace function public.update_reservation_status(
  p_reservation_id uuid,
  p_status text,
  p_merchant_note text
)
returns public.reservation_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_reservation public.reservation_requests;
begin
  if p_status not in ('pending', 'confirmed', 'rejected', 'cancelled', 'completed', 'expired') then
    raise exception 'Estado de reserva no valido.';
  end if;

  update public.reservation_requests
  set status = p_status,
      merchant_note = nullif(trim(coalesce(p_merchant_note, '')), ''),
      updated_at = now()
  where id = p_reservation_id
    and (
      exists (
        select 1 from public.businesses
        where businesses.id = reservation_requests.business_id
          and businesses.owner_id = auth.uid()
      )
      or exists (
        select 1 from public.business_staff
        where business_staff.business_id = reservation_requests.business_id
          and business_staff.user_id = auth.uid()
      )
      or exists (
        select 1 from public.profiles
        where profiles.id = auth.uid()
          and profiles.role in ('admin', 'super_admin')
      )
    )
  returning * into updated_reservation;

  if not found then raise exception 'No tienes permiso para actualizar esta reserva.'; end if;
  return updated_reservation;
end;
$$;

create or replace function public.cancel_my_reservation(p_reservation_id uuid)
returns public.reservation_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  cancelled_reservation public.reservation_requests;
begin
  update public.reservation_requests
  set status = 'cancelled', updated_at = now()
  where id = p_reservation_id
    and buyer_id = auth.uid()
    and status in ('pending', 'confirmed')
  returning * into cancelled_reservation;

  if not found then raise exception 'Esta reserva no se puede cancelar.'; end if;
  return cancelled_reservation;
end;
$$;

revoke all on function public.create_reservation_request(uuid, uuid, integer, text) from public;
revoke all on function public.update_reservation_status(uuid, text, text) from public;
revoke all on function public.cancel_my_reservation(uuid) from public;
grant execute on function public.create_reservation_request(uuid, uuid, integer, text) to authenticated;
grant execute on function public.update_reservation_status(uuid, text, text) to authenticated;
grant execute on function public.cancel_my_reservation(uuid) to authenticated;

