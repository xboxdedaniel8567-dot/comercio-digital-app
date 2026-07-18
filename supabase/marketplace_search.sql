-- Comercio Digital - Motor de busqueda escalable del marketplace.
-- Busca en productos, tiendas, categorias, atributos y variantes sin limitarse
-- a los primeros registros descargados por el frontend.

create extension if not exists unaccent with schema extensions;

create or replace function public.search_marketplace_products(
  search_query text default '',
  city_query text default '',
  category_slug text default '',
  subcategory_filter uuid default null,
  minimum_price numeric default null,
  maximum_price numeric default null,
  result_limit integer default 100
)
returns table (
  product_id uuid,
  relevance integer
)
language sql
stable
security invoker
set search_path = public, extensions
as $$
  with searchable_products as (
    select
      p.id,
      p.updated_at,
      lower(extensions.unaccent(trim(coalesce(search_query, '')))) as normalized_query,
      lower(extensions.unaccent(concat_ws(
        ' ',
        p.name,
        p.description,
        b.name,
        b.city,
        c.name,
        sc.name,
        coalesce((
          select string_agg(pav.value, ' ')
          from public.product_attribute_values pav
          where pav.product_id = p.id
        ), ''),
        coalesce((
          select string_agg(concat_ws(' ', pv.name, pv.option_values::text), ' ')
          from public.product_variants pv
          where pv.product_id = p.id
            and pv.is_active = true
            and pv.stock > 0
        ), '')
      ))) as search_document,
      lower(extensions.unaccent(p.name)) as normalized_name,
      lower(extensions.unaccent(coalesce(c.name, ''))) as normalized_category,
      lower(extensions.unaccent(coalesce(sc.name, ''))) as normalized_subcategory,
      lower(extensions.unaccent(b.name)) as normalized_business
    from public.products p
    join public.businesses b on b.id = p.business_id
    left join public.categories c on c.id = p.category_id
    left join public.subcategories sc on sc.id = p.subcategory_id
    where p.status = 'active'
      and p.moderation_status = 'approved'
      and b.status = 'active'
      and (p.stock is null or p.stock > 0)
      and (
        trim(coalesce(city_query, '')) = ''
        or lower(extensions.unaccent(b.city)) like
          '%' || lower(extensions.unaccent(trim(city_query))) || '%'
      )
      and (trim(coalesce(category_slug, '')) = '' or c.slug = category_slug)
      and (subcategory_filter is null or sc.id = subcategory_filter)
      and (minimum_price is null or p.price >= minimum_price)
      and (maximum_price is null or p.price <= maximum_price)
  ),
  scored_products as (
    select
      id,
      updated_at,
      normalized_query,
      case
        when normalized_query = '' then 1
        else
          (case when normalized_name = normalized_query then 100 else 0 end) +
          (case when normalized_name like '%' || normalized_query || '%' then 45 else 0 end) +
          (case when normalized_category like '%' || normalized_query || '%' then 25 else 0 end) +
          (case when normalized_subcategory like '%' || normalized_query || '%' then 25 else 0 end) +
          (case when normalized_business like '%' || normalized_query || '%' then 20 else 0 end) +
          (case when search_document like '%' || normalized_query || '%' then 15 else 0 end)
      end as score
    from searchable_products
  )
  select id, score
  from scored_products
  where normalized_query = '' or score > 0
  order by score desc, updated_at desc
  limit least(greatest(coalesce(result_limit, 100), 1), 200);
$$;

grant execute on function public.search_marketplace_products(
  text,
  text,
  text,
  uuid,
  numeric,
  numeric,
  integer
) to anon, authenticated;
