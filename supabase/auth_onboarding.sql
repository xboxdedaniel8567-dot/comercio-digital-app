-- Comercio Digital: registro atomico de cuentas.
-- Crea el perfil correcto y, para comerciantes, su comercio pendiente de revision.

create or replace function public.make_business_slug(
  value text,
  user_id uuid
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  base_slug text;
  candidate_slug text;
  suffix_number integer := 1;
begin
  base_slug := lower(
    translate(
      coalesce(nullif(trim(value), ''), 'tienda'),
      U&'\00E1\00E9\00ED\00F3\00FA\00FC\00F1\00C1\00C9\00CD\00D3\00DA\00DC\00D1',
      'aeiouunAEIOUUN'
    )
  );
  base_slug := regexp_replace(base_slug, '[^a-z0-9]+', '-', 'g');
  base_slug := trim(both '-' from base_slug);

  if base_slug = '' then
    base_slug := 'tienda';
  end if;

  candidate_slug := base_slug;

  while exists (
    select 1
    from public.businesses
    where slug = candidate_slug
  ) loop
    if suffix_number = 1 then
      candidate_slug := base_slug || '-' || left(user_id::text, 8);
    else
      candidate_slug := base_slug || '-' || left(user_id::text, 8) || '-' || suffix_number::text;
    end if;

    suffix_number := suffix_number + 1;
  end loop;

  return candidate_slug;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  metadata jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  account_type_value text := lower(nullif(trim(metadata ->> 'account_type'), ''));
  business_name_value text := nullif(trim(metadata ->> 'business_name'), '');
  category_id_value uuid;
  profile_role public.user_role;
begin
  if account_type_value is null or account_type_value not in ('buyer', 'merchant') then
    return new;
  end if;

  profile_role := case
    when account_type_value = 'buyer' then 'buyer'::public.user_role
    else 'merchant'::public.user_role
  end;

  insert into public.profiles (
    id,
    full_name,
    phone,
    role
  )
  values (
    new.id,
    coalesce(
      nullif(trim(metadata ->> 'full_name'), ''),
      case when profile_role = 'buyer' then 'Comprador' else 'Comerciante' end
    ),
    coalesce(nullif(trim(metadata ->> 'phone'), ''), ''),
    profile_role
  )
  on conflict (id) do update
  set
    full_name = excluded.full_name,
    phone = excluded.phone,
    role = excluded.role;

  if profile_role = 'merchant' and business_name_value is not null then
    begin
      category_id_value := nullif(trim(metadata ->> 'category_id'), '')::uuid;
    exception
      when invalid_text_representation then
        category_id_value := null;
    end;

    insert into public.businesses (
      owner_id,
      category_id,
      name,
      slug,
      description,
      city,
      address,
      whatsapp,
      status
    )
    values (
      new.id,
      category_id_value,
      business_name_value,
      public.make_business_slug(business_name_value, new.id),
      coalesce(nullif(trim(metadata ->> 'description'), ''), ''),
      coalesce(nullif(trim(metadata ->> 'city'), ''), ''),
      coalesce(nullif(trim(metadata ->> 'address'), ''), ''),
      coalesce(
        nullif(trim(metadata ->> 'whatsapp'), ''),
        nullif(trim(metadata ->> 'phone'), ''),
        ''
      ),
      'pending_review'::public.business_status
    );
  end if;

  return new;
end;
$$;

create or replace function public.complete_oauth_onboarding(
  p_account_type text,
  p_business_name text default null,
  p_category_id uuid default null,
  p_city text default null,
  p_address text default null,
  p_whatsapp text default null,
  p_description text default null
)
returns public.user_role
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  account_type_value text := lower(nullif(trim(p_account_type), ''));
  metadata jsonb;
  existing_role public.user_role;
  selected_role public.user_role;
  full_name_value text;
  phone_value text;
begin
  if current_user_id is null then
    raise exception 'Debes iniciar sesion para completar el registro.';
  end if;

  if account_type_value not in ('buyer', 'merchant') then
    raise exception 'Tipo de cuenta no permitido.';
  end if;

  perform 1
  from auth.users
  where id = current_user_id
  for update;

  select profiles.role
  into existing_role
  from public.profiles
  where profiles.id = current_user_id;

  if found then
    return existing_role;
  end if;

  select coalesce(raw_user_meta_data, '{}'::jsonb)
  into metadata
  from auth.users
  where id = current_user_id;

  selected_role := account_type_value::public.user_role;
  full_name_value := coalesce(
    nullif(trim(metadata ->> 'full_name'), ''),
    nullif(trim(metadata ->> 'name'), ''),
    case when selected_role = 'buyer' then 'Cliente' else 'Comerciante' end
  );
  phone_value := coalesce(nullif(trim(metadata ->> 'phone'), ''), '');

  if selected_role = 'merchant' then
    if nullif(trim(p_business_name), '') is null
      or p_category_id is null
      or nullif(trim(p_city), '') is null
      or nullif(trim(p_address), '') is null
      or nullif(trim(p_whatsapp), '') is null then
      raise exception 'Completa los datos obligatorios del comercio.';
    end if;

    phone_value := trim(p_whatsapp);
  end if;

  insert into public.profiles (id, full_name, phone, role)
  values (current_user_id, full_name_value, phone_value, selected_role);

  if selected_role = 'merchant' then
    insert into public.businesses (
      owner_id,
      category_id,
      name,
      slug,
      description,
      city,
      address,
      whatsapp,
      status
    )
    values (
      current_user_id,
      p_category_id,
      trim(p_business_name),
      public.make_business_slug(trim(p_business_name), current_user_id),
      coalesce(nullif(trim(p_description), ''), ''),
      trim(p_city),
      trim(p_address),
      trim(p_whatsapp),
      'pending_review'::public.business_status
    );
  end if;

  update auth.users
  set raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb)
    || jsonb_build_object('account_type', account_type_value)
  where id = current_user_id;

  return selected_role;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

-- Supabase Auth debe poder ejecutar la funcion cuando se registra un usuario.
revoke all on function public.handle_new_user() from public;
revoke all on function public.make_business_slug(text, uuid) from public;
revoke all on function public.complete_oauth_onboarding(text, text, uuid, text, text, text, text) from public;
grant execute on function public.complete_oauth_onboarding(text, text, uuid, text, text, text, text) to authenticated;
