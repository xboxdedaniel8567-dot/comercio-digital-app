# Shell and navigation

Phase 2 applies Design System v1 to the application frame without changing business flows.

## Public and client

- Desktop uses the shared header with brand, search, marketplace links, favorites, notifications and account destination.
- Mobile uses five destinations: Inicio, Buscar, Cerca, Favoritos and Perfil.
- Account and favorites destinations continue adapting to the current session.

## Merchant

- Desktop uses the existing productive sidebar with icons and a single active destination.
- Mobile uses Resumen, Productos, Anadir, Reservas and Mas.
- Mas opens the existing panel navigation in an accessible drawer.

## Admin

- Desktop navigation is grouped into Operaciones, Moderacion and Sistema.
- Mobile uses a compact top bar and accessible drawer.

## Accessibility

- Active destinations use `aria-current="page"` plus a visual indicator.
- Drawer interaction supports Escape, Tab focus containment and focus return.
- Navigation targets are at least 44 by 44 pixels.
- Fixed mobile navigation respects the device safe area.
- Motion is reduced when the operating system requests it.

## Icons

No icon package existed in the project. Installing `lucide-react` was attempted, but the execution environment could not access the npm registry. Shell icons are therefore centralized in `components/ShellIcon.tsx` with a consistent 24-pixel line system. This keeps icon markup out of navigation components and limits a future Lucide migration to one module.
