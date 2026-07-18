-- Flujo de aprobacion y moderacion de comercios.

grant update on public.businesses to authenticated;

drop policy if exists "Admins can read all businesses" on public.businesses;
create policy "Admins can read all businesses"
on public.businesses
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

drop policy if exists "Admins can moderate businesses" on public.businesses;
create policy "Admins can moderate businesses"
on public.businesses
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

-- Evita que un comerciante cambie por su cuenta el estado de aprobacion.
create or replace function public.protect_business_moderation_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status is distinct from old.status and (select auth.uid()) is not null then
    if not exists (
      select 1
      from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.role in ('admin', 'super_admin')
    ) then
      raise exception 'Solo un administrador puede cambiar el estado del comercio.';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists protect_business_moderation_status on public.businesses;
create trigger protect_business_moderation_status
before update on public.businesses
for each row
execute function public.protect_business_moderation_status();

-- Punto unico y seguro para las decisiones del panel administrativo.
create or replace function public.moderate_business(
  target_business_id uuid,
  next_status text
)
returns void
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

  if next_status not in ('active', 'pending_review', 'suspended', 'rejected') then
    raise exception 'Estado de comercio no permitido.';
  end if;

  update public.businesses
  set status = next_status::public.business_status
  where id = target_business_id;

  if not found then
    raise exception 'No se encontro el comercio.';
  end if;
end;
$$;

revoke all on function public.moderate_business(uuid, text) from public;
grant execute on function public.moderate_business(uuid, text) to authenticated;
