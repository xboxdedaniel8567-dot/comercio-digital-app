-- Comercio Digital - Edicion segura del perfil del comprador.
-- Ejecutar una vez desde Supabase SQL Editor.

create or replace function public.update_my_buyer_profile(
  p_full_name text,
  p_phone text
)
returns table (
  full_name text,
  phone text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Debes iniciar sesion para actualizar el perfil.';
  end if;

  if length(trim(coalesce(p_full_name, ''))) < 3 then
    raise exception 'El nombre debe tener al menos 3 caracteres.';
  end if;

  if length(trim(coalesce(p_full_name, ''))) > 100 then
    raise exception 'El nombre no puede superar 100 caracteres.';
  end if;

  if length(trim(coalesce(p_phone, ''))) > 30 then
    raise exception 'El telefono no puede superar 30 caracteres.';
  end if;

  return query
  update public.profiles
  set
    full_name = trim(p_full_name),
    phone = trim(coalesce(p_phone, ''))
  where id = auth.uid()
    and role = 'buyer'
  returning profiles.full_name, profiles.phone;

  if not found then
    raise exception 'No se encontro un perfil de comprador para esta cuenta.';
  end if;
end;
$$;

revoke all on function public.update_my_buyer_profile(text, text) from public;
grant execute on function public.update_my_buyer_profile(text, text) to authenticated;

