-- Comercio Digital: registro atomico de comerciante.
-- Crea automaticamente el perfil y el comercio cuando Supabase Auth crea el usuario.

create or replace function public.make_business_slug(
  business_name text,
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
      coalesce(nullif(trim(business_name), ''), 'tienda'),
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
  business_name_value text := nullif(trim(metadata ->> 'business_name'), '');
  category_id_value uuid;
begin
  insert into public.profiles (
    id,
    full_name,
    phone,
    role
  )
  values (
    new.id,
    coalesce(nullif(trim(metadata ->> 'full_name'), ''), 'Comerciante'),
    coalesce(nullif(trim(metadata ->> 'phone'), ''), ''),
    'merchant'::public.user_role
  )
  on conflict (id) do update
  set
    full_name = excluded.full_name,
    phone = excluded.phone;

  if business_name_value is not null then
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

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

-- Supabase Auth debe poder ejecutar la funcion cuando se registra un usuario.
revoke all on function public.handle_new_user() from public;
revoke all on function public.make_business_slug(text, uuid) from public;
