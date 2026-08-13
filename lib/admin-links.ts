import type { ShellNavItem } from "./shell-navigation";

export type AdminLink = ShellNavItem;

export const adminLinks = [
  { href: "/admin", label: "Resumen", icon: "home", group: "Operaciones" },
  { href: "/admin/comercios", label: "Comercios", icon: "store", group: "Operaciones" },
  { href: "/admin/productos", label: "Productos", icon: "package", group: "Moderacion" },
  { href: "/admin/reportes", label: "Reportes", icon: "shield", group: "Moderacion" },
  { href: "/admin/privacidad", label: "Privacidad", icon: "users", group: "Sistema" },
  { href: "/admin/categorias", label: "Categorias", icon: "grid", group: "Sistema" },
  { href: "/admin/calidad", label: "Calidad", icon: "chart", group: "Sistema" },
] satisfies AdminLink[];
