# Sistema de Categorias - Comercio Digital

## Objetivo

Preparar Comercio Digital para digitalizar muchos tipos de negocios de la ciudad, no solo las categorias del MVP.

La plataforma debe soportar:

- Categorias principales.
- Subcategorias.
- Atributos dinamicos por categoria.
- Formularios que cambian segun el tipo de producto.

## Estado actual

La tabla `categories` ya existe y se usa en:

- Registro de tiendas.
- Crear producto.
- Editar producto.
- Busqueda.
- Rutas publicas por ciudad/categoria.
- Panel administrador.

El formulario de crear producto ya lee categorias desde Supabase. Esto significa que cuando se agreguen categorias nuevas, aparecen automaticamente.

## Siguiente etapa

El archivo `supabase/category_system.sql` prepara:

- Tabla `subcategories`.
- Tabla `category_attributes`.
- Columna `subcategory_id` en `products`.
- Politicas RLS para lectura publica.
- Politicas de escritura solo para usuarios `admin` o `super_admin`.
- Categorias sugeridas para expansion.
- Subcategorias iniciales.
- Atributos iniciales para el Adaptive Business Engine.

## Cuando ejecutar el SQL

Ejecutar `supabase/category_system.sql` cuando estemos listos para pasar de categorias simples a categorias profesionales.

No es necesario ejecutarlo para que el MVP actual siga funcionando.

## Importante

No debemos permitir que cualquier visitante cree categorias. La creacion y edicion de categorias debe ser una accion administrativa.

Para que un usuario pueda administrar categorias, su registro en `profiles` debe tener:

```text
role = 'admin'
```

o:

```text
role = 'super_admin'
```

## Ejemplos

### Tecnologia

Subcategorias:

- Celulares.
- Accesorios de celular.
- Computadores.
- Audifonos.
- Cargadores.

Atributos:

- Marca.
- Modelo.
- Capacidad.
- Estado.
- Garantia.

### Calzado

Subcategorias:

- Tenis.
- Botas.
- Sandalias.
- Zapatos formales.

Atributos:

- Talla.
- Color.
- Material.
- Genero.
- Marca.

### Ferreteria

Subcategorias:

- Herramientas electricas.
- Tornilleria.
- Pinturas.
- Seguridad industrial.

Atributos:

- Voltaje.
- Potencia.
- Medida.
- Material.
- Fabricante.

## Vision

Este sistema sera la base del Adaptive Business Engine. La meta es que Comercio Digital pueda adaptarse a cualquier tipo de negocio fisico sin construir una app diferente para cada sector.
