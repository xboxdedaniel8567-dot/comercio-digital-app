# Comercio Digital Design System v1

## Principios

- **Dark Utility + Visual Commerce:** la interfaz prioriza búsqueda, comparación y operación cotidiana.
- **Densidad por rol:** cliente para explorar, comerciante para producir y administrador para controlar.
- **Claridad antes que decoración:** jerarquía, contraste y estados comprensibles tienen prioridad.
- **Evolución incremental:** las primitivas nuevas conviven con componentes anteriores mientras se migran rutas.

## Arquitectura de tokens

Los tokens viven en `styles/design-tokens.css` y siguen tres capas:

1. **Primitive:** valores crudos como `--cd-neutral-950`.
2. **Semantic:** intención, por ejemplo `--cd-color-surface-default`.
3. **Component:** decisiones compartidas como `--cd-control-height-md`.

La capa semántica permite incorporar un tema claro futuro sin cambiar los componentes.

## Color

| Uso | Token | Valor |
| --- | --- | --- |
| Fondo | `--cd-color-background-base` | `#090A0C` |
| Superficie | `--cd-color-surface-default` | `#111318` |
| Elevada | `--cd-color-surface-elevated` | `#181B21` |
| Interactiva | `--cd-color-surface-interactive` | `#20242C` |
| Texto principal | `--cd-color-text-primary` | `#F7F8FA` |
| Texto secundario | `--cd-color-text-secondary` | `#A9AFBA` |
| Marca | `--cd-color-brand-primary` | `#3B82F6` |
| Estados | `--cd-color-state-*` | azul, verde, ámbar y rojo |

## Tipografía

La familia es Geist Sans y Geist Mono, con Inter y fuentes del sistema como respaldo. Los tokens disponibles son `display`, `h1`, `h2`, `h3`, `title`, `body`, `body-sm`, `label`, `caption`, `price` y `price-lg`. Los pesos principales son 400, 500 y 600.

## Espaciado, radios y movimiento

- Espaciado: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80 y 96 px.
- Radios: 4, 6, 10, 14, 18 y full.
- Movimiento: 120, 160, 220 y 300 ms.
- Elevación: `raised` y `overlay`; las sombras expresan elevación, no decoración.
- Capas: base `0`, sticky `100`, dropdown `200`, overlay `300`, modal `400`, toast `500`.

## Primitivas disponibles

`Button`, `IconButton`, `Input`, `Textarea`, `Select`, `Field`, `FieldError`, `Badge`, `Chip`, `Skeleton`, `Alert` y `Spinner`. Se exportan desde `components/ui/index.ts`.

## Accesibilidad

- Mantener foco visible y orden de teclado lógico.
- Cada control debe tener un label persistente.
- Asociar helper y error mediante `aria-describedby`.
- Los botones solo-icono requieren `aria-label`.
- El estado disabled debe usar el atributo nativo.
- No depender únicamente del color para estados.
- Los targets táctiles principales deben alcanzar 44 por 44 px.
- Respetar `prefers-reduced-motion`.
- Objetivo mínimo: WCAG 2.2 AA.

## Reglas de uso

- Usar tokens semánticos; no hardcodear colores si ya existe un token.
- Usar la escala de spacing; no inventar distancias arbitrarias.
- Usar mensajes humanos, no errores técnicos del proveedor.
- Mantener labels aunque exista placeholder.
- Preferir composición sobre variantes específicas de una sola pantalla.

## No hacer

- No usar emojis como iconografía funcional.
- No eliminar el foco visible.
- No usar color como único indicador.
- No anidar cards sin una razón estructural.
- No introducir glassmorphism como estilo principal.
- No convertir una primitiva en un componente de negocio.
- No migrar masivamente `globals.css`; cada ruta se moverá de manera incremental.

## Component Lab

La ruta estática `/design-system` muestra tokens y estados sin conectarse a Supabase ni cargar datos reales. Sirve para revisión durante la migración y no sustituye pruebas de flujos reales.
