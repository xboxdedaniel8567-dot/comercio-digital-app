export type InventoryState = "available" | "low" | "out" | "unknown";

export const LOW_STOCK_LIMIT = 3;

export function getInventoryState(stock: number | null): InventoryState {
  if (stock === null) return "unknown";
  if (stock <= 0) return "out";
  if (stock <= LOW_STOCK_LIMIT) return "low";
  return "available";
}

export function getInventoryLabel(stock: number | null) {
  const state = getInventoryState(stock);

  if (state === "out") return "Agotado";
  if (state === "low") return `Pocas unidades (${stock})`;
  if (state === "available") return `${stock} disponibles`;
  return "Disponibilidad por confirmar";
}
