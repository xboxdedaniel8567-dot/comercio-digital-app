-- Moderacion editorial independiente del estado comercial del producto.

alter table public.products
  add column if not exists moderation_status text not null default 'approved';

alter table public.products
  add column if not exists moderation_note text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'products_moderation_status_check'
  ) then
    alter table public.products
      add constraint products_moderation_status_check
      check (moderation_status in ('approved', 'under_review', 'rejected'));
  end if;
end;
$$;

drop policy if exists "Admins can read all products" on public.products;
create policy "Admins can read all products"
on public.products
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

create or replace function public.protect_product_moderation_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (
    new.moderation_status is distinct from old.moderation_status
    or new.moderation_note is distinct from old.moderation_note
  ) and (select auth.uid()) is not null then
    if not exists (
      select 1
      from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.role in ('admin', 'super_admin')
    ) then
      raise exception 'Solo un administrador puede moderar productos.';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists protect_product_moderation_fields on public.products;
create trigger protect_product_moderation_fields
before update on public.products
for each row
execute function public.protect_product_moderation_fields();

create or replace function public.moderate_product(
  target_product_id uuid,
  next_status text,
  next_note text default null
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

  if next_status not in ('approved', 'under_review', 'rejected') then
    raise exception 'Estado de moderacion no permitido.';
  end if;

  update public.products
  set moderation_status = next_status,
      moderation_note = nullif(trim(next_note), '')
  where id = target_product_id;

  if not found then
    raise exception 'No se encontro el producto.';
  end if;
end;
$$;

revoke all on function public.moderate_product(uuid, text, text) from public;
grant execute on function public.moderate_product(uuid, text, text) to authenticated;
