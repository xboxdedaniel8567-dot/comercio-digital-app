export type ShellIconName =
  | "bell"
  | "boxes"
  | "chart"
  | "clipboard"
  | "grid"
  | "heart"
  | "home"
  | "map-pin"
  | "menu"
  | "package"
  | "plus"
  | "search"
  | "settings"
  | "shield"
  | "store"
  | "user"
  | "users"
  | "x";

export type ShellNavItem = {
  href: string;
  label: string;
  icon?: ShellIconName;
  group?: "Operaciones" | "Moderacion" | "Sistema";
};

export const publicMobileLinks: ShellNavItem[] = [
  { href: "/", label: "Inicio", icon: "home" },
  { href: "/buscar", label: "Buscar", icon: "search" },
  { href: "/comerciantes", label: "Cerca", icon: "map-pin" },
  { href: "/cuenta", label: "Favoritos", icon: "heart" },
  { href: "/panel/login", label: "Perfil", icon: "user" },
];

export const merchantMobileLinks: ShellNavItem[] = [
  { href: "/panel", label: "Resumen", icon: "home" },
  { href: "/panel/productos", label: "Productos", icon: "package" },
  { href: "/panel/productos/nuevo", label: "Anadir", icon: "plus" },
  { href: "/panel/reservas", label: "Reservas", icon: "clipboard" },
];

export function isShellPathActive(pathname: string, href: string, exact = false) {
  const cleanHref = href.split(/[?#]/)[0];
  if (cleanHref === "/") return pathname === "/";
  if (exact) return pathname === cleanHref;
  return pathname === cleanHref || pathname.startsWith(`${cleanHref}/`);
}

export function isExactShellLink(href: string) {
  return href === "/panel" || href === "/admin";
}

export function getActiveShellHref(pathname: string, links: ShellNavItem[]) {
  const exact = links.find((link) => link.href.split("?")[0] === pathname);
  if (exact) return exact.href;

  return links
    .filter((link) => isShellPathActive(pathname, link.href, isExactShellLink(link.href)))
    .sort((first, second) => second.href.length - first.href.length)[0]?.href ?? null;
}
