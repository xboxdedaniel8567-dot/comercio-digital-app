# Piloto controlado de Comercio Digital

Esta guia prepara una prueba real pequena antes de abrir la plataforma a toda Cali. El objetivo no es tener miles de usuarios todavia, sino comprobar que compradores y comerciantes pueden completar los recorridos esenciales sin ayuda.

## Alcance recomendado

- Duracion: 14 dias.
- Zona: una parte concreta de Cali.
- Comercios: entre 3 y 5 negocios conocidos.
- Compradores: entre 10 y 20 personas invitadas.
- Catalogo: entre 10 y 25 productos reales por comercio.
- Venta: contacto por WhatsApp o reserva; sin pagos integrados durante el piloto.

## Paso 1: comprobar Supabase

1. Abre Supabase y entra a `SQL Editor`.
2. Ejecuta nuevamente `supabase/auth_onboarding.sql` para instalar la correccion de roles.
3. Ejecuta `supabase/pilot_readiness_check.sql`.
4. Revisa la columna `status`. Todo debe quedar en `OK` o, cuando corresponda, `NO APLICA`.
5. No continúes con usuarios reales si aparece `FALTA` o `REVISAR`; guarda una captura para diagnosticarlo.

## Paso 2: configurar el entorno publico

- Define `NEXT_PUBLIC_SUPABASE_URL` con la URL del proyecto.
- Define `NEXT_PUBLIC_SUPABASE_ANON_KEY` solo con la clave publicable.
- Define `NEXT_PUBLIC_SITE_URL` con el dominio final que usaran los participantes.
- Nunca publiques una clave `secret` o `service_role` en GitHub ni en variables `NEXT_PUBLIC_*`.
- Configura en Supabase Auth la URL publica y las rutas de redireccion permitidas.

## Paso 3: prueba interna completa

### Comprador

- Crear cuenta y confirmar el correo.
- Iniciar y cerrar sesion.
- Buscar un producto con y sin resultados.
- Aplicar filtros y abrir un producto.
- Guardar y retirar un favorito.
- Contactar por WhatsApp.
- Crear y cancelar una reserva.
- Enviar un reporte y una solicitud de privacidad.

### Comerciante

- Crear una cuenta comercial.
- Esperar aprobacion administrativa.
- Completar datos, ubicacion, horario, logo y portada.
- Crear, editar, ocultar y reactivar un producto.
- Subir imagenes y crear variantes.
- Actualizar stock y responder una reserva.
- Ver estadisticas y notificaciones.

### Administrador

- Aprobar y rechazar un comercio de prueba.
- Aprobar, ocultar y restaurar productos.
- Revisar reportes y solicitudes de privacidad.
- Crear y editar categorias.
- Comprobar que una cuenta compradora no puede abrir paneles administrativos.
- Comprobar que un comerciante no puede modificar datos de otra tienda.

## Paso 4: operar el piloto

- Entrega a cada comercio una sola persona de contacto.
- Registra fecha, usuario, pantalla, problema y captura de cada incidente.
- No corrijas datos directamente en producción sin anotar qué cambiaste.
- Revisa cada dia errores, comercios pendientes, productos reportados y solicitudes de privacidad.
- Realiza una copia de seguridad antes de cambios SQL importantes.

## Metricas de salida

El piloto puede avanzar cuando:

- Al menos 80% de las busquedas de prueba encuentra una opcion util.
- Al menos 90% de los participantes completa su tarea principal sin asistencia.
- No existen errores críticos de acceso, perdida de datos o exposición entre cuentas.
- Cada comercio mantiene precios, stock y horarios actualizados durante los 14 dias.
- Los comerciantes confirman que los contactos recibidos son comprensibles y relevantes.

## Riesgos que siguen pendientes

- Las escrituras anonimas de busquedas y contactos necesitan limites contra abuso antes de un lanzamiento masivo.
- Los textos legales deben recibir revision profesional antes de operar comercialmente a gran escala.
- La moderacion, soporte y copias de seguridad necesitan responsables definidos.
- El mapa, pagos, OCR e IA avanzada no son requisitos para validar este primer piloto.
