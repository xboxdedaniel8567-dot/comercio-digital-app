import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Spinner } from "./Spinner";
import { cx } from "./utils";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  loadingLabel?: string;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary" | "ghost" | "destructive" | "brand";
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    children,
    className,
    disabled,
    loading = false,
    loadingLabel = "Cargando",
    size = "md",
    type = "button",
    variant = "primary",
    ...props
  },
  ref,
) {
  return (
    <button
      {...props}
      aria-busy={loading || undefined}
      className={cx("cd-button", `cd-button-${variant}`, `cd-button-${size}`, className)}
      data-loading={loading || undefined}
      disabled={disabled || loading}
      ref={ref}
      type={type}
    >
      <span className="cd-button-content">{children}</span>
      {loading ? (
        <span className="cd-button-loading">
          <Spinner label="" size="sm" />
          <span className="cd-sr-only">{loadingLabel}</span>
        </span>
      ) : null}
    </button>
  );
});
