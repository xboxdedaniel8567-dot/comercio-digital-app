# Comercio Digital - Design System v1

## 1. Objetivo

Este sistema visual unifica el marketplace publico, la cuenta del comprador, el panel del comerciante y el panel administrativo. Debe transmitir confianza, tecnologia util, comercio local y orden sin convertir el producto en una experiencia de lujo, banca o criptomonedas.

Principios:

- Oscuro comodo, sin grandes superficies blancas.
- Informacion primero; decoracion despues.
- Acciones y estados reconocibles sin depender solo del color.
- Experiencia mobile first.
- Componentes reutilizables y consistentes.
- Datos reales; nunca cifras o garantias inventadas.

## 2. Direccion aprobada

Los mockups de referencia aportan una base fuerte para:

- Cabecera con busqueda y accesos de cuenta.
- Navegacion inferior en movil.
- Resultados visuales con producto, precio, tienda y distancia.
- Detalles de producto con galeria, variantes, stock y acciones.
- Perfil de tienda con identidad, ubicacion, horarios y catalogo.
- Estados vacios orientados a recuperar la tarea.

No se implementaran como disponibles hasta tener soporte real:

- Calificaciones y resenas.
- Blog, ofertas y mensajeria interna.
- Seguir tiendas.
- Mapa interno interactivo.
- Llamadas si el comercio no publica telefono habilitado.
- Garantias como "producto original" o "compra segura".
- Estadisticas publicas inventadas.

## 3. Colores

### Base

| Token | Valor | Uso |
| --- | --- | --- |
| `--background` | `#080A0C` | Fondo general |
| `--panel` | `#0F1216` | Paneles y tarjetas |
| `--panel-raised` | `#15191F` | Menus, dialogos y superficies elevadas |
| `--panel-interactive` | `#1A2027` | Hover y seleccion neutral |
| `--line` | `#2A323C` | Divisiones y bordes |
| `--line-strong` | `#414C58` | Bordes destacados |
| `--foreground` | `#F4F7FA` | Texto principal |
| `--muted` | `#A6AFB9` | Texto secundario |
| `--subtle` | `#74808C` | Ayudas y placeholders |

### Accion y estados

| Token | Valor | Uso |
| --- | --- | --- |
| `--accent` | `#70B7FF` | Accion principal, enlaces y foco |
| `--accent-strong` | `#3699FF` | Hover de accion principal |
| `--success` | `#34D399` | Disponible, activo, abierto, confirmado |
| `--warning` | `#FBBF24` | Pendiente, revision, pocas unidades |
| `--danger` | `#FB7185` | Error, agotado, rechazado, cancelado |
| `--info` | `#60A5FA` | Informacion neutral |

El azul claro se elige como acento porque diferencia las acciones de navegacion del verde de WhatsApp y de los estados exitosos.

## 4. Tipografia

Familia principal:

```css
Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
```

Escala recomendada:

| Nivel | Escritorio | Movil | Peso |
| --- | --- | --- | --- |
| Titulo de pagina | 40-52 px | 32-40 px | 600-700 |
| Titulo de seccion | 24-30 px | 22-26 px | 600-700 |
| Titulo de tarjeta | 16-18 px | 16-18 px | 600-700 |
| Texto | 16 px | 16 px | 400 |
| Texto secundario | 14 px | 14 px | 400 |
| Etiqueta | 12-13 px | 12-13 px | 700-800 |

Reglas:

- Letter spacing en `0`.
- Altura de linea minima de `1.4` para texto normal.
- No usar texto menor de 12 px.
- El precio debe destacar sin competir con el nombre del producto.

## 5. Espaciado

Escala: `4, 8, 12, 16, 24, 32, 48, 64` px.

- Separacion interna compacta: 8-12 px.
- Tarjetas: 16-20 px.
- Paneles: 20-24 px.
- Secciones: 48 px en movil y 64-72 px en escritorio.
- Contenedor publico maximo: 1180-1280 px.

## 6. Bordes y elevacion

- Radio pequeno: 4 px.
- Radio normal: 6 px.
- Radio maximo para tarjetas: 8 px.
- Controles circulares solo para iconos familiares, avatar o ubicacion.
- No anidar tarjetas dentro de tarjetas.
- La elevacion se reserva para dialogos, menus y elementos flotantes.

## 7. Botones

### Principal

- Fondo azul claro.
- Texto oscuro.
- Una sola accion principal por bloque.
- Altura minima: 44 px.

### Secundario

- Fondo transparente o carbon.
- Borde gris fuerte.
- Texto principal.

### WhatsApp

- Puede usar verde cuando sea la accion comercial principal.
- Siempre incluye icono y texto "WhatsApp".
- El mensaje debe indicar producto o variante cuando corresponda.

### Destructivo

- Rojo solo para eliminar, rechazar o cancelar.
- Requiere confirmacion cuando la accion no sea reversible.

### Boton de icono

- Area tactil minima de 44 x 44 px.
- Tooltip en escritorio y etiqueta accesible.

## 8. Campos y formularios

- Altura minima: 52 px.
- Etiqueta visible sobre el control.
- Placeholder como ejemplo, nunca como unica etiqueta.
- Foco azul visible.
- Mensaje de error debajo del campo en rojo, con explicacion util.
- Agrupar campos por objetivo y no en una lista interminable.
- Guardado con estado: guardando, guardado o error.

## 9. Tarjeta de producto

Informacion minima:

1. Imagen real del producto.
2. Categoria o subcategoria.
3. Nombre.
4. Precio en COP.
5. Tienda.
6. Disponibilidad o stock resumido.
7. Distancia solo si existe ubicacion autorizada y coordenadas reales.

Acciones:

- Abrir detalle al seleccionar la tarjeta.
- Favorito mediante boton de icono.
- No llenar la tarjeta con multiples botones.

## 10. Estado y disponibilidad

Cada estado combina texto, color e icono:

- Verde: activo, abierto, confirmado, disponible.
- Ambar: pendiente, en revision, pocas unidades.
- Rojo: rechazado, cancelado, agotado, error.
- Azul: informacion, procesando.
- Gris: inactivo, oculto, cerrado, completado cuando sea historico.

## 11. Navegacion

### Publica en escritorio

- Marca.
- Busqueda global.
- Ubicacion cuando exista soporte.
- Accesos a favoritos, reservas, notificaciones y cuenta.

### Publica en movil

Maximo cinco destinos frecuentes:

- Inicio.
- Buscar.
- Favoritos.
- Reservas.
- Cuenta.

Las notificaciones pueden aparecer en cabecera con contador.

### Paneles

- Navegacion lateral en escritorio.
- Navegacion compacta o menu en movil.
- La pagina activa debe identificarse visualmente.
- Administracion prioriza densidad y comparacion sobre imagenes grandes.

## 12. Estados de interfaz obligatorios

Todo listado o formulario debe definir:

- Cargando con skeleton.
- Vacio con explicacion y accion.
- Error recuperable con reintento.
- Sin conexion.
- Exito y confirmacion.
- Permiso insuficiente.

## 13. Movimiento

- Microinteracciones: 120-240 ms.
- Sin animaciones introductorias.
- Evitar movimientos que cambien el layout.
- Respetar `prefers-reduced-motion`.
- Skeletons en lugar de spinners para listados.

## 14. Accesibilidad

- Contraste WCAG AA.
- Foco visible.
- Navegacion por teclado.
- Areas tactiles de 44 x 44 px.
- Etiquetas accesibles en botones de icono.
- El color nunca es la unica senal.
- Imagenes con texto alternativo util.

## 15. Orden de implementacion

1. Tokens y componentes base. Completado.
2. Cabecera y navegacion movil. Completado.
3. Busqueda y tarjetas de producto. Completado.
4. Detalle de producto. Completado.
5. Perfil de tienda y directorio. Completado.
6. Cuenta del comprador. Completado.
7. Panel del comerciante.
8. Panel administrativo.
9. Estados, accesibilidad y responsive final.

La busqueda publica ya cuenta con filtros laterales en escritorio, filtros
desplegables en movil, dos columnas de productos en 390 px, tres columnas en
escritorio, estado sin coincidencias, paginacion y comparador sin modificar el
motor de busqueda de Supabase.

El detalle de producto ya cuenta con galeria interactiva, jerarquia clara de
precio y disponibilidad, atributos, variantes, contacto por WhatsApp, reservas,
favoritos, ubicacion, resumen de la tienda, productos relacionados y reporte de
informacion. La composicion utiliza tres zonas en escritorio y una sola columna
en movil sin inventar calificaciones, distancias ni garantias comerciales.

El perfil publico de tienda ya cuenta con portada y logo reales, identidad del
comercio, estado abierto o cerrado, contacto por WhatsApp, ruta externa,
catalogo completo, ubicacion detallada, horario semanal en formato de 12 horas y
reporte de informacion. En escritorio separa catalogo y contexto operativo; en
movil mantiene dos columnas de productos y apila la informacion sin
desbordamiento horizontal. No muestra reputacion, mapas ni estadisticas que la
plataforma todavia no pueda demostrar.

El directorio permite buscar comercios por nombre, categoria o ubicacion,
filtrar mediante categorias existentes en Supabase, limpiar filtros y recuperar
una busqueda sin coincidencias. Cada comercio presenta portada, logo o
monograma, descripcion, direccion y acciones reales para abrir la tienda,
contactar por WhatsApp o consultar la ruta. La composicion se transforma de una
fila informativa en escritorio a una tarjeta compacta y operable en movil.

La cuenta del comprador organiza su actividad en un resumen con metricas reales,
datos personales editables, busquedas recientes, favoritos, reservas, reportes y
solicitudes de privacidad. En escritorio utiliza una navegacion lateral estable;
en movil convierte el contenido en una secuencia clara y mantiene dos columnas
de favoritos cuando el ancho lo permite. Los estados de reservas y reportes usan
color y texto, y todas las acciones conservan las reglas y permisos de Supabase.
