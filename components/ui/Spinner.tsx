import { cx } from "./utils";

type SpinnerProps = {
  className?: string;
  label?: string;
  size?: "sm" | "md";
};

export function Spinner({ className, label = "Cargando", size = "md" }: SpinnerProps) {
  return (
    <span
      aria-hidden={label ? undefined : true}
      className={cx("cd-spinner", `cd-spinner-${size}`, className)}
      role={label ? "status" : undefined}
    >
      <span className="cd-spinner-ring" />
      {label ? <span className="cd-sr-only">{label}</span> : null}
    </span>
  );
}
