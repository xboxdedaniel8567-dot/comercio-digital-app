import { forwardRef, type SelectHTMLAttributes } from "react";
import { cx } from "./utils";

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean };

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, invalid, ...props },
  ref,
) {
  return (
    <select
      {...props}
      aria-invalid={invalid || props["aria-invalid"] || undefined}
      className={cx("cd-select", className)}
      data-invalid={invalid || undefined}
      ref={ref}
    />
  );
});
