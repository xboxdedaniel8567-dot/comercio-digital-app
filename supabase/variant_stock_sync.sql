-- Comercio Digital - Sincronizacion automatica de stock por variantes.
-- Ejecutar despues de product_variants.sql.

create or replace function public.sync_product_stock_from_variants()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_product_id uuid;
begin
  if tg_op = 'DELETE' then
    target_product_id := old.product_id;
  else
    target_product_id := new.product_id;
  end if;

  update public.products
  set
    stock = coalesce((
      select sum(product_variants.stock)
      from public.product_variants
      where product_variants.product_id = target_product_id
        and product_variants.is_active = true
    ), 0),
    updated_at = now()
  where products.id = target_product_id;

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

drop trigger if exists sync_product_stock_after_variant_change
on public.product_variants;

create trigger sync_product_stock_after_variant_change
after insert or update of stock, is_active or delete
on public.product_variants
for each row
execute function public.sync_product_stock_from_variants();

-- Ajusta una sola vez los productos que ya tienen variantes.
update public.products
set stock = variant_totals.total_stock,
    updated_at = now()
from (
  select
    product_id,
    coalesce(sum(stock) filter (where is_active = true), 0)::integer as total_stock
  from public.product_variants
  group by product_id
) as variant_totals
where products.id = variant_totals.product_id;
