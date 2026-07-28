export type MerchantLink = { href: string; label: string };

export const merchantLinks: MerchantLink[] = [
  { href: "/panel", label: "Resumen" },
  { href: "/panel/productos", label: "Productos" },
  { href: "/panel/productos/nuevo", label: "Anadir producto" },
  { href: "/panel/reservas", label: "Reservas" },
  { href: "/panel/estadisticas", label: "Estadisticas" },
  { href: "/panel/tienda", label: "Perfil del comercio" },
];
