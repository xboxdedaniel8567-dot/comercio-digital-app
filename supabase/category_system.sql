-- Comercio Digital - Sistema de categorias escalable
-- Objetivo: preparar categorias, subcategorias y atributos dinamicos para crecer por toda la ciudad.
-- Ejecutar en Supabase SQL Editor cuando estemos listos para activar esta etapa.

create extension if not exists "uuid-ossp";

-- Permite que el producto pueda pertenecer a una categoria principal y, opcionalmente,
-- a una subcategoria mas especifica.
create table if not exists public.subcategories (
  id uuid primary key default uuid_generate_v4(),
  category_id uuid not null references public.categories(id) on delete cascade,
  name text not null,
  slug text not null,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (category_id, slug)
);

-- Define los campos que cada categoria necesita.
-- Ejemplos: Tecnologia -> almacenamiento, ram; Calzado -> talla, color; Libros -> autor, isbn.
create table if not exists public.category_attributes (
  id uuid primary key default uuid_generate_v4(),
  category_id uuid not null references public.categories(id) on delete cascade,
  subcategory_id uuid references public.subcategories(id) on delete cascade,
  name text not null,
  slug text not null,
  input_type text not null default 'text',
  is_required boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (category_id, subcategory_id, slug)
);

alter table public.products
  add column if not exists subcategory_id uuid references public.subcategories(id) on delete set null;

create index if not exists idx_subcategories_category_id on public.subcategories(category_id);
create index if not exists idx_subcategories_slug on public.subcategories(slug);
create index if not exists idx_category_attributes_category_id on public.category_attributes(category_id);
create index if not exists idx_category_attributes_subcategory_id on public.category_attributes(subcategory_id);
create index if not exists idx_products_subcategory_id on public.products(subcategory_id);

-- PostgreSQL permite varios valores NULL dentro de una restriccion UNIQUE.
-- Este indice evita repetir un atributo general cuando no tiene subcategoria.
create unique index if not exists uq_category_attributes_general_slug
on public.category_attributes(category_id, slug)
where subcategory_id is null;

alter table public.categories enable row level security;
alter table public.subcategories enable row level security;
alter table public.category_attributes enable row level security;

drop policy if exists "Anyone can read active subcategories" on public.subcategories;
create policy "Anyone can read active subcategories"
on public.subcategories
for select
to anon, authenticated
using (is_active = true);

drop policy if exists "Anyone can read category attributes" on public.category_attributes;
create policy "Anyone can read category attributes"
on public.category_attributes
for select
to anon, authenticated
using (true);

-- Escritura administrativa.
-- Requiere que public.profiles.role sea 'admin' o 'super_admin'.
drop policy if exists "Admins can manage categories" on public.categories;
create policy "Admins can manage categories"
on public.categories
for all
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('admin', 'super_admin')
  )
)
with check (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('admin', 'super_admin')
  )
);

drop policy if exists "Admins can manage subcategories" on public.subcategories;
create policy "Admins can manage subcategories"
on public.subcategories
for all
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('admin', 'super_admin')
  )
)
with check (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('admin', 'super_admin')
  )
);

drop policy if exists "Admins can manage category attributes" on public.category_attributes;
create policy "Admins can manage category attributes"
on public.category_attributes
for all
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('admin', 'super_admin')
  )
)
with check (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('admin', 'super_admin')
  )
);

grant select on public.subcategories to anon, authenticated;
grant select on public.category_attributes to anon, authenticated;
grant insert, update, delete on public.categories to authenticated;
grant insert, update, delete on public.subcategories to authenticated;
grant insert, update, delete on public.category_attributes to authenticated;

-- Categorias principales sugeridas para expansion futura.
insert into public.categories (name, slug, description)
select 'Hogar', 'hogar', 'Productos para casa, decoracion, cocina y muebles.'
where not exists (select 1 from public.categories where slug = 'hogar');

insert into public.categories (name, slug, description)
select 'Belleza y cuidado personal', 'belleza-cuidado-personal', 'Cosmetica, cuidado personal, barberia, peluqueria y bienestar.'
where not exists (select 1 from public.categories where slug = 'belleza-cuidado-personal');

insert into public.categories (name, slug, description)
select 'Mascotas', 'mascotas', 'Alimentos, accesorios, juguetes y servicios para mascotas.'
where not exists (select 1 from public.categories where slug = 'mascotas');

insert into public.categories (name, slug, description)
select 'Papeleria', 'papeleria', 'Utiles escolares, oficina, impresion, libros y articulos de estudio.'
where not exists (select 1 from public.categories where slug = 'papeleria');

insert into public.categories (name, slug, description)
select 'Deportes', 'deportes', 'Ropa deportiva, accesorios, suplementos y articulos para entrenamiento.'
where not exists (select 1 from public.categories where slug = 'deportes');

insert into public.categories (name, slug, description)
select 'Repuestos', 'repuestos', 'Repuestos para motos, carros, bicicletas, maquinaria y equipos.'
where not exists (select 1 from public.categories where slug = 'repuestos');

insert into public.categories (name, slug, description)
select 'Joyeria y bisuteria', 'joyeria-bisuteria', 'Joyas, accesorios, relojes, bisuteria y articulos de moda.'
where not exists (select 1 from public.categories where slug = 'joyeria-bisuteria');

insert into public.categories (name, slug, description)
select 'Alimentos', 'alimentos', 'Mercado, fruver, viveres, dulceria, bebidas y productos alimenticios.'
where not exists (select 1 from public.categories where slug = 'alimentos');

insert into public.categories (name, slug, description)
select 'Restaurantes y comidas', 'restaurantes-comidas', 'Restaurantes, comidas rapidas, cafeterias, panaderias y bebidas preparadas.'
where not exists (select 1 from public.categories where slug = 'restaurantes-comidas');

insert into public.categories (name, slug, description)
select 'Servicios', 'servicios', 'Servicios profesionales, tecnicos, belleza, reparacion, mantenimiento y asesorias.'
where not exists (select 1 from public.categories where slug = 'servicios');

-- Subcategorias iniciales por categoria existente.
insert into public.subcategories (category_id, name, slug, description)
select c.id, 'Celulares', 'celulares', 'Telefonos moviles nuevos, usados y reacondicionados.'
from public.categories c
where c.slug = 'tecnologia'
  and not exists (
    select 1 from public.subcategories s where s.category_id = c.id and s.slug = 'celulares'
  );

insert into public.subcategories (category_id, name, slug, description)
select c.id, 'Accesorios de celular', 'accesorios-celular', 'Cargadores, audifonos, protectores, vidrios, estuches y cables.'
from public.categories c
where c.slug = 'tecnologia'
  and not exists (
    select 1 from public.subcategories s where s.category_id = c.id and s.slug = 'accesorios-celular'
  );

insert into public.subcategories (category_id, name, slug, description)
select c.id, 'Tenis', 'tenis', 'Calzado deportivo, urbano y casual.'
from public.categories c
where c.slug = 'calzado'
  and not exists (
    select 1 from public.subcategories s where s.category_id = c.id and s.slug = 'tenis'
  );

insert into public.subcategories (category_id, name, slug, description)
select c.id, 'Herramientas electricas', 'herramientas-electricas', 'Taladros, pulidoras, sierras, lijadoras y equipos electricos.'
from public.categories c
where c.slug = 'ferreteria'
  and not exists (
    select 1 from public.subcategories s where s.category_id = c.id and s.slug = 'herramientas-electricas'
  );

-- Atributos iniciales para demostrar el Adaptive Business Engine.
insert into public.category_attributes (category_id, name, slug, input_type, is_required, sort_order)
select c.id, 'Marca', 'marca', 'text', false, 10
from public.categories c
where c.slug = 'tecnologia'
  and not exists (
    select 1 from public.category_attributes a where a.category_id = c.id and a.slug = 'marca'
  );

insert into public.category_attributes (category_id, name, slug, input_type, is_required, sort_order)
select c.id, 'Capacidad', 'capacidad', 'text', false, 20
from public.categories c
where c.slug = 'tecnologia'
  and not exists (
    select 1 from public.category_attributes a where a.category_id = c.id and a.slug = 'capacidad'
  );

insert into public.category_attributes (category_id, name, slug, input_type, is_required, sort_order)
select c.id, 'Talla', 'talla', 'text', false, 10
from public.categories c
where c.slug = 'calzado'
  and not exists (
    select 1 from public.category_attributes a where a.category_id = c.id and a.slug = 'talla'
  );

insert into public.category_attributes (category_id, name, slug, input_type, is_required, sort_order)
select c.id, 'Color', 'color', 'text', false, 20
from public.categories c
where c.slug in ('ropa', 'calzado', 'accesorios')
  and not exists (
    select 1 from public.category_attributes a where a.category_id = c.id and a.slug = 'color'
  );
