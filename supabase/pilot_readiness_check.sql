-- Comercio Digital - Diagnostico de preparacion para el piloto.
-- Es de solo lectura: no crea, modifica ni elimina datos.

with expected_tables(table_name) as (
  values
    ('profiles'),
    ('businesses'),
    ('categories'),
    ('products'),
    ('product_images'),
    ('product_variants'),
    ('favorites'),
    ('search_logs'),
    ('contact_events'),
    ('reservation_requests'),
    ('marketplace_reports'),
    ('notifications'),
    ('privacy_requests'),
    ('legal_consents')
),
table_checks as (
  select
    'Tabla'::text as area,
    expected_tables.table_name as check_name,
    case when tables.table_name is not null then 'OK' else 'FALTA' end as status,
    case
      when tables.table_name is not null then 'Existe en el esquema public'
      else 'Ejecuta el script SQL que crea esta tabla'
    end as detail
  from expected_tables
  left join information_schema.tables as tables
    on tables.table_schema = 'public'
   and tables.table_name = expected_tables.table_name
),
rls_checks as (
  select
    'RLS'::text as area,
    expected_tables.table_name as check_name,
    case
      when classes.relrowsecurity then 'OK'
      when classes.oid is null then 'NO APLICA'
      else 'REVISAR'
    end as status,
    case
      when classes.relrowsecurity then 'Row Level Security esta habilitado'
      when classes.oid is null then 'La tabla no existe'
      else 'La tabla existe, pero RLS esta deshabilitado'
    end as detail
  from expected_tables
  left join pg_catalog.pg_class as classes
    on classes.relname = expected_tables.table_name
   and classes.relnamespace = 'public'::regnamespace
),
policy_check as (
  select
    'Seguridad'::text as area,
    'Politicas RLS'::text as check_name,
    case when count(*) >= 10 then 'OK' else 'REVISAR' end as status,
    count(*)::text || ' politicas encontradas en public' as detail
  from pg_catalog.pg_policies
  where schemaname = 'public'
),
trigger_check as (
  select
    'Registro'::text as area,
    'on_auth_user_created'::text as check_name,
    case when count(*) = 1 then 'OK' else 'REVISAR' end as status,
    case
      when count(*) = 1 then 'El registro automatico de perfiles esta activo'
      else 'Vuelve a ejecutar auth_onboarding.sql'
    end as detail
  from pg_catalog.pg_trigger
  where tgname = 'on_auth_user_created'
    and not tgisinternal
),
bucket_check as (
  select
    'Storage'::text as area,
    'product-images'::text as check_name,
    case
      when count(*) = 1 and bool_or(public) then 'OK'
      when count(*) = 1 then 'REVISAR'
      else 'FALTA'
    end as status,
    case
      when count(*) = 1 and bool_or(public) then 'Bucket publico disponible'
      when count(*) = 1 then 'El bucket existe, pero no es publico'
      else 'Crea el bucket product-images'
    end as detail
  from storage.buckets
  where id = 'product-images'
)
select * from table_checks
union all
select * from rls_checks
union all
select * from policy_check
union all
select * from trigger_check
union all
select * from bucket_check
order by area, check_name;
