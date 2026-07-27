import { getInventoryLabel, getInventoryState } from "@/lib/inventory";

type InventoryBadgeProps = {
  stock: number | null;
};

const colors = {
  available: { bg: "rgba(52, 211, 153, 0.12)", border: "rgba(52, 211, 153, 0.32)", color: "#34d399", dot: "#34d399" },
  low: { bg: "rgba(251, 191, 36, 0.12)", border: "rgba(251, 191, 36, 0.32)", color: "#fbbf24", dot: "#fbbf24" },
  out: { bg: "rgba(248, 113, 113, 0.12)", border: "rgba(248, 113, 113, 0.32)", color: "#f87171", dot: "#f87171" },
  unknown: { bg: "var(--panel-interactive)", border: "var(--line)", color: "var(--muted)", dot: "var(--subtle)" },
};

export function InventoryBadge({ stock }: InventoryBadgeProps) {
  const state = getInventoryState(stock);
  const palette = colors[state];

  return (
    <span
      style={{
        background: palette.bg,
        border: `1px solid ${palette.border}`,
        borderRadius: "999px",
        color: palette.color,
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        fontSize: "0.76rem",
        fontWeight: 600,
        padding: "4px 10px",
        width: "fit-content",
      }}
    >
      <span
        style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          background: palette.dot,
          flexShrink: 0,
        }}
      />
      {getInventoryLabel(stock)}
    </span>
  );
}
