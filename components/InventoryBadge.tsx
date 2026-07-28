import { getInventoryLabel, getInventoryState } from "@/lib/inventory";

type InventoryBadgeProps = {
  stock: number | null;
};

const toneClass: Record<string, string> = {
  available: "inventory-badge-available",
  low: "inventory-badge-low",
  out: "inventory-badge-out",
  unknown: "inventory-badge-unknown",
};

export function InventoryBadge({ stock }: InventoryBadgeProps) {
  const state = getInventoryState(stock);
  return (
    <span className={`inventory-badge ${toneClass[state]}`}>
      <span className="inventory-badge-dot" aria-hidden="true" />
      {getInventoryLabel(stock)}
    </span>
  );
}
