import { getInventoryLabel, getInventoryState, type InventoryState } from "@/lib/inventory";

type AvailabilityBadgeProps = {
  stock: number | null;
  className?: string;
};

const stateClass: Record<InventoryState, string> = {
  available: "cd-availability-available",
  low: "cd-availability-low",
  out: "cd-availability-out",
  unknown: "cd-availability-unknown",
};

export function AvailabilityBadge({ className = "", stock }: AvailabilityBadgeProps) {
  const state = getInventoryState(stock);

  return (
    <span className={["cd-availability", stateClass[state], className].filter(Boolean).join(" ")} data-state={state}>
      <span aria-hidden="true" className="cd-availability-indicator" />
      {getInventoryLabel(stock)}
    </span>
  );
}
