-- Crea o actualiza el perfil personal del fundador como superadministrador.
-- Esta operacion se ejecuta una sola vez desde Supabase SQL Editor.

insert into public.profiles (id, full_name, phone, role)
select
  id,
  'Daniel Stevan Ramos Garavino',
  '573225840281',
  'super_admin'::public.user_role
from auth.users
where lower(email) = lower('xboxdedaniel8567@gmail.com')
on conflict (id) do update
set
  full_name = excluded.full_name,
  phone = excluded.phone,
  role = excluded.role;

alter table public.profiles enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
on public.profiles
for select
to authenticated
using (id = (select auth.uid()));

grant select on public.profiles to authenticated;

select
  auth.users.email,
  public.profiles.full_name,
  public.profiles.role
from auth.users
join public.profiles on public.profiles.id = auth.users.id
where lower(auth.users.email) = lower('xboxdedaniel8567@gmail.com');
