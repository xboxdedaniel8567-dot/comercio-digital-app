/** Normaliza precios de PostgREST (numeric suele llegar como string). */
export function coercePrice(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  const numeric = typeof value === "string" ? Number(value) : value;
  return Number.isFinite(numeric) ? numeric : null;
}

/** Formato de moneda seguro en SSR (Cloudflare Workers / Intl). */
export function formatPrice(
  price: string | number | null | undefined,
  currency: string | null | undefined = "COP",
): string {
  const numericPrice = coercePrice(price);
  if (numericPrice === null) return "Precio por consultar";

  const safeCurrency = currency?.trim() || "COP";
  try {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: safeCurrency,
      maximumFractionDigits: 0,
    }).format(numericPrice);
  } catch {
    return `${numericPrice.toLocaleString("es-CO")} ${safeCurrency}`;
  }
}
