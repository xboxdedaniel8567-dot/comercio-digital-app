import { formatPrice } from "./format-price.ts";

export type CommercePrice = string | number | null | undefined;

export function formatCommercePrice(value: CommercePrice, currency = "COP") {
  if (typeof value === "string" && /[^\d.,\s-]/.test(value)) return value;
  return formatPrice(value, currency);
}

export function formatDistance(distanceMeters: number | null | undefined) {
  if (distanceMeters === null || distanceMeters === undefined || !Number.isFinite(distanceMeters) || distanceMeters < 0) {
    return null;
  }

  if (distanceMeters < 1_000) return `${Math.round(distanceMeters)} m`;

  const kilometers = distanceMeters / 1_000;
  return `${new Intl.NumberFormat("es-CO", {
    maximumFractionDigits: kilometers < 10 ? 1 : 0,
    minimumFractionDigits: 0,
  }).format(kilometers)} km`;
}
