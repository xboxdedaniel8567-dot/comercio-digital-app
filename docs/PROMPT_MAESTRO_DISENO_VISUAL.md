# Prompt maestro de diseno visual - Comercio Digital

Copiar desde la linea siguiente y pegar en una conversacion de ChatGPT con generacion de imagenes habilitada. Adjuntar tambien capturas actuales, referencias visuales y, cuando sea posible, el repositorio o los archivos principales del proyecto.

---

Actua como Director de Producto, Director de Diseno UX/UI y especialista senior en marketplaces, comercio local, accesibilidad y sistemas de diseno. Necesito que disenes la experiencia visual completa de una aplicacion real llamada **Comercio Digital**, creada por **Gregor Magnus**.

No quiero una landing page generica, una maqueta decorativa ni una copia de otra marca. Quiero las interfaces funcionales de un marketplace operativo. Debes comprender primero el producto, respetar las funciones ya construidas y proponer mejoras profesionales sin inventar capacidades que todavia no existen.

## 1. Vision del producto

Comercio Digital conecta compradores con comercios fisicos de una ciudad. Una persona busca un producto, compara alternativas, revisa disponibilidad, encuentra la direccion de la tienda y contacta al vendedor por WhatsApp antes de desplazarse.

La primera ciudad es Cali, Colombia, pero el sistema debe poder crecer a otras ciudades y paises. El objetivo empresarial es digitalizar negocios fisicos y permitir que comercios pequenos compitan con empresas mas grandes mediante catalogos, busqueda, analitica, organizacion y tecnologia.

Promesa central para el comprador: **encontrar un producto disponible cerca, sin recorrer toda la ciudad**.

Promesa central para el comerciante: **convertir su inventario fisico en una tienda digital visible y facil de administrar**.

## 2. Estado real del producto

La aplicacion ya tiene un MVP funcional con React, Next/Vinext, TypeScript, Supabase y PostgreSQL. No debes eliminar, cambiar ni ocultar flujos esenciales. Las interfaces deben representar datos reales provenientes de Supabase.

Funciones construidas:

- Marketplace publico con buscador tolerante a errores y sinonimos.
- Filtros, categorias, subcategorias, ciudad y paginacion.
- Resultados con imagen, nombre, precio en COP, tienda y disponibilidad.
- Comparador de productos.
- Pagina publica de producto con galeria, atributos, variantes, stock, tienda, WhatsApp y como llegar.
- Pagina publica de tienda con logo, portada, ubicacion detallada, horario en formato de 12 horas, estado abierto/cerrado, catalogo y WhatsApp.
- Directorio publico de comerciantes.
- Paginas SEO por ciudad y categoria.
- Cuenta de comprador con datos personales, favoritos, busquedas recientes, reservas, reportes y solicitudes de privacidad.
- Notificaciones con contador de pendientes y estados leido/no leido.
- Reservas de productos con estados pendiente, confirmada, rechazada, cancelada y completada.
- Reportes de publicaciones con respuesta administrativa.
- Registro, inicio de sesion, recuperacion y restablecimiento de contrasena.
- Registro de comerciantes y creacion de tienda pendiente de aprobacion.
- Panel del comerciante con resumen, estado de la tienda, madurez del perfil, productos, inventario, pocas unidades, agotados, contactos por WhatsApp y acciones recomendadas.
- Gestion de tienda, identidad visual, ubicacion, horarios y datos de contacto.
- Gestion de productos: crear, editar, activar, ocultar, imagenes, atributos, variantes, precios y stock.
- Gestion de reservas y estadisticas del comerciante.
- Panel administrativo con metricas, comercios, productos, categorias, calidad, reportes y solicitudes de privacidad.
- Moderacion de comercios y productos con estados y respuestas.
- Paginas legales, consentimiento versionado y tratamiento de datos.
- PWA instalable, sitemap y SEO tecnico.

Funciones futuras que pueden mencionarse en recomendaciones, pero no deben aparecer como disponibles en las pantallas actuales: pagos integrados, domicilios propios, chat interno, IA Magnus, OCR y Adaptive Business Engine avanzado.

## 3. Usuarios

Disena para cuatro perfiles:

1. **Visitante:** busca sin registrarse, explora productos y tiendas, compara y contacta por WhatsApp.
2. **Comprador registrado:** guarda favoritos, consulta historial, reserva, reporta, recibe notificaciones y administra sus datos.
3. **Comerciante:** administra una tienda y su catalogo desde celular o computador, con poca experiencia tecnica.
4. **Administrador:** verifica comercios, modera productos, resuelve reportes y privacidad, y controla la calidad del marketplace.

La interfaz del comprador debe ser rapida y visual. La del comerciante debe ser sencilla, orientada a tareas y entendible sin conocimientos tecnicos. La administrativa debe ser densa, sobria y optimizada para revisar informacion repetidamente.

## 4. Direccion visual

La identidad es oscura porque el fundador prefiere evitar grandes superficies blancas. Construye un sistema oscuro profesional, comodo y accesible:

- Fondo principal cercano al negro, pero no negro puro: `#090A0C` o equivalente.
- Superficies: grafito y gris carbon con contraste perceptible.
- Texto principal blanco suave, no blanco deslumbrante.
- Texto secundario gris claro legible.
- Acento principal distintivo y sobrio. Propone la mejor opcion entre cian, verde esmeralda o azul claro y explica tu eleccion.
- Verde para exito, disponible, confirmado y abierto.
- Amarillo o ambar para pendiente, pocas unidades y en revision.
- Rojo para error, agotado, rechazado y cancelado.
- Azul para informacion y acciones neutrales cuando corresponda.
- No uses degradados decorativos, orbes, bokeh, efectos neon excesivos ni una paleta dominada por un unico color.
- No uses tarjetas dentro de tarjetas.
- Bordes entre 0 y 8 px de radio; evita formas demasiado redondeadas.
- Usa iconos Lucide o equivalentes coherentes.
- Usa fotografia real de productos y comercios como contenido principal.
- La tipografia debe ser moderna, humana y muy legible. Recomienda una familia disponible para web.
- No uses tamanos gigantes dentro de paneles compactos.
- El espaciado debe facilitar lectura, comparacion y acciones repetidas.

La marca debe transmitir confianza local, tecnologia util, orden, cercania y capacidad de crecimiento. No debe parecer una tienda de lujo, una aplicacion bancaria ni una pagina de criptomonedas.

## 5. Principios UX obligatorios

- Mobile first, pero con version de escritorio completa.
- El comprador debe comenzar una busqueda en un maximo de tres acciones.
- El precio, la disponibilidad, la tienda y el acceso a WhatsApp deben identificarse rapidamente.
- Navegacion inferior en movil para destinos frecuentes cuando sea apropiado.
- Navegacion lateral estable para paneles de comerciante y administrador en escritorio.
- Controles tactiles de al menos 44 x 44 px.
- Estados de carga con skeletons, vacios utiles, errores claros, confirmaciones y acciones de recuperacion.
- Contraste WCAG AA, foco visible, etiquetas de formulario, navegacion por teclado y soporte para lector de pantalla.
- No dependas solamente del color para explicar un estado; combina color, texto e icono.
- Formatos locales: espanol de Colombia, precios como `$ 1.800.000`, telefonos colombianos y horario de 12 horas con `a. m.` y `p. m.`.
- Los textos deben ser claros, directos y honestos. Evita promesas exageradas.
- No muestres correos, identificadores o datos sensibles donde no sean necesarios.

## 6. Pantallas que debes disenar

Organiza las pantallas en los siguientes grupos y no omitas estados importantes.

### A. Experiencia publica

- Inicio real del marketplace con buscador protagonista, categorias, productos relevantes y comercios cercanos.
- Resultados de busqueda con filtros, orden, contador y paginacion.
- Resultado sin coincidencias y sugerencias de recuperacion.
- Categoria por ciudad.
- Comparador de productos.
- Detalle de producto con variantes y CTA de WhatsApp.
- Detalle de tienda con portada, logo, abierto/cerrado, horarios, direccion, mapa/como llegar y catalogo.
- Directorio de comerciantes.

### B. Autenticacion y comprador

- Inicio de sesion.
- Registro de comprador con aceptacion legal.
- Recuperar y restablecer contrasena.
- Mi cuenta: datos, busquedas recientes y favoritos.
- Mis reservas con estados verde, ambar, rojo y neutral segun corresponda.
- Mis reportes y respuestas.
- Centro de privacidad.
- Centro de notificaciones y contador de no leidas.

### C. Comerciante

- Registro de comerciante y creacion de tienda.
- Estado pendiente de aprobacion.
- Resumen del panel.
- Configuracion de tienda e identidad visual.
- Horarios y ubicacion.
- Lista de productos con busqueda, estado y acciones.
- Crear producto.
- Editar producto, imagenes, atributos y variantes.
- Control de stock y pocas unidades.
- Reservas recibidas.
- Estadisticas y acciones recomendadas.

### D. Administracion

- Resumen administrativo con prioridades operativas.
- Comercios pendientes, activos, rechazados y suspendidos.
- Moderacion de productos.
- Categorias y estructura de atributos.
- Reportes del marketplace.
- Calidad de publicaciones.
- Solicitudes de privacidad.

## 7. Estados que deben tener representacion visual

Para los componentes principales, disena como minimo:

- Cargando.
- Sin informacion.
- Exito.
- Error recuperable.
- Sin conexion.
- Pendiente de revision.
- Activo/aprobado.
- Oculto/inactivo.
- Rechazado/suspendido.
- Disponible, pocas unidades y agotado.
- Reserva pendiente, confirmada, rechazada, cancelada y completada.
- Notificacion leida y no leida.

## 8. Forma de trabajo obligatoria

No generes todas las imagenes de una sola vez. Sigue este proceso:

### Fase 1 - Auditoria

1. Resume en una pagina tu comprension del negocio y los usuarios.
2. Identifica problemas y oportunidades del MVP sin modificar su alcance.
3. Entrega un mapa de navegacion y una matriz de pantallas, roles, objetivos y estados.
4. Presenta decisiones profesionales y preguntas estrictamente necesarias.

### Fase 2 - Sistema visual

1. Propone dos direcciones visuales oscuras claramente diferentes.
2. Recomienda una y justifica la decision segun confianza, accesibilidad y comercio local.
3. Define colores con codigos, tipografia, escala de espaciado, bordes, iconos, botones, campos, estados, tablas, tarjetas de producto y navegacion.
4. Crea una lamina visual 1:1 del sistema de diseno.

### Fase 3 - Wireframes

1. Crea wireframes de baja fidelidad antes del acabado visual.
2. Entrega escritorio y movil para cada flujo.
3. Explica la jerarquia, la accion principal y los estados.

### Fase 4 - Interfaces finales

Genera las pantallas en lotes, manteniendo exactamente el mismo sistema visual:

1. Marketplace publico.
2. Producto y tienda.
3. Cuenta del comprador.
4. Panel del comerciante.
5. Panel administrativo.

Para cada lote, entrega primero una lamina resumen 1:1 tipo collage y despues cada pantalla por separado en alta resolucion:

- Escritorio: 1440 x 1024 px como referencia.
- Movil: 390 x 844 px como referencia.

No incrustes las pantallas dentro de marcos decorativos de dispositivos cuando se necesite evaluar la interfaz. Muestra la interfaz completa, frontal y legible.

### Fase 5 - Entrega para desarrollo

Para cada pantalla aprobada entrega:

- Nombre y ruta.
- Objetivo del usuario.
- Componentes reutilizables.
- Datos y estados necesarios.
- Comportamiento responsive.
- Interacciones y animaciones.
- Criterios de accesibilidad.
- Textos exactos en espanol.
- Criterios de aceptacion para desarrollo.

## 9. Animacion

Propone movimiento discreto y funcional:

- Duracion aproximada de 120 a 240 ms para microinteracciones.
- Aparicion de resultados sin mover bruscamente el contenido.
- Retroalimentacion de favoritos, filtros, reservas, estados y guardado.
- Skeletons para carga.
- Respeto por `prefers-reduced-motion`.
- Nada de introducciones cinematograficas ni animaciones que retrasen la compra o la administracion.

## 10. Restricciones finales

- No inventes cifras, testimonios ni negocios.
- No prometas ventas garantizadas.
- No conviertas la primera pantalla en publicidad de Gregor Magnus; debe ser el marketplace util.
- No copies literalmente Apple, Mercado Libre, Amazon, Shopify u otra marca. Puedes estudiar sus patrones, pero crea una identidad propia.
- No reemplaces WhatsApp por un chat interno.
- No agregues carrito ni pagos como si ya existieran.
- No ocultes informacion critica detras de efectos visuales.
- No uses lorem ipsum. Escribe contenido realista en espanol colombiano.
- Si recibes capturas actuales o archivos del repositorio, analizalos antes de proponer cambios.
- Senala claramente que recomendaciones pertenecen a una fase futura.

Comienza ahora solamente con la **Fase 1: Auditoria**. No generes aun las interfaces finales. Al terminar, espera mi aprobacion para continuar con la Fase 2.

---

Fin del prompt maestro.
