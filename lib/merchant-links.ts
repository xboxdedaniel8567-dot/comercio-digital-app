import type { ShellNavItem } from "./shell-navigation";

export type MerchantLink = ShellNavItem;

export const merchantLinks: MerchantLink[] = [
  { href: "/panel", label: "Resumen", icon: "home" },
  { href: "/panel/productos", label: "Productos", icon: "package" },
  { href: "/panel/productos/nuevo", label: "Anadir producto", icon: "plus" },
  { href: "/panel/reservas", label: "Reservas", icon: "clipboard" },
  { href: "/panel/estadisticas", label: "Estadisticas", icon: "chart" },
  { href: "/panel/tienda", label: "Mi tienda", icon: "store" },
];
