# Configuracion de autenticacion

## URLs de desarrollo en Supabase

En Authentication > URL Configuration:

- Site URL: `http://localhost:3000`
- Redirect URL: `http://localhost:3000/panel/login`
- Redirect URL: `http://localhost:3000/panel/restablecer`

## Correo

Durante el piloto se puede desactivar la confirmacion de correo para evitar limites del proveedor de prueba.
Antes de produccion se debe configurar SMTP propio y volver a activar la confirmacion.

## Flujo

1. El usuario completa el registro.
2. Supabase crea la cuenta Auth.
3. El trigger crea perfil y comercio en una misma transaccion.
4. El comercio nace en `pending_review`.
5. El administrador lo aprueba desde `/admin/comercios`.
