import { AvailabilityBadge } from "@/components/AvailabilityBadge";

type InventoryBadgeProps = {
  stock: number | null;
};

export function InventoryBadge({ stock }: InventoryBadgeProps) {
  return <AvailabilityBadge className="inventory-badge" stock={stock} />;
}
