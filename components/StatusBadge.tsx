type StatusTone = "danger" | "info" | "neutral" | "success" | "warning";

export function StatusBadge({ label, tone }: { label: string; tone: StatusTone }) {
  return <span className={`status-badge status-badge-${tone}`}>{label}</span>;
}

