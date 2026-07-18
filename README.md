# Comercio Digital

Marketplace web/PWA de Gregor Magnus para encontrar productos disponibles en comercios fisicos, comparar opciones y contactar directamente a las tiendas.

## Estado actual

El MVP funcional incluye:

- Busqueda tolerante a errores, sinonimos, filtros y paginacion.
- Perfiles publicos de tiendas y productos.
- Contacto por WhatsApp y rutas en Google Maps.
- Cuentas de compradores, favoritos, historial, reservas y reportes.
- Registro y panel de comerciantes.
- Productos, imagenes, atributos adaptativos, variantes y control de stock.
- Moderacion, categorias, calidad y estadisticas administrativas.
- Notificaciones internas.
- PWA instalable, SEO, sitemap y paginas por ciudad.
- Terminos, privacidad, tratamiento de datos y registro de consentimientos.

## Tecnologias

- React 19 y TypeScript.
- Next.js 16 sobre Vinext/Vite.
- Supabase Auth, PostgreSQL y Storage.
- CSS responsive propio.
- npm como administrador de paquetes.

## Configuracion local

Requiere Node.js 22.13 o superior.

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

Completa `.env.local` con la URL y la clave publicable de Supabase. Nunca incluyas claves secretas o `service_role` en variables `NEXT_PUBLIC_*`.

La aplicacion estara disponible en `http://localhost:3000`.

## Verificacion

```powershell
npm run lint
npm test
```

`npm test` compila la aplicacion y ejecuta las pruebas del marketplace.

## Base de datos

Los scripts SQL incrementales estan en `supabase/`. Deben ejecutarse en el SQL Editor del proyecto correspondiente y conservarse como historial tecnico.

## Seguridad

- `.env.local` esta excluido de Git.
- Las tablas privadas usan Row Level Security.
- Los permisos administrativos se validan con perfiles y roles.
- Las acciones sensibles se ejecutan mediante funciones controladas en PostgreSQL.

## Proxima fase

Preparar un entorno publico de prueba, realizar pruebas con comercios piloto y aplicar el sistema visual definitivo a partir de prototipos aprobados.
