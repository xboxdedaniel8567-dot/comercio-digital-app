import { getInventoryLabel, getInventoryState } from "@/lib/inventory";

type InventoryBadgeProps = {
  stock: number | null;
};

const palettes = {
  available: { bg: "var(--success-bg)", border: "var(--success-border)", color: "var(--success)", dot: "var(--success)" },
  low: { bg: "var(--warning-bg)", border: "var(--warning-border)", color: "var(--warning)", dot: "var(--warning)" },
  out: { bg: "var(--danger-bg)", border: "var(--danger-border)", color: "var(--danger)", dot: "var(--danger)" },
  unknown: { bg: "var(--bg-interactive)", border: "var(--border)", color: "var(--text-secondary)", dot: "var(--text-tertiary)" },
};

export function InventoryBadge({ stock }: InventoryBadgeProps) {
  const state = getInventoryState(stock);
  const palette = palettes[state];

  return (
    <span
      style={{
        background: palette.bg,
        border: `1px solid ${palette.border}`,
        borderRadius: "var(--radius-full)",
        color: palette.color,
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        fontSize: "0.74rem",
        fontWeight: 600,
        padding: "3px 10px",
        whiteSpace: "nowrap",
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
