import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cx } from "./utils";

type ChipProps = ButtonHTMLAttributes<HTMLButtonElement> & { selected?: boolean };

export const Chip = forwardRef<HTMLButtonElement, ChipProps>(function Chip(
  { className, selected = false, type = "button", ...props },
  ref,
) {
  return (
    <button
      {...props}
      aria-pressed={selected}
      className={cx("cd-chip", className)}
      data-selected={selected || undefined}
      ref={ref}
      type={type}
    />
  );
});
