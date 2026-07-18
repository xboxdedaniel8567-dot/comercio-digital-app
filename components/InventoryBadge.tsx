import { getInventoryLabel, getInventoryState } from "@/lib/inventory";

type InventoryBadgeProps = {
  stock: number | null;
};

const colors = {
  available: { border: "#166534", color: "#86efac" },
  low: { border: "#a16207", color: "#fde047" },
  out: { border: "#991b1b", color: "#fca5a5" },
  unknown: { border: "var(--line)", color: "var(--muted)" },
};

export function InventoryBadge({ stock }: InventoryBadgeProps) {
  const state = getInventoryState(stock);
  const palette = colors[state];

  return (
    <span
      style={{
        border: `1px solid ${palette.border}`,
        color: palette.color,
        display: "inline-flex",
        fontSize: "0.78rem",
        fontWeight: 700,
        padding: "5px 8px",
        width: "fit-content",
      }}
    >
      {getInventoryLabel(stock)}
    </span>
  );
}
